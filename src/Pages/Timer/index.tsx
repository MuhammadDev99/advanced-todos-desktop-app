import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Task } from '../../types';
import styles from './style.module.css';

const Timer = () => {
    const location = useLocation();
    const [task, setTask] = useState<Task | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskParam = params.get('task');
        if (taskParam) {
            const parsedTask = JSON.parse(decodeURIComponent(taskParam));
            setTask(parsedTask);
            setTimeLeft(parsedTask.duration);
        }
    }, [location.search]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [timeLeft]);

    if (!task) {
        return <div>Loading task...</div>;
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className={styles.timerContainer}>
            <h2 className={styles.taskName}>{task.name}</h2>
            <div className={styles.timeLeft}>{formatTime(timeLeft)}</div>
        </div>
    );
};

export default Timer;