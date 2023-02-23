// Require the necessary discord.js classes
import { ActionRowBuilder, APIEmbed, APIEmbedField, Client, Collection, EmbedBuilder, Events, GatewayIntentBits, InteractionType, JSONEncodable, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Choice } from './utils/DBTypes';
import { addChoice, clearChoices, deleteOldPolls, getChoices, getFullChoice, setChoice } from './utils/databaseAcces';
import { getEmojiFromIndexWithChoice, randomIntFromInterval, stringify } from './functions';
import { commandHandler } from './handlers/command';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// Intervals
let checkAliveInterval = 30 * 1000;
const deleteInterval = (60 * 60 * 1000);
// Deletes all polls that are finished once per hour
setInterval(deleteOldPolls, deleteInterval);
setInterval(checkAliveAndRestart, checkAliveInterval);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`level=info msg="Ready! Logged in as ${c.user.tag}"`);
	client.user?.setActivity('/make-choice');
});

// load commands
client.slashCommands = new Collection<string, SlashCommand>();

// load handlers
commandHandler(client);

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		if (interaction.customId === 'add-text-choice' as ButtonCustomID) {
			// Database vars
			const messageId = interaction.message?.id as string;
			const fullChoice = await getFullChoice(messageId);

			// Dont reroll choice if already complete
			if (fullChoice?.isComplete === true) {
				await interaction.reply({ content: ':warning: Choice has already been decided, start a new one to add choices.\n:x: Did not complete action.', ephemeral: true });
				return;
			}
			const modal = new ModalBuilder()
				.setCustomId('text-option-modal' as ModalCustomID)
				.setTitle('Add new choice...')
				.addComponents([
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('verification-input')
							.setLabel('Choice:')
							.setStyle(TextInputStyle.Short)
							.setPlaceholder('New choice...')
							.setValue('')
							.setRequired(true),
					),
				]);

			await interaction.showModal(modal);
		}
		else if (interaction.customId === 'yes-no-choice' as ButtonCustomID) {
			// Database access
			const messageId = interaction.message?.id as string;
			const yesChoice: Choice = { updateId: messageId, name: 'yes' };
			const noChoice: Choice = { updateId: messageId, name: 'no' };
			await clearChoices(messageId);
			await addChoice(yesChoice);
			await addChoice(noChoice);
			const choices = await getChoices(messageId) as string[];
			const fullChoice = await getFullChoice(messageId);
			const choiceTitle = fullChoice?.choiceTitle as string;

			// Dont reroll choice if already complete
			if (fullChoice?.isComplete === true) {
				await interaction.reply({ content: ':warning: Choice has already been decided, start a new one if you want to reroll.\n:x: Did not complete action.', ephemeral: true });
				return;
			}
			// TODO: refactor duplicate code
			// Build new embed
			// Fill in static fields
			const newFields: APIEmbedField[] = [
				{ name: '\u200B', value: '\u200B' },
				{ name: '📊 Prompt', value: choiceTitle },
				{ name: '\u200B', value: '\u200B' },
			];

			// Add choices ✅ ❌
			for (let i = 0; i < choices.length; i++) {
				newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
			}

			// Get old embed
			const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
			const choiceEmbed = EmbedBuilder.from(receivedEmbed);
			interaction.message?.edit({
				embeds: [
					choiceEmbed
						.setDescription('*⚡ click "Make choice" button to start decision*')
						.setFields([])
						.addFields(
							newFields,
						),
				],
			});
			interaction.deferUpdate();
		}
		else if (interaction.customId === 'start-choice' as ButtonCustomID) {
			// Database access
			const messageId = interaction.message?.id as string;
			const choices = await getChoices(messageId) as string[];
			const fullChoice = await getFullChoice(messageId);
			if (!fullChoice) {
				return;
			}
			// Send error message if no choices have been added
			if (choices.length === 0) {
				await interaction.reply({ content: ':warning: Can\'t make choice without options, add choice to get started.\n:x: Did not complete action.', ephemeral: true });
				return;
			}

			// Send error message if there's not enough options
			if (choices.length < 2) {
				await interaction.reply({ content: ':warning: Add at least 2 options to make decision.\n:x: Did not complete action.', ephemeral: true });
				return;
			}

			// Dont reroll choice if already complete
			if (fullChoice?.isComplete === true) {
				await interaction.reply({ content: ':warning: Choice has already been decided, start a new one if you want to reroll.\n:x: Did not complete action.', ephemeral: true });
				return;
			}
			const choiceTitle = fullChoice?.choiceTitle as string;

			// Fill in static fields
			const newFields: APIEmbedField[] = [
				{ name: '\u200B', value: '\u200B' },
				{ name: '📊 Prompt', value: choiceTitle },
				{ name: '\u200B', value: '\u200B' },
			];

			// Add choices
			for (let i = 0; i < choices.length; i++) {
				newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
			}


			const winningChoiceIndex = randomIntFromInterval(0, choices.length - 1);
			const finalChoice = choices[winningChoiceIndex];

			// Add fields for decision
			newFields.push({ name: '\u200B', value: '\u200B' });
			newFields.push({ name: '⚡ Final Decision', value: getEmojiFromIndexWithChoice(winningChoiceIndex, finalChoice) + ' ' + finalChoice });

			// Set database entries
			fullChoice!.isComplete = true;
			fullChoice!.finalChoice = finalChoice;
			await setChoice(messageId, fullChoice!);
			// Get old embed
			const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
			const choiceEmbed = EmbedBuilder.from(receivedEmbed);
			interaction.message?.edit({
				embeds: [
					choiceEmbed
						.setDescription(':warning: *This choice has been decided.*')
						.setFields([])
						.addFields(
							newFields,
						),
				],
				components: [],
			});
			interaction.deferUpdate();
		}
	}

	// TODO: fix polls in private chat
	// TODO: only let author edit poll
	// TODO: add uniform error response handler

	// Gets executed after modal submit
	if (interaction.type === InteractionType.ModalSubmit) {
		if (interaction.customId === 'text-option-modal' as ModalCustomID) {
			// Response from modal input field
			const response = interaction.fields.getTextInputValue('verification-input');

			// Database access
			const messageId = interaction.message?.id as string;
			const newChoice: Choice = { updateId: messageId, name: response };
			await addChoice(newChoice);
			const choices = await getChoices(messageId) as string[];
			const fullChoice = await getFullChoice(messageId);
			const choiceTitle = fullChoice?.choiceTitle as string;
			// Fill in static fields
			const newFields: APIEmbedField[] = [
				{ name: '\u200B', value: '\u200B' },
				{ name: '📊 Prompt', value: choiceTitle },
				{ name: '\u200B', value: '\u200B' },
			];

			// Add choices
			for (let i = 0; i < choices.length; i++) {
				newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
			}

			// Get old embed
			const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
			const choiceEmbed = EmbedBuilder.from(receivedEmbed)
				.setDescription('*⚡ click "Make choice" button to start decision*')
				.setFields([])
				.addFields(
					newFields,
				);

			// Edit original message
			interaction.message?.edit({
				embeds: [
					choiceEmbed,
				],
			});

			// Modal doesnt close unless defer update gets called
			interaction.deferUpdate();
		}
	}
	if (!interaction.isCommand()) return;

	const command = client.slashCommands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Log in to Discord with your client's token
