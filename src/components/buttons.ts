// make choice buttons

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonCustomID } from 'src/types';

// MakeChoice Buttons

const addChoiceID: ButtonCustomID = 'add-text-choice';
const yesNoChoiceID: ButtonCustomID = 'yes-no-choice';
export const choiceRow1 = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(
		new ButtonBuilder()
			.setCustomId(addChoiceID)
			.setEmoji('✏️')
			.setLabel('Add choice(s)')
			.setStyle(ButtonStyle.Primary),
	)
	.addComponents(
		new ButtonBuilder()
			.setCustomId(yesNoChoiceID)
			.setEmoji('✏️')
			.setLabel('Convert to yes/no choice')
			.setStyle(ButtonStyle.Secondary),
	);

const startChoiceID: ButtonCustomID = 'start-choice';
export const choiceRow2 = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(
		new ButtonBuilder()
			.setCustomId(startChoiceID)
			.setEmoji('✅')
			.setLabel('Make choice')
			.setStyle(ButtonStyle.Success),
	);


const rerollChoiceID: ButtonCustomID = 'reroll-choice';
const finalizeChoiceID: ButtonCustomID = 'finalize-choice';
export const rerollRow = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(
		new ButtonBuilder()
			.setCustomId(rerollChoiceID)
			.setLabel('🎲 Reroll choice')
			.setStyle(ButtonStyle.Primary),
	)
	.addComponents(
		new ButtonBuilder()
			.setCustomId(finalizeChoiceID)
			.setLabel('Finalize choice')
			.setStyle(ButtonStyle.Secondary),
	);
