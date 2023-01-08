import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder } from 'discord.js';
import { choiceRow1, choiceRow2 } from '../components/buttons';
import { OriginalPollEmbed } from '../components/embeds';
import { SlashCommand } from '../types';

// Name of options
const optionName = 'name';
const optionYesNo = 'is-yes-no-choice';

// Create the modal
const modal = new ModalBuilder()
	.setCustomId('myModal')
	.setTitle('My Modal');

// Add components to modal

// Create the text input components
const favoriteColorInput = new TextInputBuilder()
	.setCustomId('favoriteColorInput')
	// The label is the prompt the user sees for this input
	.setLabel('What\'s your favorite color?')
	// Short means only a single line of text
	.setStyle(TextInputStyle.Short);

const hobbiesInput = new TextInputBuilder()
	.setCustomId('hobbiesInput')
	.setLabel('What\'s some of your favorite hobbies?')
	// Paragraph means multiple lines of text.
	.setStyle(TextInputStyle.Paragraph);

// An action row only holds one text input,
// so you need one action row per text input.
const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteColorInput);
const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(hobbiesInput);

// Add inputs to the modal
modal.addComponents(firstActionRow, secondActionRow);

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('make-choice')
		.setDescription('Creates a new choice board.')
		.addStringOption(option =>
			option
				.setName(optionName)
				.setDescription('Name of the choice.')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName(optionYesNo)
				.setDescription('True, if the poll doesnt have options and is only a "yes" or "no" question. (defaults to false)')
				.setRequired(false))
		.addMentionableOption(option =>
			option
				.setName('mention')
				.setDescription('Testing mention')
				.setRequired(false)),
	async execute(interaction: any) {
		// Show the modal to the user
		// interaction.showModal(modal);
		interaction.reply({
			embeds: [
				OriginalPollEmbed
					.setTitle('📊 ' + (interaction.options.get(optionName)?.value as string ?? 'no name provided')) // realistically doesnt need default value but just in case
					.setTimestamp(new Date()),
			],
			components: [choiceRow1, choiceRow2],
		});
	},
};


export default command;
