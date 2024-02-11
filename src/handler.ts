import { Request, Response } from "express";

export const Handler = (req: Request, res: Response) => {
    res.send(req.body)
}