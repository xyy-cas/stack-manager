import Dexie, { type Table } from 'dexie';

export interface Task {
    id: string;
    title: string;
    description: string;
    isFinished: boolean;
    createdAt: number;   // Timestamp
    dueDate?: number;    // Optional Due Date Timestamp
}

export interface ArchivedTask {
    id: string;
    title: string;
    description: string;
    isFinished: boolean;
    createdAt: number;   // Timestamp
    originalStackId: string;
    archivedAt: number;   // Timestamp
    dueDate?: number;    // Optional Due Date Timestamp
}

export interface Stack {
    id: string;
    title: string;
    // CRITICAL: This array defines the ORDER. It stores the list of tasks in this stack.
    taskIds: string[];
}

export type HistoryActionType =
    | 'ADD_TASK'
    | 'UPDATE_TASK'
    | 'UPDATE_STATUS'
    | 'ADD_STACK'
    | 'DELETE_STACK'
    | 'MOVE_STACK'
    | 'MOVE_TASK'
    | 'DELETE_TASK'
    | 'ARCHIVE_TASK'
    | 'UPDATE_STACK';

export interface HistoryItem {
    id: string;
    timestamp: number;
    actionType: HistoryActionType;
    details: string;
}

export interface Asset {
    key: string;
    data: Blob | string; // Support both Blob and Data URL string
}

class StackManagerDB extends Dexie {
    tasks!: Table<Task>;
    stacks!: Table<Stack>;
    history!: Table<HistoryItem>;
    archivedTasks!: Table<ArchivedTask>;
    assets!: Table<Asset>;

    constructor() {
        super('StackManagerDB');
        this.version(1).stores({
            tasks: 'id',
            stacks: 'id',
            history: 'id, timestamp',
            archivedTasks: 'id',
            assets: 'key'
        });
    }
}

export const db = new StackManagerDB();

// Helper functions for DB operations
export const saveTasks = async (tasks: Task[]) => {
    await db.transaction('rw', db.tasks, async () => {
        await db.tasks.clear();
        await db.tasks.bulkAdd(tasks);
    });
};

export const saveStacks = async (stacks: Stack[]) => {
    await db.transaction('rw', db.stacks, async () => {
        await db.stacks.clear();
        await db.stacks.bulkAdd(stacks);
    });
};

export const saveHistory = async (history: HistoryItem[]) => {
    // For history, we might want to append rather than clear/rewrite, 
    // but for simplicity in Option B (sync state -> DB), we'll overwrite for now 
    // or we can just add new items individually. 
    // Given the user request for "load all data... fire DB update", 
    // let's provide a way to save the whole state or individual items.

    // Actually, for history, it's safer to just add individual items as they happen
    // to avoid overwriting with stale state if multiple tabs were open (though not a requirement here).
    // But to stick to the "sync state to DB" pattern:
    await db.transaction('rw', db.history, async () => {
        await db.history.clear();
        await db.history.bulkAdd(history);
    });
};

export const saveArchivedTasks = async (archivedTasks: ArchivedTask[]) => {
    await db.transaction('rw', db.archivedTasks, async () => {
        await db.archivedTasks.clear();
        await db.archivedTasks.bulkAdd(archivedTasks);
    });
};

export const saveAsset = async (key: string, data: Blob | string) => {
    await db.assets.put({ key, data });
};

export const getAsset = async (key: string) => {
    return await db.assets.get(key);
};

export const loadAllData = async () => {
    const tasks = await db.tasks.toArray();
    const stacks = await db.stacks.toArray();
    const history = await db.history.toArray();
    const archivedTasks = await db.archivedTasks.toArray();
    const bgAsset = await db.assets.get('backgroundImage');

    return {
        tasks,
        stacks,
        history,
        archivedTasks,
        backgroundImage: bgAsset ? bgAsset.data : null
    };
};

export const clearDatabase = async () => {
    await db.transaction('rw', [db.tasks, db.stacks, db.history, db.archivedTasks, db.assets], async () => {
        await db.tasks.clear();
        await db.stacks.clear();
        await db.history.clear();
        await db.archivedTasks.clear();
        await db.assets.clear();
    });
};
