import { SlashCommandBuilder, EmbedBuilder, ChannelType, AllowedMentionsTypes, Role } from 'discord.js';
import { SlashCommand } from '../types';
import { randomEntriesFromArray, stringify, updateUserbase } from '../functions';
import { promNumRequests } from '../monitoring/prometheus';
import { OriginalPollEmbed } from '../components/embeds';

const roleOption = 'role';
const sizeOption = 'size';
const titleOption = 'title';

const min_size = 2;

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('pick-group')
		.setDescription('Picks members for a group from a role (set "title" for title of choice/group)')
		.addRoleOption(option =>
			option
				.setRequired(true)
				.setDescription('Which role to pick group from')
				.setName(roleOption),
		)
		.addIntegerOption(option =>
			option
				.setMinValue(2)
				.setRequired(false)
				.setName(sizeOption)
				.setDescription('How many people to choose for group (e.g. "2" will choose 2 people from selected role)'),
		)
		.addStringOption(option =>
			option
				.setName(titleOption)
				.setDescription('Title for this group (e.g. "who is on team blue?")')
				.setRequired(false),
		),
	async execute(interaction) {
		// Prometheus
		promNumRequests.inc({ pickGroup: 1 });
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);
		console.log('level=trace command="/pick-group" userId=' + commandUserId + ' username="' + interaction.user.username + '"');

		// Fetch members to be able to get role.members accurately
		await interaction.guild?.members.fetch();

		// Get options
		const role = interaction.options.getRole(roleOption, true) as Role;
		const pickOriginal = interaction.options.getInteger(sizeOption);
		console.log('size: ' + pickOriginal);
		console.log('role size: ' + role.members.size);
		const title = interaction.options.getString(titleOption);

		// Get member ids from VoiceChannel
		const members = role.members.map(m => m.id);
		console.log('members: ' + members);

		// Send error if no members in voice channel
		if (members.length === 0) {
			await interaction.reply({ content: ':warning: There are currently no members in the selected voice channel. Only works if there are people in selected voice channel.', ephemeral: true });
			return;
		}

		// Set pick amount (defaults to 1, if 'picks' is set via options, set to min between 'picks' option and number of people in voice channel [so no invalid state can be reached if picks is higher than members.length])
		const pickAmount = pickOriginal ? Math.min(pickOriginal, members.length) : min_size;

		console.log('pick amount: ' + pickAmount);

		// Randomly pick
		const resultPicks = randomEntriesFromArray(pickAmount, members);

		// Construct embed
		const headerMessage = '<@' + commandUserId + '> started pick for <@&' + role.id + '>.';
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
			console.log('level=error command="/pick-group" error="' + stringify(err) + '"');
		});
	},
};


export default command;
