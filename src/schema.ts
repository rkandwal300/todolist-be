import { z } from 'zod';

export enum priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
export enum category {
  work = 'work',
  personal = 'personal',
  shopping = 'shopping',
  other = 'other',
}
const CreateTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: 'Task name cannot be empty' }),
  priority: z.nativeEnum(priority),
  category: z.nativeEnum(category),
  completed: z.boolean(),
  createdAt: z.string().optional(),
});

const TaskSchema = CreateTaskSchema.extend({
  id: z.string().nonempty({ message: 'Task id cannot be empty' }),
});

type TZTaskSchema = z.infer<typeof TaskSchema>;
type TZCreateTaskSchema = z.infer<typeof CreateTaskSchema>;

export { CreateTaskSchema, TaskSchema };
export type { TZCreateTaskSchema, TZTaskSchema };
