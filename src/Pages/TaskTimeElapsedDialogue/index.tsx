import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { Task, TaskTimeElapsedDialogResult } from '../../types';
import styles from './style.module.css';
import { signal } from '@preact/signals-react';

const task = signal<Task | null>(null);
const durationOptions: number[] = [0.1, 1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];
const extendedDuration = signal<number>(durationOptions[2]);
const TaskTimeElapsedDialogue = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const windowId = searchParams.get('windowId');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskParam = params.get('task');

        if (taskParam) {
            try {
                const parsedTask = JSON.parse(decodeURIComponent(taskParam)) as Task;
                task.value = parsedTask;
            } catch (error) {
                console.error("Failed to parse task from URL:", error);
                // Handle the error appropriately
            }
        }
    }, [location.search]);

    if (!task.value) {
        return <div className={styles.loading}>Loading task...</div>;
    }
    function handleCompleted() {
        const taskTimeElapsedDialogResult: TaskTimeElapsedDialogResult = { taskId: task.value.id, duration: task.value.duration, completed: true, label: 'completed' };
        window.electronAPI.sendWindowResult({ windowId, result: taskTimeElapsedDialogResult });
    }
    function handleExtend() {
        const newDuration = extendedDuration.value * 60;
        const taskTimeElapsedDialogResult: TaskTimeElapsedDialogResult = { taskId: task.value.id, duration: newDuration, completed: false, label: 'extend' };
        window.electronAPI.sendWindowResult({ windowId, result: taskTimeElapsedDialogResult });
    }
    return (
        <div className={styles.dialogueContainer}>
            <div className={styles.dialogue}>
                <p className={styles.message}>
                    Time has elapsed for <span className={styles.taskName}>{task.value.name}</span>
                </p>
                <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.button} ${styles.completedButton}`}
                        onClick={handleCompleted}
                    >
                        Completed!
                    </button>
                    <div className={styles.extendGroup}>
                        <button
                            className={`${styles.button} ${styles.extendButton}`}
                            onClick={handleExtend}
                        >
                            Extend for
                        </button>
                        <select value={extendedDuration.value} onChange={(e) => extendedDuration.value = parseInt(e.target.value)} className={styles.durationSelect}>
                            {durationOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option} minutes
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskTimeElapsedDialogue;