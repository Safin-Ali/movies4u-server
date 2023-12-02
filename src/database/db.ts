import { dbName, db_uri } from '@config/env-var';
import { UseDBArg } from '@custom-types/types';
import logger from '@utilities/color-logger';
import { logError } from '@utilities/common-utilities';
import inDevMode from '@utilities/development-mode';
import { MongoClient } from 'mongodb';

export class InitDB {
	private dbInstance: MongoClient;

	constructor() {
		// Create a new MongoClient instance
		this.dbInstance = new MongoClient(db_uri!);
	}

	useDb = async (callB:UseDBArg):Promise<any> => {
		try {
			// Connect to the MongoDB server
			await this.dbInstance.connect();

			inDevMode(() => {
				logger.success('Connected successfully to db');
			});

			const collection = this.dbInstance.db(dbName).collection('MOVIES');

			// Perform operations using the db object
			const data = await callB(collection);
			return data;

		} catch (err: any) {
			logError(err);
		} finally {
			// Close the connection
			await this.dbInstance.close();
			logger.process('Server Closed');
		}
	};
}