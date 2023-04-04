/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';
import * as makeChoice from '../commands/makeChoice';
import * as ping from '../commands/ping';
import * as pickPerson from '../commands/pickPerson';
import * as pickGroup from '../commands/pickGroup';
import * as feedback from '../commands/feedback';
import { stringify } from '../functions';
const process = require('process');

export function commandHandler(client : Client) {
	const slashCommands : SlashCommandBuilder[] = [];

	// TODO: add new commands here (+ add import * ...)
	const commands = [makeChoice, ping, pickPerson, pickGroup, feedback];

	for (const command of commands.map(c => c.default)) {
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	}

	const rest = new REST({ version: '10' }).setToken(process.env['TOKEN']);

	// deploy commands
	(async () => {
		try {
			console.log(`level=info msg="Started refreshing ${slashCommands.length} application (/) commands."`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data: any = await rest.put(
				Routes.applicationCommands(process.env['CLIENT_ID']),
				{ body: slashCommands.map(command => command.toJSON()) },
			);

			console.log(`level=info msg="Successfully reloaded ${data.length} application (/) commands."`);
		}
		catch (error) {
			// And of course, make sure you catch and log any errors!
			console.log('level=error msg="something went wrong while executing a command" error="' + stringify(error) + '"');
		}
	})();
}
