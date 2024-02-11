import { Request, Response, NextFunction } from 'express';

export const Logger = (req: Request, _: Response, next: NextFunction) => {
    console.log(`${ new Date(Date.now()).toUTCString() } :  ${req.method} ${req.url}`);
    next();
};
