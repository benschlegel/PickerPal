import { EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../utils/constants';

const OriginalPollEmbed = new EmbedBuilder()
	.setAuthor({ name: 'PickerPal' })
	.setThumbnail('https://i.imgur.com/P6KYBvJ.png')
	.setColor(backgroundColor)
	;

export {
	OriginalPollEmbed,
};
