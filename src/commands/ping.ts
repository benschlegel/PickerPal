import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../utils/constants';
import { SlashCommand } from '../types';
import { stringify, updateUserbase } from '../functions';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Shows the bot\'s ping'),
	async execute(interaction) {
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);

		console.log('level=trace command="/ping" userId=' + commandUserId + ' username="' + interaction.user.username + '"');
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'Bot ping' })
					.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
					.setColor(backgroundColor),
			],
		}).catch(err => {
			console.log('level=error command="/makeChoice" error="' + stringify(err) + '"');
		});
	},
};


export default command;
