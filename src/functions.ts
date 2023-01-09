import chalk from 'chalk';
import { GuildMember, PermissionFlagsBits, PermissionResolvable, TextChannel } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiCharacters = require('./utils/emojiCharacters');

type colorType = 'text' | 'variable' | 'error'

const themeColors = {
	text: '#ff8e4d',
	variable: '#ff624d',
	error: '#f5426c',
};

export const getThemeColor = (color: colorType) => Number(`0x${themeColors[color].substring(1)}`);

// eslint-disable-next-line no-shadow
export const color = (color: colorType, message: any) => {
	return chalk.hex(themeColors[color])(message);
};

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
	const neededPermissions: PermissionResolvable[] = [];
	permissions.forEach(permission => {
		if (!member.permissions.has(permission)) neededPermissions.push(permission);
	});
	if (neededPermissions.length === 0) return null;
	return neededPermissions.map(p => {
		if (typeof p === 'string') return p.split(/(?=[A-Z])/).join(' ');
		else return Object.keys(PermissionFlagsBits).find(k => Object(PermissionFlagsBits)[k] === p)?.split(/(?=[A-Z])/).join(' ');
	});
};

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
	channel.send(message)
		.then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
	return;
};

/**
 * Converts an index to the corresponding emoji/s (e.g. index: 0 -> 1️⃣, 11 -> 1️⃣2️⃣)
 * @param index array index or number to be converted to an emoji
 * @returns the corresponding emoji/s of (index + 1) or
 */
export function getEmojiFromIndex(index: number): string {
	// Return 0 if invalid index
	if (index < 0) {
		return emojiCharacters[0];
	}

	// If index can be displayed using 1 digit, return it
	if (index < 9) {
		return emojiCharacters[index + 1];
	}

	// TODO: fix last digit + 1 to convert index to correct emoji
	const stringIndex = '' + index;
	const emojiArray = [];
	for (let i = 0; i < stringIndex.length; i++) {
		emojiArray.push(emojiCharacters[stringIndex[i]]);
	}
	return emojiArray.join();
}

export function randomIntFromInterval(min: number, max: number) { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}
