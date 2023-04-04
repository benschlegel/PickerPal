import { ButtonInteraction, CacheType } from 'discord.js';
import { getFullChoice, isUserChoiceOwner, setChoice } from '../utils/databaseAcces';

export async function finalizeChoice(interaction: ButtonInteraction<CacheType>) {
	// Database access
	const messageId = interaction.message?.id;
	const commandUserId = interaction.user.id;

	const isOwner = await isUserChoiceOwner(messageId, commandUserId);
	if (!isOwner) {
		interaction.reply({ content: ':x: You did not create this choice.', ephemeral: true });
		return;
	}

	// Get choice and handle errors
	const fullChoice = await getFullChoice(messageId);
	if (!fullChoice) {
		await interaction.reply({ content: ':warning: Choice not found.', ephemeral: true });
		return;
	}

	// Set completed and update message
	fullChoice.isComplete = true;
	fullChoice.finalChoice = fullChoice.currentChoice;
	await setChoice(messageId, fullChoice);
	interaction.message?.edit({
		components: [],
	});
}
