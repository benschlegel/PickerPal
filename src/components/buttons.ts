// make choice buttons

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonCustomID } from 'src/types';

// MakeChoice Buttons
export const row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('add-text-choice' as ButtonCustomID)
			.setLabel('Click me!')
			.setStyle(ButtonStyle.Primary),
	);
