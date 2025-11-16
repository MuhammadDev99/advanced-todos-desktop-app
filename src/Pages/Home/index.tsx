import { useEffect } from "react";
import styles from "./style.module.css";
import { tasks, newTaskName, editedTaskId, editedTaskName, filter } from "../../signals";
import { loadTasks, autoSaveChanges } from "../../api";
import { manager } from "./manager";
import type { Task, TaskDifficulty, TaskFilter, TaskTimeElapsedDialogResult } from "../../types";
import { signal, computed } from "@preact/signals-react";
import { formatDuration } from "../../utils";

// --- SOLUTION: Import image assets directly ---
import checkMarkIcon from '/images/CheckMark.svg';
import saveIcon from '/images/chemark-black.png';
import stopIcon from '/images/close-black.png';
import editIcon from '/images/edit-black.png';
import removeIcon from '/images/garbage-black.png';
import startIcon from '/images/play-button-black.png';

// --- State Signals ---
const filterOptions = ["all", "active", "completed"] as const;
const difficultyOptions = ["easy", "medium", "hard"] as const;
const durationOptions: number[] = [0.1, 1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];
const hoveredTaskId = signal<number | null>(null);
const grabbedTaskId = signal<number | null>(null);
const activeTaskId = signal<number | null>(null);
const activeTaskWindows = signal<string[]>([]);
const remainingTime = signal<number>(0);
const progressInterval = signal<NodeJS.Timeout | null>(null);

// --- Computed Signals ---
const activeTask = computed(() => tasks.value.find((t) => t.id === activeTaskId.value));

// --- Helper Functions ---
function updateTaskDuration(id: number, duration: number) {
    tasks.value = tasks.value.map((task) =>
        task.id === id ? { ...task, duration: duration } : task
    );
}

function closeAllWindows() {
    activeTaskWindows.value.forEach((windowId) => {
        window.electronAPI.closeWindow(windowId);
    })
    activeTaskWindows.value = [];
}
function setTaskCompleted(task: Task, completed: boolean) {
    tasks.value = tasks.value.map((t) => (t.id === task.id ? { ...t, completed } : t));
}
async function showTaskTimeElapsedDialogue(task: Task) {
    const windowOptions = {
        width: 500,
        height: 250,
    };

    // UPDATED: Using the new callback-based approach.
    window.electronAPI.createWindow({
        route: 'task-time-elapsed-dialogue',
        options: windowOptions,
        queryParams: {
            task: JSON.stringify(task),
        }
    }, (result: TaskTimeElapsedDialogResult) => {
        if (result.label === 'completed') {
            setTaskCompleted(task, true);
        } else if (result.label === 'extend') {
            updateTaskDuration(task.id, result.duration);
            startTask({ ...task, duration: result.duration });
        }
    });
}

async function startTask(task: Task): Promise<void> {
    setTaskCompleted(task, false);
    closeAllWindows();
    activeTaskId.value = task.id;
    remainingTime.value = task.duration;

    if (progressInterval.value) {
        clearInterval(progressInterval.value);
    }

    progressInterval.value = setInterval(() => {
        if (remainingTime.value > 0) {
            remainingTime.value--;
        } else {
            stopTask(task.id);
            showTaskTimeElapsedDialogue(task);
        }
    }, 1000);

    const overlayOptions = {
        width: 300,
        height: 200,
        x: screen.width - 320,
        y: 20,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        clickThrough: true,
    };

    try {
        // UPDATED: We don't need a callback for the overlay, so we just call it without the second argument.
        const { windowId: newWindowId } = await window.electronAPI.createWindow({
            route: 'overlay',
            options: overlayOptions,
            queryParams: {
                task: JSON.stringify(activeTask.value),
            }
        });
        activeTaskWindows.value = [...activeTaskWindows.value, newWindowId];
    } catch (error) {
        console.error("Failed to create window:", error);
    }
}

function stopTask(taskId: number): void {
    if (progressInterval.value) {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
    }
    activeTaskId.value = null;
    closeAllWindows();
}

