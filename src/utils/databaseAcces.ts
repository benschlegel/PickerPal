import { MongoClient, ObjectId } from 'mongodb';
import { Choice, CreateChoice } from './DBTypes';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

const uri = process.env['MONGO_URI'];
const dbName = 'PickerPal';
const collectionName = 'choices';
// Use connect method to connect to the server
const dbClient = new MongoClient(uri);

export async function createChoice(choice: CreateChoice): Promise<string> {
	if (!choice.choices) {
		choice.choices = [];
	}
	const database = dbClient.db(dbName);
	// Specifying a Schema is optional, but it enables type hints on
	// finds and inserts
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	const result = await choiceCollection.insertOne(choice);
	console.log(`A document was inserted with the _id: ${result.insertedId}`);
	return result.insertedId;
}

export async function addChoice(choice: Choice) {
	const database = dbClient.db(dbName);
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	await choiceCollection.updateOne(
		{ _id: choice.updateId },
		{ $push: { choices: choice.name } },
	);
}

export async function setChoice(id: string, choice: CreateChoice) {
	const database = dbClient.db(dbName);
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	await choiceCollection.findOneAndReplace(
		{ _id: choice._id },
		choice,
	);
}

// Expects all choices to have the same
export async function clearChoices(id: string) {
	const database = dbClient.db(dbName);
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	await choiceCollection.updateMany(
		{ _id: id },
		{ $set: { choices: [] } },
	);
}

export async function getChoices(id: string): Promise<string[] | undefined> {
	const database = dbClient.db(dbName);
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	const choice = await choiceCollection.findOne({ _id: id });
	return choice?.choices;
}

export async function getFullChoice(id: string) {
	const database = dbClient.db(dbName);
	const choiceCollection = database.collection<CreateChoice>(collectionName);
	const choice = await choiceCollection.findOne({ _id: id });
	return choice;
}

// export async function editField(id: string, field: keyof CreateChoice, value: any) {
// 	console.log('field: ' + field + ', vaslue: ' + value);
// }
