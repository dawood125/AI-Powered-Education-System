import { NextFunction, Request, Response } from "express";

const errorHandler=(err: any,req:Request,res:Response,next:NextFunction)=>{
    const correlationId=res.locals.correlationId;
    res.status(err.statusCode ||500).json({ error: "Something went wrong", correlationId });
}

export default errorHandler