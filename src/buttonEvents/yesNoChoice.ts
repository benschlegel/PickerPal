import { APIEmbed, APIEmbedField, ButtonInteraction, CacheType, EmbedBuilder, JSONEncodable } from 'discord.js';
import { getEmojiFromIndexWithChoice } from '../functions';
import { clearChoices, getChoices, getFullChoice, isUserChoiceOwner, addYesNoChoices } from '../utils/databaseAcces';

export async function yesNoChoice(interaction: ButtonInteraction<CacheType>) {
	// Database access
	const messageId = interaction.message?.id as string;
	const commandUserId = interaction.user.id;

	const isOwner = await isUserChoiceOwner(messageId, commandUserId);
	if (!isOwner) {
		interaction.reply({ content: ':x: You did not create this choice.', ephemeral: true });
		return;
	}

	// Clear existing choices and add yes/no
	await clearChoices(messageId);
	await addYesNoChoices(messageId);

	const choices = await getChoices(messageId) as string[];
	const fullChoice = await getFullChoice(messageId);
	const choiceTitle = fullChoice?.choiceTitle as string;

	// Dont reroll choice if already complete
	if (fullChoice?.isComplete === true) {
		await interaction.reply({ content: ':warning: Choice has already been decided, start a new one if you want to reroll.\n:x: Did not complete action.', ephemeral: true });
		return;
	}
	// Build new embed
	// Fill in static fields
	const newFields: APIEmbedField[] = [
		{ name: '\u200B', value: '\u200B' },
		{ name: '📊 Prompt', value: choiceTitle },
		{ name: '\u200B', value: '\u200B' },
	];

	// Add choices ✅ ❌
	for (let i = 0; i < choices.length; i++) {
		newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
	}

	// Get old embed
	const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
	const choiceEmbed = EmbedBuilder.from(receivedEmbed);
	interaction.message?.edit({
		embeds: [
			choiceEmbed
				.setDescription('*⚡ click "Make choice" button to start decision*')
				.setFields([])
				.addFields(
					newFields,
				),
		],
	});
	interaction.deferUpdate();
}
