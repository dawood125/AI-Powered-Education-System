import { randomUUID } from "crypto"
import { NextFunction, Request, Response } from "express";

const correlationIdMiddleware = (req:Request, res:Response, next:NextFunction)=>{
    const headerId = req.headers['x-correlation-id']
    const id = Array.isArray(headerId) ? headerId[0] : headerId

    const correlationId = id ?? randomUUID()
    res.locals.correlationId = correlationId
    next()
}

export default correlationIdMiddleware