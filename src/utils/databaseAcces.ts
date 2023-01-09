import { MongoClient } from 'mongodb';
import { Choice } from './DBTypes';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

const uri = process.env['MONGO_URI'];
const dbName = 'PickerPal';
const collectionName = 'choices';
// Use connect method to connect to the server
console.log(uri);
const dbClient = new MongoClient(uri);

export async function addChoice(choice: Choice) {

	const database = dbClient.db(dbName);
	// Specifying a Schema is optional, but it enables type hints on
	// finds and inserts
	const insertChoice = database.collection<Choice>(collectionName);
	const result = await insertChoice.insertOne(choice);
	console.log(`A document was inserted with the _id: ${result.insertedId}`);

}
