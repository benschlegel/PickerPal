import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { stringify, updateUserbase } from '../functions';
import { CreateChoice } from '../utils/DBTypes';
import { choiceRow1, choiceRow2 } from '../components/buttons';
import { OriginalPollEmbed } from '../components/embeds';
import { SlashCommand } from '../types';
import { createChoice } from '../utils/databaseAcces';


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
				.setDescription('Name of the choice. (e.g: \'What should i cook?\')')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName(optionYesNo)
				.setDescription('True, if the poll doesnt have options and is only a "yes" or "no" question. (defaults to false)')
				.setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction) {
		// Show the modal to the user
		// interaction.showModal(modal);
		const title = interaction.options.get(optionName)?.value as string;
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);

		console.log('level=trace command="/makeChoice" userId=' + commandUserId + ' username="' + interaction.user.username + '"');

		const choiceEmbed = EmbedBuilder.from(OriginalPollEmbed)
			.addFields(
				{ name: '📊 Prompt', value: title ?? 'no name provided' },
				{ name: '\u200B', value: '\u200B' },
				{ name:  'Choices', value: '⚡ *(add options to get started)*' })
			.setTimestamp(new Date())
		;


		interaction.reply({
			embeds: [
				choiceEmbed,
			],
			components: [choiceRow1, choiceRow2],
			fetchReply: true,
		}).catch(err => {
			console.log('level=error command="/makeChoice" error="' + stringify(err) + '"');
		}).then(async (msg) => {
			if (!msg) {
				console.log('level=error command="/makeChoice" error="Resulting interaction reply message is void"');
				return;
			}
			const choice: CreateChoice = { _id: msg.id, choiceTitle: title, ownerId: commandUserId };
			await createChoice(choice);
		});
	},
};

export default command;
