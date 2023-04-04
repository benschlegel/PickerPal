import { ModalBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalCustomID, ModalOptionID } from '../types';

export const addChoicesModal = new ModalBuilder()
	.setCustomId('text-option-modal' as ModalCustomID)
	.setTitle('Add new choice(s)...')
	.addComponents([
		new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('verification-input' as ModalOptionID)
				.setLabel('Add choices (use new line for multiple):')
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder('New choice(s)...')
				.setMaxLength(300)
				.setValue('')
				.setRequired(true),
		),
	]);

export const feedbackModal = new ModalBuilder()
	.setCustomId('feedback-modal' as ModalCustomID)
	.setTitle('Your feedback')
	.addComponents([
		new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('feedback-input' as ModalOptionID)
				.setLabel('Add choices (use new line for multiple):')
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder('New choice(s)...')
				.setMaxLength(300)
				.setValue('')
				.setRequired(true),
		),
	]);
