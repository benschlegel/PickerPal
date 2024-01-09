import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { promNumRequests } from '../monitoring/prometheus';
import { SlashCommand } from '../types';
import { feedbackModal } from '../components/modals';
import { updatePlausible } from '../functions';

const command : SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Submit feedback for this bot (feature requests, bugs, etc)'),


	async execute(interaction: ChatInputCommandInteraction) {
		// Update prometheus command counter
		promNumRequests.inc({ feedback: 1 });
		updatePlausible('/feedback', interaction.user.id);

		// Show modal
		await interaction.showModal(feedbackModal);
	},
};

export default command;
