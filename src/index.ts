// Require the necessary discord.js classes
import { ActionRowBuilder, Client, Collection, Events, GatewayIntentBits, InteractionType, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { readdirSync } from 'fs';
import { join } from 'path';
import { OriginalPollEmbed } from './components/embeds';
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
							.setMaxLength(12)
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

	if (interaction.type === InteractionType.ModalSubmit) {
		if (interaction.customId === 'text-option-modal' as ModalCustomID) {
			const response =
        interaction.fields.getTextInputValue('verification-input');
			const oldDescription = interaction.message?.embeds[0].description;
			console.log(oldDescription);
			interaction.message?.edit({
				embeds: [
					OriginalPollEmbed
						.setDescription('.')
						.addFields({ name: 'Choice', value: ':one:' + '    ' + response }),
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
