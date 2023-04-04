import { APIEmbedField, ButtonInteraction, CacheType, EmbedBuilder } from 'discord.js';
import { rerollRow } from '../components/buttons';
import { getEmojiFromIndexWithChoice, randomIntFromInterval } from '../functions';
import { getChoices, getFullChoice, isUserChoiceOwner } from '../utils/databaseAcces';

export async function rerollChoice(interaction: ButtonInteraction<CacheType>) {
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

	const receivedEmbed = interaction.message?.embeds[0];
	const choiceEmbed = EmbedBuilder.from(receivedEmbed);
	interaction.message?.edit({
		embeds: [
			choiceEmbed
				.setDescription(':warning: *This choice has been **rerolled**.*')
				.setFields([])
				.addFields(
					newFields,
				),
		],
		components: [rerollRow],
	});
	interaction.deferUpdate();
}
