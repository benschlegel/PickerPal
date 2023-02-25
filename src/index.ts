// Require the necessary discord.js classes
import { APIEmbed, APIEmbedField, Client, Collection, EmbedBuilder, Events, GatewayIntentBits, IntentsBitField, InteractionType, JSONEncodable, Partials } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { Choice } from './utils/DBTypes';
import { addChoice, deleteOldPolls, getChoices, getFullChoice, getUserbaseSize } from './utils/databaseAcces';
import { getEmojiFromIndexWithChoice, stringify } from './functions';
import { commandHandler } from './handlers/command';
import { addTextChoice } from './buttonEvents/addTextChoice';
import { yesNoChoice } from './buttonEvents/yesNoChoice';
import { startChoice } from './buttonEvents/startChoice';
import { server } from './monitoring/startFastify';
import { uptimeGauge, userbaseGauge } from './monitoring/prometheus';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// Intervals
let checkAliveInterval = 30 * 1000;
const deleteInterval = (60 * 60 * 1000);
// Deletes all polls that are finished once per hour
setInterval(deleteOldPolls, deleteInterval);
setInterval(checkAliveAndRestart, checkAliveInterval);

// Create a new client instance
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.DirectMessageReactions], partials: [Partials.Channel] });

console.log('level=trace msg="Fastify server is up." server="' + stringify(server) + '"');

getUserbaseSize().then((res) => {
	const arr = res.toArray();
	arr.then((doc) => {
		const size = doc[0]['size'];
		userbaseGauge.set(size);
	});
});

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
			await addTextChoice(interaction);
		}
		else if (interaction.customId === 'yes-no-choice' as ButtonCustomID) {
			await yesNoChoice(interaction);
		}
		else if (interaction.customId === 'start-choice' as ButtonCustomID) {
			await startChoice(interaction);
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
		await command.execute(interaction as any);
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

	// Set uptime
	if (client.uptime) {
		uptimeGauge.set(client.uptime);
	}
	else {
		// If no uptime found, set to 0
		uptimeGauge.set(0);
	}

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

