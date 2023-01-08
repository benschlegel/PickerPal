import { EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../constants';

export const OriginalPollEmbed = new EmbedBuilder()
	.setAuthor({ name: 'Made by Ben', iconURL: 'https://i.imgur.com/biXayKm.jpg' })
	.setThumbnail('https://i.imgur.com/biXayKm.jpg')
	.setDescription('⚡ *(add options to get started)*\n\nhttps://www.google.com/')
	.setColor(backgroundColor)
	.addFields(
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Regular field title', value: 'Some value here', inline: true },
	)
	;
