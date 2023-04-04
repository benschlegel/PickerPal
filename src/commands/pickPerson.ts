import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { SlashCommand } from '../types';
import { randomEntriesFromArray, stringify, updateUserbase } from '../functions';
import { promNumRequests } from '../monitoring/prometheus';
import { OriginalPollEmbed } from '../components/embeds';

const channelOption = 'channel';
const pickOption = 'picks';
const titleOption = 'title';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('pick-people')
		.setDMPermission(false)
		.setDescription('Picks a random person from a voice channel (set "picks" argument to pick multiple people)')
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
		)
		.addStringOption(option =>
			option
				.setName(titleOption)
				.setDescription('Title for this pick (e.g. "who is on team blue?")')
				.setRequired(false),
		),
	async execute(interaction) {
		// Prometheus
		promNumRequests.inc({ pickPerson: 1 });
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);
		console.log('level=trace command="/pick-person" userId=' + commandUserId + ' username="' + interaction.user.username + '"');

		// Get options
		const channel = interaction.options.getChannel(channelOption, true, [ChannelType.GuildVoice]);
		const pickOriginal = interaction.options.getInteger(pickOption);
		const title = interaction.options.getString(titleOption);

		// Get member ids from VoiceChannel
		const members = channel.members.map(m => m.id);

		// Send error if no members in voice channel
		if (members.length === 0) {
			await interaction.reply({ content: ':warning: There are currently no members in the selected voice channel. Only works if there are people in selected voice channel.', ephemeral: true });
			return;
		}

		// Set pick amount (defaults to 1, if 'picks' is set via options, set to min between 'picks' option and number of people in voice channel [so no invalid state can be reached if picks is higher than members.length])
		const pickAmount = pickOriginal ? Math.min(pickOriginal, members.length) : 1;

		// Randomly pick
		const resultPicks = randomEntriesFromArray(pickAmount, members);

		// Construct embed
		const headerMessage = '<@' + commandUserId + '> started pick for <#' + channel.id + '>.';
		let resultMessage = '';

		for (const user of resultPicks) {
			resultMessage += '- <@' + user + '>\n';
		}

		// Basic embed
		const embed = EmbedBuilder.from(OriginalPollEmbed)
			.addFields(
				{ name: '🎲 Picks', value: headerMessage },
				{ name: '\u200B', value: '\u200B' },
			)
			.setTimestamp(new Date())
			.setAuthor(null);

		// Add title if it exists
		if (title) {
			embed.addFields(
				{ name: '📜 Title', value: title },
				{ name: '\u200B', value: '\u200B' },
			);
		}

		// Add results
		embed.addFields({ name:  '⚡ Choices', value: resultMessage });
		await interaction.reply({
			embeds: [
				embed,
			],
		}).catch(err => {
			console.log('level=error command="/pick-person" error="' + stringify(err) + '"');
		});
	},
};


export default command;
