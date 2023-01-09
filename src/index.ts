// Require the necessary discord.js classes
import { ActionRowBuilder, APIEmbed, APIEmbedField, Client, Collection, EmbedBuilder, Events, GatewayIntentBits, InteractionType, JSONEncodable, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { readdirSync } from 'fs';
import { join } from 'path';
import { OriginalPollEmbed } from './components/embeds';
import { Choice } from './utils/DBTypes';
import { addChoice, getChoices, getFullChoice } from './utils/databaseAcces';
import { getEmojiFromIndex } from './functions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// load commands
client.slashCommands = new Collection<string, SlashCommand>();

// load handlers
const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach(handler => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require(`${handlersDir}/${handler}`)(client);
});

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		if (interaction.customId === 'add-text-choice' as ButtonCustomID) {
			const modal = new ModalBuilder()
				.setCustomId('text-option-modal' as ModalCustomID)
				.setTitle('Verify yourself')
				.addComponents([
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('verification-input')
							.setLabel('Answer')
							.setStyle(TextInputStyle.Short)
							.setMinLength(4)
							.setPlaceholder('ABCDEF')
							.setValue('')
							.setRequired(true),
					),
				]);

			await interaction.showModal(modal);
		}
		else if (interaction.customId === 'yes-no-choice' as ButtonCustomID) {
			interaction.message?.edit({
				embeds: [
					OriginalPollEmbed
						.setDescription('\u200B:one: yes\n\n:two: no'),
				],
			});
			interaction.deferUpdate();
		}
	}

	// TODO: only let author edit poll

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
			console.log('Selected choices: ', choices);
			const fullChoice = await getFullChoice(messageId);
			const choiceTitle = fullChoice?.choiceTitle as string;

			const newFields: APIEmbedField[] = [
				{ name: '\u200B', value: '\u200B' },
				{ name: '📊 Prompt', value: choiceTitle },
				{ name: '\u200B', value: '\u200B' },
			];

			for (let i = 0; i < choices.length; i++) {
				newFields.push({ name: getEmojiFromIndex(i) + ' Choice', value: choices[i], inline: true });
			}
			// console.log(getEmojiFromIndex(11));

			// Get old embed
			const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
			const choiceEmbed = EmbedBuilder.from(receivedEmbed)
				.setDescription('*⚡ click "Make choice" to start decision*')
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
