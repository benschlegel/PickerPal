import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { promNumRequests } from '../monitoring/prometheus';
import { SlashCommand } from '../types';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Submit feedback for this bot (feature requests, bugs, etc)'),


	async execute(interaction: ChatInputCommandInteraction) {
		// Update prometheus command counter
		promNumRequests.inc({ feedback: 1 });


	},
};

export default command;
