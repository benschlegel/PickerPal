/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';
import { readdirSync } from 'fs';
import { join } from 'path';
import { SlashCommand } from '../types';
import { token, clientId } from '../../config.json';

module.exports = (client : Client) => {
	const slashCommands : SlashCommandBuilder[] = [];

	const slashCommandsDir = join(__dirname, '../commands');

	readdirSync(slashCommandsDir).forEach(file => {
		if (!file.endsWith('.ts')) return;
		const command : SlashCommand = require(`${slashCommandsDir}/${file}`).default;
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	});

	const rest = new REST({ version: '10' }).setToken(token);

	// deploy commands
	(async () => {
		try {
			console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data: any = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: slashCommands.map(command => command.toJSON()) },
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		}
		catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	})();
};
