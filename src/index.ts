// Require the necessary discord.js classes
import { ActionRowBuilder, Client, Collection, EmbedBuilder, Events, GatewayIntentBits, InteractionType, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonCustomID, ModalCustomID, SlashCommand } from './types';
import { readdirSync } from 'fs';
import { join } from 'path';
import * as Mongo from 'mongodb';
import { OriginalPollEmbed } from './components/embeds';
import { backgroundColor } from './utils/constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');


const uri = 'mongodb+srv://Ben:QcXLFudNGH5mm0PU@bencluster.05q0blr.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'PickerPal';
// Use connect method to connect to the server
// export const dbClient = Promise.resolve(Mongo.MongoClient.connect(uri));

// // Initialize db
// console.log('Connected successfully to server');

// export const db = dbClient.db(dbName);

// // Get the documents collection
// export const choiceCollection = db.collection('choices');

// // Find some documents
// choiceCollection.find({}).toArray().then(docs => {

// 	console.log('Found the following records');
// 	console.log(docs);
// }).catch(console.error);

// choiceCollection.insertOne({ a: 'test' });


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// load commands
client.slashCommands = new Collection<string, SlashCommand>();

// load handlers
const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach(handler => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require(`${handlersDir}/${handler}`)(client);
});

client.on('interactionCreate', async interaction => {
	console.log(interaction.guildId);
	console.log(interaction.channelId);
	console.log(interaction.id);
	if (interaction.isButton()) {
		if (interaction.customId === 'add-text-choice' as ButtonCustomID) {
			const modal = new ModalBuilder()
				.setCustomId('text-option-modal' as ModalCustomID)
				.setTitle('Verify yourself')
				.addComponents([
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('verification-input')
							.setLabel('Answer')
							.setStyle(TextInputStyle.Short)
							.setMinLength(4)
							.setMaxLength(12)
							.setPlaceholder('ABCDEF')
							.setValue('')
							.setRequired(true),
					),
				]);

			await interaction.showModal(modal);
		}
		else if (interaction.customId === 'yes-no-choice' as ButtonCustomID) {
			interaction.message?.edit({
				embeds: [
					OriginalPollEmbed
						.setDescription('\u200B:one: yes\n\n:two: no'),
				],
			});
			interaction.deferUpdate();
		}
	}

	if (interaction.type === InteractionType.ModalSubmit) {
		if (interaction.customId === 'text-option-modal' as ModalCustomID) {
			const response =
        interaction.fields.getTextInputValue('verification-input');
			const oldDescription = interaction.message?.embeds[0].description;
			interaction.message?.edit({
				embeds: [
					OriginalPollEmbed
						.setDescription('.')
						.addFields({ name: 'Choice', value: ':one:' + '    ' + response }),
				],
			});

			// Modal doesnt close unless defer update gets called
			interaction.deferUpdate();
		}
	}
	if (!interaction.isCommand()) return;

	const command = client.slashCommands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Log in to Discord with your client's token
client.login(process.env['TOKEN']);
