import { CacheType, ModalSubmitInteraction } from 'discord.js';
import { createFeedback } from '../../utils/databaseAcces';
import { CreateFeedback } from '../../utils/DBTypes';
import { ModalOptionID } from '../../types';

export async function addFeedback(interaction: ModalSubmitInteraction<CacheType>) {
	// Response from modal input field
	const inputID: ModalOptionID = 'feedback-input';
	const response = interaction.fields.getTextInputValue(inputID);

	if (!response || response.length === 0 || response.trim().length === 0) {
		interaction.reply({
			content: ':warning: Response can\'t be empty, please try again.',
			ephemeral: true,
		});
		return;
	}

	// Database access
	const id = interaction.user.id;

	// Add feedback object and add to DB
	const feedback: CreateFeedback = {
		id: id,
		feedback: response,
	};

	// Add feedback
	await createFeedback(feedback);
	await interaction.reply({
		content: 'Thanks for your feedback!',
		ephemeral: true,
	});
}
