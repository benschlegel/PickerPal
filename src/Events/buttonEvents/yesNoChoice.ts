import { ButtonInteraction, CacheType } from 'discord.js';
import { updateChoices } from '../../functions';
import { clearChoices, getChoices, getFullChoice, isUserChoiceOwner, addYesNoChoices } from '../../utils/databaseAcces';

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

	// Update embed
	updateChoices(choices, interaction, choiceTitle);
}
