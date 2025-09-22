import express from 'express';
import tasksRouter from './tasks';

const app = express();
app.use(express.json());

app.use('/tasks', tasksRouter);

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});