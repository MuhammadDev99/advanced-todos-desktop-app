import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from './Layout';
import Home from './Pages/Home';
import About from './Pages/About';
import Overlay from './Pages/Overlay'; // <-- Import the new Overlay component
import Timer from './Pages/Timer';
import './index.css';
import TaskTimeElapsedDialogue from './Pages/TaskTimeElapsedDialogue';
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/task-time-elapsed-dialogue" element={<TaskTimeElapsedDialogue />} />
      </Routes>
    </HashRouter>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);