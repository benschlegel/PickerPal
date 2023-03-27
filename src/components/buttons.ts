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
			.setLabel('✏️ Add choice(s)')
			.setStyle(ButtonStyle.Primary),
	)
	.addComponents(
		new ButtonBuilder()
			.setCustomId(yesNoChoiceID)
			.setLabel('✏️ Convert to yes/no choice')
			.setStyle(ButtonStyle.Secondary),
	);

const startChoiceID: ButtonCustomID = 'start-choice';
export const choiceRow2 = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(
		new ButtonBuilder()
			.setCustomId(startChoiceID)
			.setLabel('✅ Make choice')
			.setStyle(ButtonStyle.Success),
	);
