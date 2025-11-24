# Stack Manager

Manage your tasks in a stack-like Kanban board. Fully offline, using localStorage and IndexedDB. [Use it now!](https://xyy-cas.github.io/stack-manager/) (CN mainland users can also use [this](https://xyy.ac.cn/h/stack-manager/))

<!-- put a screenshot here -->
![Stack Manager](SCREENSHOT.png)

## Features

### 📋 Drag & Drop Task Management

- Create multiple stacks to organize your tasks.
- Intuitive drag-and-drop interface for task management. 
- Create tasks with Due Dates (DDL).


### 🎨 Customization
Make the workspace truly yours with extensive personalization options:
- **Themes:** Support for Light, Dark, and System modes.
- **Backgrounds:** Upload your own background images.
- **Visual Effects:** Fine-tune your background with adjustable **Blur**, **Grain**, and **Darken** sliders for perfect readability.
- **Accent Colors:** Choose from a curated palette or pick any custom color to match your style.
- **Hero Section:** Toggle the prominent header section for a focused or decorative view.

### ⏱️ History & Analytics
- **Activity Log:** Every action (add, move, edit, delete) is tracked.
- **Heatmap Visualization:** View your productivity over time with a GitHub-style contribution heatmap.

### 💾 Data Persistence
- **Local Storage:** All your data—tasks, stacks, history, and settings—is safely stored locally in your browser using **IndexedDB** (via Dexie.js) and **localStorage**. No account required, and your data stays with you.

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Database:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Visualization:** [@uiw/react-heat-map](https://uiwjs.github.io/react-heat-map/)

## Development

0. Ensure you have Node.js installed on your machine.

1.  Clone the repository:
    ```bash
    git clone https://github.com/xyy-cas/stack-manager
    cd stack-manager
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist` folder with optimized application assets.

## License

[MIT](LICENSE)