import { Request, Response } from 'express';
import createRouter from 'express';
import { Collection } from 'mongodb';

export interface Custom_Requst<T> extends Request {
	body: T
}

export type RouteHandlerReturnType<T> = void | Promise<T | void>;
export type RouteHandlerRequestType<Req> = Req extends undefined ? Request : Req;

export type RouteHandlerType<Return, CustomReq> = (req: RouteHandlerRequestType<CustomReq>, res: Response) => RouteHandlerReturnType<Return>;

export interface DownloadInfoParams {
	title: string,
	year: string,
	postId?: ResPostIdTuple
}
export interface MovieDLScrapQuery {
	title: string,
	year: string
}

export interface MovieDLServer {
	fastS: string,
}

// driveseed direct download button http req response type
export interface DriveSeedDRCRes {
	error: boolean,
	info: any,
	url: string
}

// InitDB clss method callback function singnature
export type UseDBArg = (collection: Collection) => Promise<any>;

export type MovieDLServerReturn = [MovieDLServer, MovieDLServer, MovieDLServer]

export type ResolutionLiteral = '480p' | '720p' | '1080p';

/**
 * Movie Resolution `Post ID`
 * or
 * A `Tuple` of `DownloadUrl`
 */
export type ResPostIdTuple = [string,string,string];

export interface DownloadInfoParams {
	title:string,
	year:string
}
export interface MovieDLScrapQuery {
	title:string,
	year:string
}

export interface MovieDLServer {
	fastS:string,
}

export type CustomRouter = [string, createRouter.Router];