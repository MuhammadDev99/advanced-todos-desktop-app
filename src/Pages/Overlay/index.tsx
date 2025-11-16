import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './style.module.css';
import type { Task } from 'src/types';
import { signal } from '@preact/signals-react';

const task = signal<Task | null>(null);

const Overlay = () => {
    const location = useLocation();
    const [taskName, setTaskName] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [duration, setDuration] = useState(0);

    // Effect to parse task data from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskParam = params.get('task');
        if (taskParam) {
            const parsedTask = JSON.parse(decodeURIComponent(taskParam)) as Task;
            task.value = parsedTask;
            setTaskName(parsedTask.name);
            setTimeLeft(parsedTask.duration);
            setDuration(parsedTask.duration); // Store the initial duration
        }
    }, [location.search]);

    // Effect for the countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    if (!taskName) {
        return null; // Don't render anything if there's no task
    }

    const progressPercentage = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

    return (
        <div className={styles.overlayContainer}>
            <div className={styles.taskName}>
                <span>{taskName}</span>
            </div>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <div className={styles.timeLeft}>{formatTime(timeLeft)}</div>
        </div>
    );
};

export default Overlay;