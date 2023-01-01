import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../constants';
import { SlashCommand } from '../types';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Shows the bot\'s ping'),
	async execute(interaction) {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'Bot ping' })
					.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
					.setColor(backgroundColor),
			],
		});
	},
};


export default command;
