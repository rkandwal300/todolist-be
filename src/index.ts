import express from 'express';
import tasksRouter from './tasks';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/tasks', tasksRouter);

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});