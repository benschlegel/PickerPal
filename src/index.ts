// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits, InteractionType, Partials } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { deleteOldPolls, getUserbaseSize } from './utils/databaseAcces';
import { stringify } from './functions';
import { commandHandler } from './handlers/command';
import { addTextChoice } from './Events/buttonEvents/addTextChoice';
import { yesNoChoice } from './Events/buttonEvents/yesNoChoice';
import { startChoice } from './Events/buttonEvents/startChoice';
import { server } from './monitoring/startFastify';
import { uptimeGauge, userbaseGauge } from './monitoring/prometheus';
import { addChoiceModal } from './Events/modalEvents/addChoice';
import { handleDM } from './Events/messageEvents/directMessage';
import { rerollChoice } from './Events/buttonEvents/rerollChoice';
import { finalizeChoice } from './Events/buttonEvents/finalizeChoice';
import { addFeedback } from './Events/modalEvents/addFeedback';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// Intervals
let checkAliveInterval = 30 * 1000;
const deleteInterval = (60 * 60 * 1000);
// Deletes all polls that are finished once per hour
setInterval(deleteOldPolls, deleteInterval);
setInterval(checkAliveAndRestart, checkAliveInterval);

// Create a new client instance
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers], partials: [Partials.Channel] });

console.log('level=trace msg="Fastify server is up." server="' + stringify(server) + '"');

getUserbaseSize().then((res) => {
	const arr = res.toArray();
	arr.then((doc) => {
		const size = doc[0]['size'];
		userbaseGauge.set(size);
	});
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`level=info msg="Ready! Logged in as ${c.user.tag}"`);
	client.user?.setActivity('/make-choice');
});

// load commands
client.slashCommands = new Collection<string, SlashCommand>();

// load handlers
commandHandler(client);

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		if (interaction.customId === 'add-text-choice' as ButtonCustomID) {
			await addTextChoice(interaction);
		}
		else if (interaction.customId === 'yes-no-choice' as ButtonCustomID) {
			await yesNoChoice(interaction);
		}
		else if (interaction.customId === 'start-choice' as ButtonCustomID) {
			await startChoice(interaction);
		}
		else if (interaction.customId === 'reroll-choice' as ButtonCustomID) {
			await rerollChoice(interaction);
		}
		else if (interaction.customId === 'finalize-choice' as ButtonCustomID) {
			await finalizeChoice(interaction);
		}
	}

	// Gets executed after modal submit
	if (interaction.type === InteractionType.ModalSubmit) {
		if (interaction.customId === 'text-option-modal' as ModalCustomID) {
			await addChoiceModal(interaction);
		}
		else if (interaction.customId === 'feedback-modal' as ModalCustomID) {
			await addFeedback(interaction);
		}
	}
	if (!interaction.isCommand()) return;

	const command = client.slashCommands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction as any);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	await handleDM(message);
});

// Log in to Discord with your client's token
client.login(process.env['TOKEN']);


// Maybe move this to /intervalFunctions, see if exporting client works (+ find way to change checkAliveInterval)
function checkAliveAndRestart() {
	console.log('level=trace msg="last alive at" data="' + client.readyAt?.toLocaleString() + '"');

	// Set uptime
	if (client.uptime) {
		uptimeGauge.set(client.uptime);
	}
	else {
		// If no uptime found, set to 0
		uptimeGauge.set(0);
	}

	const shard0 = client.ws.shards.get(0);
	if (shard0) {
		const lastPingDate = new Date(shard0.lastPingTimestamp);
		console.log('level=trace msg="last ping date" data="' + lastPingDate.toLocaleString() + '"');
	}
	else {
		console.log('level=error msg="could not get shard 0.');

		client.destroy();
		console.log('level=info msg="destroyed client (shard0)."');
		// Attempt to restart client
		client.login(process.env['TOKEN']).catch((err) => {
			console.log('level=error msg="failed to reconnect!" error="' + stringify(err) + '"');
		}).then(() => {
			console.log('level=info msg="successfully reconnected! (shard0)"');
		});
	}
	// fetching a random guild to see if the bot is still connected, if this results in an error => bot is dead 🕯️
	client.fetchGuildPreview('1058787785030500492').catch((error) => {
		// Set interval to keep checking every 5 seconds
		checkAliveInterval = 5000;

		// Logging
		console.log('level=error msg="bot disconnected!" error="' + stringify(error) + '"');

		// client.destroy();
		// console.log('level=info msg="destroyed client."');
		// console.log('level=info msg="attempting to reconnect..."');
		console.log('level=info msg="stopping process..."');
		process.exit(1);
		// Attempt new login, log depending on success
		// client.login(process.env['TOKEN']).catch((err) => {
		// 	console.log('level=error msg="failed to reconnect!" error="' + stringify(err) + '"');
		// }).then(() => {
		// 	console.log('level=info msg="successfully reconnected!"');
		// });
	}).then(() => {
		// Logging
		console.log('level=debug msg="still alive!" localTime="' + new Date().toLocaleString() + '"');
		// If bot is alive, reset check time back to 30 seconds
		checkAliveInterval = 30 * 1000;
	});
}

