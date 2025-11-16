interface Task {
    id: number;
    name: string;
    completed: boolean;
    difficulty: TaskDifficulty;
    order: number;
    duration: number; // in seconds
}
interface TaskTimeElapsedDialogResult {
    taskId: number;
    duration: number;
    completed: boolean;
    label: string;
}
type TaskFilter = "all" | "active" | "completed";
type TaskDifficulty = "easy" | "medium" | "hard";
export { Task, TaskFilter, TaskDifficulty, TaskTimeElapsedDialogResult };