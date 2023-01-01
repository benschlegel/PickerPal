// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { token } from '../config.json';
import { SlashCommand } from './types';
import { readdirSync } from 'fs';
import { join } from 'path';


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, 'MessageContent'] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// load commands
client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

// load handlers
const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach(handler => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require(`${handlersDir}/${handler}`)(client);
});

// Log in to Discord with your client's token
client.login(token);
