import express, { Request, Response } from 'express';
import { Logger } from './logger';

const app = express();
app.use(Logger)

app.get('/', (_: Request, res: Response) => {
    res.send("Hello, World!");
})

app.listen(3000, () => {
    console.log("server listening on port 3000");
})