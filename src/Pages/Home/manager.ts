import { TaskDifficulty } from "src/types";
import { tasks, newTaskName, editedTaskId, editedTaskName } from "../../signals";

/**
 * @file A custom hook providing functions to manage the tasks state.
 */

export function manager() {

    function addTask(e: React.FormEvent) {
        e.preventDefault();
        if (newTaskName.value.trim() === "") return;

        tasks.value = [
            ...tasks.value,
            {
                id: Date.now(),
                name: newTaskName.value.trim(),
                completed: false,
                difficulty: "easy",
                order: tasks.value.length,
                duration: 5
            },
        ];
        newTaskName.value = "";
    };

    function updateTaskName(id: number, name: string) {
        tasks.value = tasks.value.map((task) =>
            task.id === id ? { ...task, name: name.trim() } : task
        );
        editedTaskId.value = null;
        editedTaskName.value = "";
    };

    function cancelEdit() {
        editedTaskId.value = null;
        editedTaskName.value = "";
    };

    function removeTask(id: number) {
        tasks.value = tasks.value.filter((task) => task.id !== id);
    };

    function toggleTaskCompleted(id: number) {
        tasks.value = tasks.value.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
    };

    function clearTasks() {
        tasks.value = [];
    };

    function clearCompletedTasks() {
        tasks.value = tasks.value.filter((task) => !task.completed);
    };

    function updateTaskDifficulty(id: number, difficulty: TaskDifficulty) {
        tasks.value = tasks.value.map((task) =>
            task.id === id ? { ...task, difficulty: difficulty } : task
        );
    }

    // Helper function to swap the 'order' property of two tasks
    const swapOrder = (tasksArray: any[], index1: number, index2: number) => {
        const tempOrder = tasksArray[index1].order;
        tasksArray[index1].order = tasksArray[index2].order;
        tasksArray[index2].order = tempOrder;
        return tasksArray;
    };


    return {
        addTask,
        updateTaskName,
        cancelEdit,
        removeTask,
        toggleTaskCompleted,
        clearTasks,
        clearCompletedTasks,
        updateTaskDifficulty,
    };
}