client.login(process.env['TOKEN']);


// Maybe move this to /intervalFunctions, see if exporting client works (+ find way to change checkAliveInterval)
function checkAliveAndRestart() {
	console.log('level=trace msg="last alive at" data="' + client.readyAt?.toLocaleString() + '"');

	const shard0 = client.ws.shards.get(0);
	if (shard0) {
		const lastPingDate = new Date(shard0.lastPingTimestamp);
		console.log('level=trace msg="last ping date" data="' + lastPingDate.toLocaleString() + '"');
	}
	else {
		console.log('level=error msg="could not get shard 0.');

		client.destroy();
		console.log('level=info msg="destroyed client (shard0)."');
		// Attempt to restart client
		client.login(process.env['TOKEN']).catch((err) => {
			console.log('level=error msg="failed to reconnect!" error="' + stringify(err) + '"');
		}).then(() => {
			console.log('level=info msg="successfully reconnected! (shard0)"');
		});
	}
	// fetching a random guild to see if the bot is still connected, if this results in an error => bot is dead 🕯️
	client.fetchGuildPreview('1058787785030500492').catch((error) => {
		// Set interval to keep checking every 5 seconds
		checkAliveInterval = 5000;

		// Logging
		console.log('level=error msg="bot disconnected!" error="' + stringify(error) + '"');

		// client.destroy();
		// console.log('level=info msg="destroyed client."');
		// console.log('level=info msg="attempting to reconnect..."');
		console.log('level=info msg="stopping process..."');
		process.exit(1);
		// Attempt new login, log depending on success
		// client.login(process.env['TOKEN']).catch((err) => {
		// 	console.log('level=error msg="failed to reconnect!" error="' + stringify(err) + '"');
		// }).then(() => {
		// 	console.log('level=info msg="successfully reconnected!"');
		// });
	}).then(() => {
		// Logging
		console.log('level=debug msg="still alive!" localTime="' + new Date().toLocaleString() + '"');
		// If bot is alive, reset check time back to 30 seconds
		checkAliveInterval = 30 * 1000;
	});
}

