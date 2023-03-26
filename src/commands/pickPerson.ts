import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { backgroundColor } from '../utils/constants';
import { SlashCommand } from '../types';
import { randomEntriesFromArray, stringify, updateUserbase } from '../functions';
import { promNumRequests } from '../monitoring/prometheus';

const channelOption = 'channel';
const pickOption = 'picks';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('pick-person')
		.setDescription('Picks a random person from a voice channel (set "picks" for multiple)')
		.addChannelOption(option =>
			option
				.setRequired(true)
				.setDescription('Which channel to pick from')
				.setName(channelOption)
				.addChannelTypes(ChannelType.GuildVoice),
		)
		.addIntegerOption(option =>
			option
				.setMinValue(1)
				.setRequired(false)
				.setName(pickOption)
				.setDescription('How many people to choose (e.g. "2" will choose 2 people from selected voice channel)'),
		),
	async execute(interaction) {
		// Prometheus
		promNumRequests.inc({ ping: 1 });
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);

		// Get options
		const channel = interaction.options.getChannel(channelOption, true, [ChannelType.GuildVoice]);
		const pickOriginal = interaction.options.getInteger(pickOption);
		const pickAmount = pickOriginal ? pickOriginal : 1;

		// Get member ids from VoiceChannel
		const members = channel.members.map(m => m.id);

		// Randomly pick
		// const test = ['229895364147281920', '162948428316278785', '1073523890439073852', '1014094725093019698'];
		const resultPicks = randomEntriesFromArray(pickAmount, members);
		console.log('Result: ', resultPicks);

		console.log('level=trace command="/pick-person" userId=' + commandUserId + ' username="' + interaction.user.username + '"');
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'Bot ping' })
					.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
					.setColor(backgroundColor),
			],
		}).catch(err => {
			console.log('level=error command="/pick-person" error="' + stringify(err) + '"');
		});
	},
};


export default command;
