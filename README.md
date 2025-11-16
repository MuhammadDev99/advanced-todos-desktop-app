# ✨ SparkyTodos

<img width="331" height="446" alt="Screenshot 2025-11-16 165211" src="https://github.com/user-attachments/assets/ad9aea54-d120-42de-80b3-99807ef2e6aa" />

SparkyTodos is a modern, feature-rich desktop to-do list application built for productivity. It goes beyond a simple checklist by integrating a task timer, difficulty settings, and a clean, draggable interface to help you focus and manage your workflow effectively.

Built with Electron, React, and TypeScript, it's a cross-platform app that runs smoothly on Windows, macOS, and Linux.

## 🚀 Key Features

*   **📝 Full Task Management:** Create, edit, and delete tasks with ease.
*   **⏱️ Integrated Task Timer:** Start a timer for any task to focus your work sessions. An elegant overlay window keeps track of your progress without being intrusive.
*   **🔔 Time-Up Dialogue:** When a timer finishes, SparkyTodos asks if you've completed the task or if you need to extend the timer, keeping your workflow seamless.
*   **👇 Drag & Drop:** Effortlessly reorder your tasks by simply dragging and dropping them into place.
*   **🎨 Task Difficulty:** Assign a difficulty level (Easy, Medium, Hard) to each task, visually color-coding your list for better prioritization.
*   **🔍 Smart Filtering:** Quickly filter your task list to show `all`, `active`, or `completed` items.
*   **💾 Persistent Storage:** Your tasks are automatically saved locally, so you'll never lose your progress when you close the app.
*   **🖥️ Cross-Platform:** Works on Windows, macOS, and Linux.

## 🛠️ Tech Stack

*   **Framework:** [Electron](https://www.electronjs.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **State Management:** [Preact Signals](https://preactjs.com/guide/v10/signals/) for efficient and reactive state.
*   **Bundler:** [Vite](https://vitejs.dev/)
*   **Packaging:** [Electron Forge](https://www.electronforge.io/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Local Storage:** [electron-store](https://github.com/sindresorhus/electron-store)

## ⚙️ Getting Started (For Developers)

To run SparkyTodos on your local machine, follow these steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MuhammadDev99/advanced-todos-desktop-app.git
    cd SparkyTodos
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm start
    ```
    This will launch the app with hot-reloading and developer tools enabled.

## 📦 Building for Production

To create a distributable, packaged version of the application for your operating system, run the following command:

```bash
npm run make
