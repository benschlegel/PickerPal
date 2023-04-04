import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import { stringify, updateUserbase } from '../functions';
import { CreateChoice } from '../utils/DBTypes';
import { choiceRow1, choiceRow2 } from '../components/buttons';
import { OriginalPollEmbed } from '../components/embeds';
import { SlashCommand } from '../types';
import { addYesNoChoices, createChoice } from '../utils/databaseAcces';
import { promNumRequests } from '../monitoring/prometheus';
import { makeYesNoChoice } from '../utils/makeYesNoChoice';


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
				.setDescription('Name of the choice. (e.g: \'What should i cook?\')')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName(optionYesNo)
				.setDescription('True, if the poll doesnt have options and is only a "yes" or "no" question. (defaults to false)')
				.setRequired(false)),


	async execute(interaction: ChatInputCommandInteraction) {
		// Update prometheus counter
		promNumRequests.inc({ makeChoice: 1 });

		// Get interaction values
		const title = interaction.options.getString(optionName, true);
		const useYesNoOption = interaction.options.getBoolean(optionYesNo);
		const commandUserId = interaction.user.id;
		updateUserbase(commandUserId);

		console.log('level=trace command="/makeChoice" userId=' + commandUserId + ' username="' + interaction.user.username + '"');

		// Create new embed using values from interaction
		const choiceEmbed = EmbedBuilder.from(OriginalPollEmbed)
			.addFields(
				{ name: '📊 Prompt', value: title ?? 'no name provided' },
				{ name: '\u200B', value: '\u200B' },
				{ name:  'Choices', value: '⚡ *(add options to get started)*' })
			.setTimestamp(new Date())
		;

		let components: InteractionReplyOptions['components'] = [choiceRow1, choiceRow2];
		if (useYesNoOption) {
			// create embed
			const yesNoEmbed = makeYesNoChoice(title);
			choiceEmbed.setFields(yesNoEmbed.data.fields!);

			// clear components
			components = [];
		}
		// Send reply with embed and buttons (components)
		interaction.reply({
			embeds: [
				choiceEmbed,
			],
			components: components,
			fetchReply: true,
		}).catch(err => {
			console.log('level=error command="/makeChoice" error="' + stringify(err) + '"');
		}).then(async (msg) => {
			if (!msg) {
				console.log('level=error command="/makeChoice" error="Resulting interaction reply message is void"');
				return;
			}

			// Create new choice
			const choice: CreateChoice = { _id: msg.id, choiceTitle: title, ownerId: commandUserId, rerollAmount: 0 };
			await createChoice(choice);

			// Check if yesNoOption is set and add, if it is
			if (useYesNoOption) {
				await addYesNoChoices(msg.id);
			}
		});
	},
};

export default command;
