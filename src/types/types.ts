import { Request,Response } from 'express';
import createRouter from 'express';

export interface Custom_Requst <T> extends Request {
	body:T
}

export type RouteHandlerReturnType <T> = void | Promise<T | void>;
export type RouteHandlerRequestType <Req> = Req extends undefined ? Request : Req;

export type RouteHandlerType <Return,CustomReq> = (req: RouteHandlerRequestType<CustomReq>, res: Response) => RouteHandlerReturnType<Return>;

export interface MovieDLScrapQuery {
	title:string,
	lang:string,
	year:string
};

export type CustomRouter = [string, createRouter.Router];