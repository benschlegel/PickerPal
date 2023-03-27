import { CacheType, ModalSubmitInteraction } from 'discord.js';
import { updateChoices } from '../functions';
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

	// Update embed
	updateChoices(choices, interaction, choiceTitle);
}
