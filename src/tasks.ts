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
  console.log(`PUT request for ID: ${id} with body:`, req.body);

  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(id);
  if (!task) {
    console.log(`Task with ID: ${id} not found in DB before update.`);
    return res.status(404).json({ error: 'Task not found before update' });
  }
  console.log(`Found task to update: ${JSON.stringify(task)}`);

  try {
    const validatedData = CreateTaskSchema.partial().parse(req.body);
    const fieldsToUpdate = Object.keys(validatedData);

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Handle boolean conversion for 'completed' field
    const updateValues: (string | number | boolean)[] = [];
    const setClauses: string[] = [];

    for (const field of fieldsToUpdate) {
        setClauses.push(`${field} = ?`);
        if (field === 'completed') {
            updateValues.push(validatedData[field] ? 1 : 0);
        } else {
            updateValues.push(validatedData[field as keyof typeof validatedData]!);
        }
    }

    const updateStmt = db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`);
    const result = updateStmt.run(...updateValues, id);

    if (result.changes === 0) {
      console.log(`Update failed for ID: ${id}`);
      return res.status(404).json({ error: 'Task not found during update' });
    }

    console.log(`Successfully updated task with ID: ${id}`);
    res.json({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});


// Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`DELETE request for ID: ${id}`);
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(id);
  if (!task) {
    console.log(`Task with ID: ${id} not found in DB before delete.`);
    return res.status(404).json({ error: 'Task not found before delete' });
  }
  console.log(`Found task to delete: ${JSON.stringify(task)}`);

  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = deleteStmt.run(id);
  if (result.changes === 0) {
    console.log(`Deletion failed for ID: ${id}`);
    return res.status(404).json({ error: 'Task not found during delete' });
  }
  console.log(`Successfully deleted task with ID: ${id}`);
  res.status(204).send();
});

export default router;