import { ActionRowBuilder, ButtonInteraction, CacheType, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalCustomID } from '../types';
import { getFullChoice, isUserChoiceOwner } from '../utils/databaseAcces';

export async function addTextChoice(interaction: ButtonInteraction<CacheType>) {
	// Database vars
	const messageId = interaction.message?.id as string;
	const commandUserId = interaction.user.id;

	const isOwner = await isUserChoiceOwner(messageId, commandUserId);
	if (!isOwner) {
		interaction.reply({ content: ':x: You did not create this choice.', ephemeral: true });
		return;
	}
	const fullChoice = await getFullChoice(messageId);

	// Dont reroll choice if already complete
	if (fullChoice?.isComplete === true) {
		await interaction.reply({ content: ':warning: Choice has already been decided, start a new one to add choices.\n:x: Did not complete action.', ephemeral: true });
		return;
	}

	const modal = new ModalBuilder()
		.setCustomId('text-option-modal' as ModalCustomID)
		.setTitle('Add new choice(s)...')
		.addComponents([
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId('verification-input')
					.setLabel('Add choices (use new line for multiple):')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('New choice(s)...')
					.setMaxLength(300)
					.setValue('')
					.setRequired(true),
			),
		]);

	await interaction.showModal(modal);
}
