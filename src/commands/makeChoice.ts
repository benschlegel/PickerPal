import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../constants';
import { SlashCommand } from '../types';

// Name of options
const optionName = 'name';
const optionYesNo = 'is-yes-no-choice';

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
				.setRequired(false)),
	async execute(interaction) {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: interaction.options.get(optionName)?.value as string ?? 'no name provided' }) // realistically doesnt need default value but just in case
					.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
					.setColor(backgroundColor),
			],
		});
	},
};


export default command;
