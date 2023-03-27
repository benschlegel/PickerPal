import { Message } from 'discord.js';

export async function handleDM(message: Message) {
	console.log('message: ', message.content);
	message.reply(message.content);
}
