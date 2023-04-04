import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { OriginalPollEmbed } from '../components/embeds';
import { getEmojiFromIndexWithChoice, randomEntriesFromArray } from '../functions';

/**
 * locally creates and STARTS yes/no choice with given title
 * @param title title of choice
 */
export function makeYesNoChoice(title: string): EmbedBuilder {
	const choices = ['yes', 'no'];
	// Get original embed
	const choiceEmbed = EmbedBuilder.from(OriginalPollEmbed).setAuthor(null);

	// New fields
	const newFields: APIEmbedField[] = [
		{ name: '📊 Prompt', value: title },
		{ name: '\u200B', value: '\u200B' },
	];

	// Make choice (get 1 random entry from array)
	const result = randomEntriesFromArray(1, choices)[0];

	// Add to embed
	for (let i = 0; i < choices.length; i++) {
		newFields.push({ name: getEmojiFromIndexWithChoice(i, choices[i]) + ' Choice', value: choices[i] });
	}

	// Add placeholder
	newFields.push({ name: '\u200B', value: '\u200B' });

	// Add decision (getEmoji(0), since it can only contain yes/no, which automatically gets transformed to correct emoji no matter the index)
	newFields.push({ name: '⚡ Decision', value: getEmojiFromIndexWithChoice(0, result) + ' ' + result });

	choiceEmbed.addFields(newFields);
	return choiceEmbed;
}
