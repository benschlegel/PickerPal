import { Message } from 'discord.js';
import { updatePlausible, updateUserbase } from '../../functions';
import { promNumRequests } from '../../monitoring/prometheus';
import { makeYesNoChoice } from '../../utils/makeYesNoChoice';

export async function handleDM(message: Message) {
	// Prometheus
	promNumRequests.inc({ makeYesNoDMChoice: 1 });
	const commandUserId = message.author.id;
	updateUserbase(commandUserId);
	updatePlausible('/dm-yes-no', commandUserId);

	// Get promt from message and create embed
	const promtName = message.content;
	const yesNoEmbed = makeYesNoChoice(promtName);

	// Reply with embed, disallow mentions so reply is not highlighted
	message.reply({ embeds: [yesNoEmbed], allowedMentions: { users: [] } });
}
