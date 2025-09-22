import { Router } from 'express';
import db from './db';
import { CreateTaskSchema, TaskSchema } from './schema';
import { z } from 'zod';

const router = Router();

// Get all tasks
router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks');
  const tasks = stmt.all();
  res.json(tasks);
});

// Get a task by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create a new task
router.post('/', (req, res) => {
  try {
    const { name, priority, category, completed } = CreateTaskSchema.parse(req.body);
    const stmt = db.prepare(
      'INSERT INTO tasks (id, name, priority, category, completed) VALUES (?, ?, ?, ?, ?)'
    );
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const result = stmt.run(id, name, priority, category, completed ? 1 : 0);
    res.status(201).json({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const { name, priority, category, completed } = TaskSchema.parse({
      ...req.body,
      id,
    });
    const stmt = db.prepare(
      'UPDATE tasks SET name = ?, priority = ?, category = ?, completed = ? WHERE id = ?'
    );
    const result = stmt.run(name, priority, category, completed ? 1 : 0, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

export default router;
