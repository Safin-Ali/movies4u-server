import { useDb } from '@app';
import { dbName, db_uri } from '@config/env-var';
import { FinalResponseTuple,  UseDBArg } from '@custom-types/types';
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

	/**
	 *
	 * @param {UseDBArg} callB  - a callback function execute after connection successfull.
	 * @param {boolean} close - waiting boolen if true then  connection will closed after resolve
	 * @returns {any}
	 */
	useDb = async (callB:UseDBArg,close:boolean | void):Promise<any> => {
		try {

			// Connect to the MongoDB server
			await this.dbInstance.connect();

			inDevMode(() => {
				logger.success('Connected successfully to db');
			});

			const collection = this.dbInstance.db(dbName).collection('MOVIES');

			// Perform operations using the db object
			const data = await callB(collection);

			if(close) {
				await this.dbInstance.close();
				inDevMode(() => logger.process('Server Closed'));
			}
			return data;

		} catch (err: any) {
			logError(err);
		}
	};

	/**
	 * update tempLink in db
	 */

	static updateTempLink = async (tempLinkArr:FinalResponseTuple,{title,year}:{title:string,year:string}):Promise<void> => {
		try {
		// query filter for mongodb
			const dbFilter = {
				title,
				year
			};
			await useDb(async(cl) => {
				await cl.updateOne(dbFilter,{
					'$set':{
						'tempLink':tempLinkArr,
						'lastUpdate':new Date().setHours(new Date().getHours() + 23, new Date().getMinutes() + 50)
					}
				});
			},true);
		} catch (err:any) {
			logError(err);
		}
	};

	public static async findMovieLink (query:any):Promise<any> {
		let result:any = null;
		try {
			await useDb(async (cl) => {
				result = await cl.findOne(query);

			},true);
			return result;

		} catch (err:any) {
			logError(err);
			result;
		}
	}
}