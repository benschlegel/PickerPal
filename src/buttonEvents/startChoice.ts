/* eslint-disable no-mixed-spaces-and-tabs */
import { APIEmbedField, ButtonInteraction, CacheType, EmbedBuilder } from 'discord.js';
import { getEmojiFromIndexWithChoice, randomIntFromInterval } from '../functions';
import { getChoices, getFullChoice, isUserChoiceOwner, setChoice } from '../utils/databaseAcces';
import { rerollRow } from '../components/buttons';

// How many choices are required before you can start
const minChoices = 2;

export async function startChoice(interaction: ButtonInteraction<CacheType>) {
	// Database access
	const messageId = interaction.message?.id;
	const commandUserId = interaction.user.id;

	const isOwner = await isUserChoiceOwner(messageId, commandUserId);
	if (!isOwner) {
		interaction.reply({ content: ':x: You did not create this choice.', ephemeral: true });
		return;
	}

	const choices = await getChoices(messageId) as string[];
	const fullChoice = await getFullChoice(messageId);
	if (!fullChoice) {
		await interaction.reply({ content: ':warning: Choice not found.', ephemeral: true });
		return;
	}
	// Send error message if no choices have been added
	if (choices.length === 0) {
		await interaction.reply({ content: ':warning: Can\'t make choice without options, add choice to get started.\n:x: Did not complete action.', ephemeral: true });
		return;
	}

	// Send error message if there's not enough options
	if (choices.length < minChoices) {
		await interaction.reply({ content: ':warning: Add at least ' + minChoices + ' options to make decision.\n:x: Did not complete action.', ephemeral: true });
		return;
	}

	// Dont reroll choice if already complete
	if (fullChoice?.isComplete === true) {
		await interaction.reply({ content: ':warning: Choice has already been decided, start a new one if you want to reroll.\n:x: Did not complete action.', ephemeral: true });
		return;
	}
	const choiceTitle = fullChoice?.choiceTitle as string;

	// Fill in static fields
	const newFields: APIEmbedField[] = [
		{ name: '\u200B', value: '\u200B' },
		{ name: '📊 Prompt', value: choiceTitle },
		{ name: '\u200B', value: '\u200B' },
	];

	// Add choices
	for (let i = 0; i < choices.length; i++) {
		newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
	}


	const winningChoiceIndex = randomIntFromInterval(0, choices.length - 1);
	const finalChoice = choices[winningChoiceIndex];

	// Add fields for decision
	newFields.push({ name: '\u200B', value: '\u200B' });
	newFields.push({ name: '⚡ Final Decision', value: getEmojiFromIndexWithChoice(winningChoiceIndex, finalChoice) + ' ' + finalChoice });

	// Update database entries
	fullChoice.currentChoice = finalChoice;
	await setChoice(messageId, fullChoice);

	// Get old embed
	const receivedEmbed = interaction.message?.embeds[0];
	const choiceEmbed = EmbedBuilder.from(receivedEmbed);
	interaction.message?.edit({
  	embeds: [
  		choiceEmbed
  			.setDescription(':warning: *This choice has been decided.*')
  			.setFields([])
  			.addFields(
  				newFields,
  			),
  	],
  	components: [rerollRow],
	});
	interaction.deferUpdate();
}
