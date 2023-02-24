import { MongoClient, ObjectId } from 'mongodb';
import { Choice, CreateChoice } from './DBTypes';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

const uri = process.env['MONGO_URI'];
const dbName = 'PickerPal';
const collectionName = 'choices';
// Use connect method to connect to the server
const dbClient = new MongoClient(uri);

const database = dbClient.db(dbName);
const choiceCollection = database.collection<CreateChoice>(collectionName);

export async function createChoice(choice: CreateChoice): Promise<string> {
	if (!choice.choices) {
		choice.choices = [];
	}
	const result = await choiceCollection.insertOne(choice);
	return result.insertedId;
}

export async function deleteOldPolls() {
	choiceCollection.deleteMany({ isComplete: true });
}

export async function addChoice(choice: Choice) {
	await choiceCollection.updateOne(
		{ _id: choice.updateId },
		{ $push: { choices: choice.name } },
	);
}

export async function setChoice(id: string, choice: CreateChoice) {
	await choiceCollection.findOneAndReplace(
		{ _id: choice._id },
		choice,
	);
}

// Expects all choices to have the same
export async function clearChoices(id: string) {
	await choiceCollection.updateMany(
		{ _id: id },
		{ $set: { choices: [] } },
	);
}

export async function getChoices(id: string): Promise<string[] | undefined> {
	const choice = await choiceCollection.findOne({ _id: id });
	return choice?.choices;
}

export async function getFullChoice(id: string) {
	const choice = await choiceCollection.findOne({ _id: id });
	return choice;
}

export async function dropChoices() {
	await choiceCollection.drop();
}

export async function isUserChoiceOwner(choiceId: string, userId: string) {
	const doc = await choiceCollection.findOne(
		{ _id: choiceId },
	);

	// user is the owner, if he is the first entry in receivers array
	return doc?.ownerId === userId;
}

// export async function editField(id: string, field: keyof CreateChoice, value: any) {
// 	console.log('field: ' + field + ', vaslue: ' + value);
// }
