import { EmbedBuilder } from 'discord.js';
import { backgroundColor } from '../constants';

export const OriginalPollEmbed = new EmbedBuilder()
	.setAuthor({ name: 'Made by Ben', iconURL: 'https://i.imgur.com/biXayKm.jpg' })
	.setThumbnail('https://i.imgur.com/biXayKm.jpg')
	.setColor(backgroundColor)
	;