// --- Main Component ---
const Home = () => {
    useEffect(() => {
        loadTasks();
        autoSaveChanges();

        return () => {
            if (progressInterval.value) {
                clearInterval(progressInterval.value);
            }
        };
    }, []);
    useEffect(() => {
        if (grabbedTaskId.value && hoveredTaskId.value) {
            const grabbedTask = tasks.value.find(task => task.id === grabbedTaskId.value);
            const hoveredTask = tasks.value.find(task => task.id === hoveredTaskId.value);

            tasks.value = tasks.value.map(task => {
                if (task.id === grabbedTaskId.value) {
                    return { ...task, order: hoveredTask.order };
                }
                if (task.id === hoveredTaskId.value) {
                    return { ...task, order: grabbedTask.order };
                }
                return task;
            });
        }
    }, [grabbedTaskId.value, hoveredTaskId.value]);
    useEffect(() => {
        if (grabbedTaskId.value !== null) {
            document.body.style.cursor = 'grabbing';
        }

        return () => {
            document.body.style.cursor = 'default';
        };
    }, [grabbedTaskId.value]);


    const {
        addTask,
        updateTaskName,
        cancelEdit,
        removeTask,
        toggleTaskCompleted,
        clearTasks,
        updateTaskDifficulty,
    } = manager();

    const sortedAndFilteredTasks = tasks.value
        .slice()
        .sort((a, b) => a.order - b.order)
        .filter((task) => {
            if (filter.value === "active") return !task.completed;
            if (filter.value === "completed") return task.completed;
            return true;
        });

    const completedTasksCount = tasks.value.filter(task => task.completed).length;

    return (
        <div onMouseUp={(e) => grabbedTaskId.value = null} className={styles.appContainer}>
            <form className={styles.inputContainer} onSubmit={addTask}>
                <input className={styles.input} placeholder="New task..." value={newTaskName.value} onChange={(e) => (newTaskName.value = e.target.value)} />
                <button type="submit" className={styles.button}>Add</button>
            </form>
            <div className={styles.toolbar}>
                <div className={styles.filter}>
                    <label htmlFor="filter-select">Show:</label>
                    <select
                        id="filter-select"
                        value={filter.value}
                        onChange={(e) => filter.value = e.target.value as TaskFilter}>
                        {filterOptions.map((option) => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.actions}>
                    <button onClick={clearTasks} className={styles.clearButton}>
                        Clear All
                    </button>
                </div>
                <div className={styles.taskStatus}>
                    <span>
                        {tasks.value.length === 0
                            ? "Add a task!"
                            : completedTasksCount === tasks.value.length
                                ? "All tasks completed"
                                : `${completedTasksCount} of ${tasks.value.length} completed`}
                    </span>
                </div>
            </div>

            <div className={styles.taskList}>
                {sortedAndFilteredTasks.map((task) => {
                    const isGrabbed = grabbedTaskId.value === task.id;
                    const taskItemClasses = [styles.taskItem, task.completed ? styles.completed : '',
                    isGrabbed ? styles.grabbing : '',
                    styles[task.difficulty]].filter(Boolean).join(' ');
                    const isActiveTask = activeTaskId.value === task.id;
                    const progressPercentage = activeTask.value && activeTask.value.duration > 0
                        ? ((activeTask.value.duration - remainingTime.value) / activeTask.value.duration) * 100
                        : 0;

                    return <div onMouseEnter={(e) => hoveredTaskId.value = task.id} onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            grabbedTaskId.value = task.id;
                        }
                    }} key={task.id} className={taskItemClasses}>
                        <div className={`${styles.checkboxIcon} ${task.completed ? styles.checked : ''}`} onClick={() => toggleTaskCompleted(task.id)}>
                            {task.completed && <img src={checkMarkIcon} alt="Task completed" className={styles.checkMarkImage} />}
                        </div>

                        {editedTaskId.value === task.id ? (
                            <>
                                <input
                                    className={styles.editInput}
                                    value={editedTaskName.value}
                                    onChange={(e) => (editedTaskName.value = e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && updateTaskName(task.id, editedTaskName.value)}
                                    autoFocus
                                />
                                <select className={styles.difficultySelect} value={task.duration} onChange={(e) => updateTaskDuration(task.id, parseInt(e.target.value))}>
                                    {durationOptions.map((option) => (
                                        <option key={option} value={option * 60}>
                                            {option} min
                                        </option>
                                    ))}
                                </select>
                                <select className={styles.difficultySelect} value={task.difficulty} onChange={(e) => updateTaskDifficulty(task.id, e.target.value as TaskDifficulty)}>
                                    {difficultyOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </option>
                                    ))}
                                </select>

                                <div className={styles.taskActions}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => updateTaskName(task.id, editedTaskName.value)}
                                        title="Save"
                                    >
                                        <img src={saveIcon} alt="Save Changes" />
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={cancelEdit}
                                        title="Cancel"
                                    >
                                        <img src={removeIcon} alt="Cancel Edit" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.taskDetails}>
                                    <div className={styles.taskNameContainer} onMouseDown={() => grabbedTaskId.value = task.id}>
                                        <span className={styles.taskName}>{task.name}</span>
                                        <span className={styles.taskDuration}>{formatDuration(task.duration, "short")}</span>
                                    </div>
                                    {isActiveTask && (
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
                                            <span className={styles.remainingTime}>
                                                {Math.floor(remainingTime.value / 60)}:{(remainingTime.value % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.taskActions}>
                                    {isActiveTask ? (
                                        <button className={`${styles.iconButton} ${styles.playButton}`} onClick={() => stopTask(task.id)} title="Stop">
                                            <img src={stopIcon} alt="Stop Task" />
                                        </button>
                                    ) : (
                                        <button className={`${styles.iconButton} ${styles.playButton}`} onClick={() => startTask(task)} title="Start">
                                            <img src={startIcon} alt="Start Task" />
                                        </button>
                                    )}

                                    <button className={styles.iconButton} onClick={() => { editedTaskId.value = task.id; editedTaskName.value = task.name; }} title="Edit">
                                        <img src={editIcon} alt="Edit Task" />
                                    </button>
                                    <button className={`${styles.iconButton} ${styles.removeButton}`} onClick={() => removeTask(task.id)} title="Remove">
                                        <img src={removeIcon} alt="Remove Task" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                })}
            </div>
        </div>
    );
};

export default Home;