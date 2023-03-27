import { Message } from 'discord.js';
import { makeYesNoChoice } from 'src/utils/makeYesNoChoice';

export async function handleDM(message: Message) {
	// TODO: add prom
	// Get promt from message and create embed
	const promtName = message.content;
	const yesNoEmbed = makeYesNoChoice(promtName);

	console.log(yesNoEmbed);

	// Reply with embed, disallow mentions so reply is not highlighted
	message.reply({ embeds: [yesNoEmbed], allowedMentions: { users: [] } });
}
