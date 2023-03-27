import { APIEmbedField, APIEmbed, JSONEncodable, EmbedBuilder, CacheType, ModalSubmitInteraction } from 'discord.js';
import { getEmojiFromIndexWithChoice } from '../functions';
import { addChoices, getChoices, getFullChoice } from '../utils/databaseAcces';
import { Choice } from '../utils/DBTypes';

export async function addChoiceModal(interaction: ModalSubmitInteraction<CacheType>) {
	// Response from modal input field
	const response = interaction.fields.getTextInputValue('verification-input');

	// splits by newline, .filter removes empty lines
	const newChoices = response.split('\n').filter(n => n);

	// Database access
	const messageId = interaction.message?.id as string;
	const dbChoices: Choice[] = [];

	// Add all "newChoice" strings to "Choice" type
	for (const choice of newChoices) {
		dbChoices.push({ updateId: messageId, name: choice });
	}

	// Add all new choices to tb
	await addChoices(dbChoices);
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

	// Get old embed
	const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
	const choiceEmbed = EmbedBuilder.from(receivedEmbed)
		.setDescription('*⚡ click "Make choice" button to start decision*')
		.setFields([])
		.addFields(
			newFields,
		);

	// Edit original message
	interaction.message?.edit({
		embeds: [
			choiceEmbed,
		],
	});

	// Modal doesnt close unless defer update gets called
	interaction.deferUpdate();
}
