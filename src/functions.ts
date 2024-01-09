import { APIEmbed, APIEmbedField, ButtonInteraction, CacheType, EmbedBuilder, GuildMember, JSONEncodable, ModalSubmitInteraction, PermissionFlagsBits, PermissionResolvable, TextChannel } from 'discord.js';
import { userbaseGauge } from './monitoring/prometheus';
import { addToUserbase } from './utils/databaseAcces';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiCharacters = require('./utils/emojiCharacters');

type colorType = 'text' | 'variable' | 'error'

const themeColors = {
	text: '#ff8e4d',
	variable: '#ff624d',
	error: '#f5426c',
};

export const getThemeColor = (color: colorType) => Number(`0x${themeColors[color].substring(1)}`);

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
 * Stringifies input
 * @param input what to stringify
 * @returns stringified result (replaces " with ')
 */
export function stringify(input: any) {
	return JSON.stringify(input).replaceAll('"', '\'');
}

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

/**
 * Converts an index to the corresponding emoji/s (e.g. index: 0 -> 1️⃣, 11 -> 1️⃣2️⃣)
 * @param index array index or number to be converted to an emoji
 * @param choice used to return special emojis instead (like ✅ ❌ for "yes"/"no")
 * @returns the corresponding emoji/s of (index + 1) or
 */
export function getEmojiFromIndexWithChoice(index: number, choice?: string): string {
	if (choice) {
		switch (choice.toLowerCase()) {
		case 'yes': {
			return '✅';
		}
		case 'no': {
			return '❌';
		}
		}
	}
	return getEmojiFromIndex(index);
}

/**
 * Tries to update the userbase prom gauge with an id. If id is already contained, no changes will be made.
 * @param id user id to be added/checked
 */
export function updateUserbase(id: string) {
	// const endUserbaseTimer = userbaseTimeGauge.startTimer();
	addToUserbase(id).then((updateResult) => {
		if (updateResult.modifiedCount > 0) {
			userbaseGauge.inc(1);
		}
		// endUserbaseTimer();
	});
}

export function randomIntFromInterval(min: number, max: number) { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Picks random entries from an array
 * @param picks how many entries to pick
 * @param arr what array to pick from
 * @returns resulting picks
 */
export function randomEntriesFromArray(picks: number, arr: any[]) {
	// Shuffle array
	const shuffled = arr.sort(() => 0.5 - Math.random());

	// Get sub-array of first n elements after shuffled
	const selected = shuffled.slice(0, picks);

	return selected;
}

/**
 * Updates a choice embed
 * @param choices new choices to update with
 * @param interaction interaction the event came from
 * @param choiceTitle title of the choice
 */
export function updateChoices(choices: string[], interaction: ButtonInteraction<CacheType> | ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>, choiceTitle: string) {
	// Build new embed
	// Fill in static fields
	const newFields: APIEmbedField[] = [
		{ name: '\u200B', value: '\u200B' },
		{ name: '📊 Prompt', value: choiceTitle },
		{ name: '\u200B', value: '\u200B' },
	];

	// Add choices
	for (let i = 0; i < choices.length; i++) {
		newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
	}

	// Get old embed
	const receivedEmbed = interaction.message?.embeds[0] as APIEmbed | JSONEncodable<APIEmbed>;
	const choiceEmbed = EmbedBuilder.from(receivedEmbed);
	interaction.message?.edit({
		embeds: [
			choiceEmbed
				.setDescription('*⚡ click "Make choice" button to start decision*')
				.setFields([])
				.addFields(
					newFields,
				),
		],
	});
	interaction.deferUpdate();
}

/**
 * Tries to register which command was used on plausible
 * @param command which command was used
 * @param id id of user who used command (used for deduping requests)
 */
export function updatePlausible(command: string, id: string) {
	if (process.env['PLAUSIBLE_KEY'] && process.env['PLAUSIBLE_URL']) {
		fetch(process.env['PLAUSIBLE_URL'], {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; CustomID=${id}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3`,
				'Authorization': `Bearer ${process.env['PLAUSIBLE_KEY']}`,
			},
			body: JSON.stringify({
				name: 'pageview',
				domain: 'picker.pal',
				url: command,
				'props': { 'version': '1.0.0' },
			}),
		});
	}
}
