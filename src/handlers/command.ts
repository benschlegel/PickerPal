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
		// if (!file.endsWith('.js')) return;
		const command : SlashCommand = require(`${slashCommandsDir}/${file}`).default;
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	});

	const rest = new REST({ version: '10' }).setToken(token);

	rest.put(Routes.applicationCommands(clientId), {
		body: slashCommands.map(command => command.toJSON()),
	})
		.then((data : any) => {
			// console.log(color('text', `🔥 Successfully loaded ${color('variable', data.length)} slash command(s)`));
			console.log('Successfully loaded ' + data.length + 'slash command(s)');
			console.log(data);
		}).catch(e => {
			console.log(e);
		});
};
