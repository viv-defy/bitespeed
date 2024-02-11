import express, { Request, Response } from 'express';
import { Logger } from './logger';
import { handleContacts } from './handler';

const app = express();
app.use(express.json());
app.use(Logger);

app.post('/identify', handleContacts);

app.listen(3000, () => {
    console.log("server listening on port 3000");
});