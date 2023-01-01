import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { backgroundColor } from '../constants';
import { SlashCommand } from '../types';

// Name of options
const optionName = 'name';
const optionYesNo = 'is-yes-no-choice';

const row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('primary')
			.setLabel('Click me!')
			.setStyle(ButtonStyle.Primary),
	);

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
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('📊 ' + (interaction.options.get(optionName)?.value as string ?? 'no name provided')) // realistically doesnt need default value but just in case
					.setDescription('⚡ *(add options to get)*')
					.setColor(backgroundColor)
					.setTimestamp(new Date()),
			],
			components: [row],
		});
	},
};


export default command;
