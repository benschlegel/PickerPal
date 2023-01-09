import { EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../utils/constants';

const OriginalPollEmbed = new EmbedBuilder()
	.setAuthor({ name: 'Made by Ben' })
	.setThumbnail('https://cdn.discordapp.com/attachments/231694896669523969/1061725194307260526/Artboard_1.png')
	.setDescription('⚡ *(add options to get started)*\n\nhttps://www.google.com/')
	.setColor(backgroundColor)
	;

export {
	OriginalPollEmbed,
};
