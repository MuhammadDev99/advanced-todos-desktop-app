import styles from "./style.module.css";

const NavigationBar = () => {
    return <>
        <div className={styles.default}>
            <a href="/">Home</a>
            <a href="/about">About</a>
        </div>
    </>;
}

export default NavigationBar