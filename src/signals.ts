import { signal } from "@preact/signals-react";
import type { Task, TaskFilter } from "./types";

/**
 * @file Manages the application's global state using Preact Signals.
 */

// --- State Signals ---

/** Manages the list of all tasks. */
export const tasks = signal<Task[]>([]);

/** Stores the name of a task currently being edited. */
export const editedTaskName = signal<string>("");

/** Stores the name of a new task being added. */
export const newTaskName = signal<string>("");

/** Stores the ID of the task currently being edited. */
export const editedTaskId = signal<number | null>(null);

/** Holds the currently selected task filter. */
export const filter = signal<TaskFilter>("all");