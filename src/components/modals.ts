import { ModalBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalCustomID } from '../types';

export const modal = new ModalBuilder()
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
