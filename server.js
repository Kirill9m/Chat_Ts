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

app.get('/', (req, res) => {
  res.json(messages);
});

app.post('/', (req, res) => {
  try {
    const newMessage = req.body;
    if (!newMessage || !newMessage.content || !newMessage.type || !newMessage.timestamp){
      return res.status(400).json({ error: 'Invalid message format.' });
    }
    newMessage.id = uuidv4();
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error processing POST request:', error);
        res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});