import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "upgrade-insecure-requests;");
  next();
});

let messages = [];

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const newMessage = req.body;
  newMessage.id = uuidv4();
  messages.push(newMessage);
  res.status(201).json(newMessage);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
