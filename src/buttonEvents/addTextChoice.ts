import { ButtonInteraction, CacheType } from 'discord.js';
import { getFullChoice, isUserChoiceOwner } from '../utils/databaseAcces';
import { modal } from '../components/modals';

export async function addTextChoice(interaction: ButtonInteraction<CacheType>) {
	// Database vars
	const messageId = interaction.message?.id as string;
	const commandUserId = interaction.user.id;

	// Dont reroll choice if already complete
	const fullChoice = await getFullChoice(messageId);
	if (fullChoice?.isComplete === true) {
		await interaction.reply({ content: ':warning: Choice has already been decided, start a new one to add choices.\n:x: Did not complete action.', ephemeral: true });
		return;
	}

	// Only update if user is owner
	const isOwner = await isUserChoiceOwner(messageId, commandUserId);
	if (!isOwner) {
		interaction.reply({ content: ':x: You did not create this choice.', ephemeral: true });
		return;
	}

	await interaction.showModal(modal);
}
