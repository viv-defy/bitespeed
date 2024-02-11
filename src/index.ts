import express, { Request, Response } from 'express';
import { Logger } from './logger';
import { Handler } from './handler';

const app = express();
app.use(express.json());
app.use(Logger);

app.post('/identify', Handler);

app.listen(3000, () => {
    console.log("server listening on port 3000");
});