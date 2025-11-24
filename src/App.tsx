import { DragDropProvider, type DragDropEvents } from '@dnd-kit/react';
import { arrayMove } from '@dnd-kit/helpers';
import { useState, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import { StackColumn } from './components/StackColumn';
import { TaskCard } from './components/TaskCard';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ArchivedTasksPanel } from './components/ArchivedTasksPanel';
import { loadAllData, saveTasks, saveStacks, saveHistory, saveArchivedTasks, saveAsset } from './db';
import type { Task, ArchivedTask, Stack, HistoryItem, HistoryActionType } from './db';
import { getDominantColor } from './utils/imageColor';


export default function App() {

    const [stacks, setStacks] = useState<Stack[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

    const [bgBlur, setBgBlur] = useState(() => {
        const saved = localStorage.getItem('bgBlur');
        return saved ? Number(saved) : 0;
    });
    const [bgGrain, setBgGrain] = useState(() => {
        const saved = localStorage.getItem('bgGrain');
        return saved ? Number(saved) : 0;
    });
    const [bgDarken, setBgDarken] = useState(() => {
        const saved = localStorage.getItem('bgDarken');
        return saved ? Number(saved) : 0;
    });
    const [showHero, setShowHero] = useState<boolean>(() => {
        const saved = localStorage.getItem('showHero');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem('accentColor') || '#0ea5e9'; // Default Sky 500
    });

    // Theme Color Management for Safari Tab Bar
    const [metaThemeColor, setMetaThemeColor] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme_color') || null;
        }
        return null;
    });

    const dragStartRef = useRef<{ index: number, stackId?: string, stackTitle?: string } | null>(null);

    // Load data from DB on mount
    useEffect(() => {
        const initData = async () => {
            try {
                const data = await loadAllData();

                // If DB is empty (first run), we can initialize with default data or keep empty
                // For now, let's keep it empty or use the previous test data if DB is empty
                if (data.stacks.length === 0 && data.tasks.length === 0) {
                    const defaultStacks = [
                        { id: 's1', title: 'Do Today', taskIds: ['a', 'b'] },
                        { id: 's2', title: 'Stagnant', taskIds: ['c'] },
                        { id: 's3', title: 'Done', taskIds: ['d'] },
                    ];
                    const defaultTasks = [
                        { id: 'a', title: 'This is the most prioritized task', description: 'Please Please Please', isFinished: false, createdAt: 1763712401 },
                        { id: 'b', title: 'Another important task', description: 'Get this done soon', isFinished: false, createdAt: 1763712402 },
                        { id: 'c', title: 'Stagnant task example', description: 'This one is stuck', isFinished: false, createdAt: 1763712403 },
                        { id: 'd', title: 'Completed task', description: 'This task is finished', isFinished: true, createdAt: 1763712404 },
                    ];
                    setStacks(defaultStacks);
                    setTasks(defaultTasks);
                    // Save defaults to DB
                    await saveStacks(defaultStacks);
                    await saveTasks(defaultTasks);
                } else {
                    setStacks(data.stacks);
                    setTasks(data.tasks);
                    setHistory(data.history);
                    setArchivedTasks(data.archivedTasks);
                    if (data.backgroundImage && localStorage.getItem('theme_color')) {
                        setBackgroundImage(data.backgroundImage as string);
                    }
                }
            } catch (error) {
                console.error("Failed to load data from DB:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        initData();
    }, []);

    // Save changes to DB
    // We use a debounce or just save on every change. 
    // Since IndexedDB is async and fast enough for this scale, saving on effect is fine.
    // However, to avoid too many writes during rapid drag, we might want to debounce, 
    // but for simplicity and reliability (Option B), let's save when state settles.

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        if (isLoaded) {
            saveStacks(stacks);
        }
    }, [stacks, isLoaded]);

    useEffect(() => {
        if (isLoaded) saveTasks(tasks);
    }, [tasks, isLoaded]);

    useEffect(() => {
        if (isLoaded) saveHistory(history);
    }, [history, isLoaded]);

    useEffect(() => {
        if (isLoaded) saveArchivedTasks(archivedTasks);
    }, [archivedTasks, isLoaded]);

    useEffect(() => {
        if (isLoaded && backgroundImage) {
            // For background image, we might want to be careful not to save null if it wasn't loaded yet
            // But here we only save if it's not null, or if user explicitly cleared it (handled in handler)
            saveAsset('backgroundImage', backgroundImage);
        } else if (isLoaded && backgroundImage === null) {
            // If user cleared it, we should probably remove it from DB or save null?
            // saveAsset doesn't support delete, but we can overwrite or ignore.
            // Let's assume saveAsset handles overwrite.
        }
    }, [backgroundImage, isLoaded]);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('bgBlur', bgBlur.toString());
        localStorage.setItem('bgGrain', bgGrain.toString());
        localStorage.setItem('bgDarken', bgDarken.toString());
        localStorage.setItem('showHero', JSON.stringify(showHero));
        localStorage.setItem('accentColor', accentColor);

        // Apply accent color
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [bgBlur, bgGrain, bgDarken, showHero, accentColor]);

    // Override setBackgroundImage to also save to DB immediately for better UX
    const handleSetBackgroundImage = async (url: string | null) => {
        setBackgroundImage(url);
        if (url) {
            saveAsset('backgroundImage', url); // save/override to IndexedDB
            // Calculate and save dominant color
            try {
                const color = await getDominantColor(url, bgDarken);
                setMetaThemeColor(color); // update meta theme color
                localStorage.setItem('theme_color', color); // save to localStorage
            } catch (error) {
                console.error("Failed to extract color", error);
            }
        } else {
            // user click reset button
            // Clear custom color
            setMetaThemeColor(null);
            localStorage.removeItem('theme_color');
            // clear backgroundImage state
            setBackgroundImage(null);
        }
    };


    const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);



    const { theme, setTheme } = useTheme();


    // Apply meta theme color and update CSS variable
    useEffect(() => {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
        }

        const root = document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const defaultColorFromAccent = isDark
            ? `color-mix(in srgb, ${accentColor} 8%, black)`
            : `color-mix(in srgb, ${accentColor} 8%, white)`;

        if (metaThemeColor) {
            meta.setAttribute('content', metaThemeColor);
            root.style.setProperty('--bg-color', metaThemeColor);
            setMetaThemeColor(metaThemeColor);
        } else {
            // Fallback to theme defaults if no custom color derived from image
            meta.setAttribute('content', defaultColorFromAccent);
            root.style.setProperty('--bg-color', defaultColorFromAccent);
            // setMetaThemeColor(defaultColor);
        }

    }, [metaThemeColor, theme, accentColor]);

    useEffect(() => {
        if (backgroundImage) {
            const updateColor = async () => {
                try {
                    const color = await getDominantColor(backgroundImage, bgDarken);
                    setMetaThemeColor(color);
                    localStorage.setItem('theme_color', color);
                } catch (error) {
                    console.error("Failed to update color with darken effect", error);
                }
            };
            // Debounce slightly to avoid too many calcs during slider drag
            const timer = setTimeout(updateColor, 200);
            return () => clearTimeout(timer);
        }
    }, [bgDarken, backgroundImage]);

    useEffect(() => {
        // Clean up body styles when component unmounts or when we switch to div-based background
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundAttachment = '';
    }, []);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'system') return 'light';
            if (prev === 'light') return 'dark';
            return 'system';
        });
    };

    const handleAddTask = (stackId: string, title: string, description: string, dueDate?: number) => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            description,
            isFinished: false,
            createdAt: Date.now(),
            dueDate,
        };

        const stack = stacks.find(s => s.id === stackId);
        addToHistory('ADD_TASK', `Added "${title}" to ${stack?.title || 'stack'}`);

        setTasks(prev => [...prev, newTask]);

        setStacks(prev => prev.map(stack => {
            if (stack.id === stackId) {
                return {
                    ...stack,
                    taskIds: [newTask.id, ...stack.taskIds]
                };
            }
            return stack;
        }));
    };

    const handleUpdateTask = (taskId: string, title: string, description: string, dueDate?: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && (task.title !== title || task.description !== description || task.dueDate !== dueDate)) {
            addToHistory('UPDATE_TASK', `Updated details for "${task.title}"`);
        }
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                return { ...task, title, description, dueDate };
            }
            return task;
        }));
    };

    const handleToggleTaskStatus = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            addToHistory('UPDATE_STATUS', `Marked "${task.title}" as ${!task.isFinished ? 'complete' : 'incomplete'}`);
        }
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                return { ...task, isFinished: !task.isFinished };
            }
            return task;
        }));
    };

    const handleAddStack = (title: string) => {
        addToHistory('ADD_STACK', `Created new stack "${title}"`);
        const newStack: Stack = {
            id: uuidv4(),
            title,
            taskIds: [],
        };
        setStacks(prev => [...prev, newStack]);
    };

    const handleDeleteStack = (stackId: string) => {
        const stack = stacks.find(s => s.id === stackId);
        if (stack) {
            addToHistory('DELETE_STACK', `Deleted stack "${stack.title}"`);
        }
        setStacks(prev => prev.filter(stack => stack.id !== stackId));
    };

    const addToHistory = (actionType: HistoryActionType, details: string) => {
        setHistory(prev => [...prev, {
            id: uuidv4(),
            timestamp: Date.now(),
            actionType,
            details
        }]);
    };

    const handleDeleteHistoryItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleRenameStack = (stackId: string, newTitle: string) => {
        const stack = stacks.find(s => s.id === stackId);
        if (stack && stack.title !== newTitle) {
            addToHistory('UPDATE_STACK', `Renamed stack "${stack.title}" to "${newTitle}"`);
        }
        setStacks(prev => prev.map(stack => {
            if (stack.id === stackId) {
                return { ...stack, title: newTitle };
            }
            return stack;
        }));
    };

    const handleDeleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const stack = stacks.find(s => s.taskIds.includes(taskId));

        if (task) {
            addToHistory('DELETE_TASK', `Deleted task "${task.title}" from "${stack?.title || 'stack'}"`);
        }

        setTasks(prev => prev.filter(t => t.id !== taskId));
        setStacks(prev => prev.map(s => ({
            ...s,
            taskIds: s.taskIds.filter(id => id !== taskId)
        })));
    };

    const handleArchiveTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const stack = stacks.find(s => s.taskIds.includes(taskId));

        if (task) {
            addToHistory('ARCHIVE_TASK', `Archived task "${task.title}" from "${stack?.title || 'stack'}"`);
            setArchivedTasks(prev => [...prev, {
                ...task,
                originalStackId: stack?.id || '',
                archivedAt: Date.now(),
            }]);
        }

        setTasks(prev => prev.filter(t => t.id !== taskId));
        setStacks(prev => prev.map(s => ({
            ...s,
            taskIds: s.taskIds.filter(id => id !== taskId)
        })));
    };

    const handleDeleteArchivedTask = (taskId: string) => {
        setArchivedTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleRestoreArchivedTask = (taskId: string) => {
        const taskToRestore = archivedTasks.find(t => t.id === taskId);
        if (!taskToRestore) return;

        // Remove from archive
        setArchivedTasks(prev => prev.filter(t => t.id !== taskId));

        const restoredTask: Task = {
            id: taskToRestore.id,
            title: taskToRestore.title,
            description: taskToRestore.description,
            isFinished: taskToRestore.isFinished,
            createdAt: taskToRestore.createdAt,
            dueDate: taskToRestore.dueDate,
        };

        setTasks(prev => [...prev, restoredTask]);

        // Add back to stack
        const targetStackId = taskToRestore.originalStackId;
        const stackExists = stacks.some(s => s.id === targetStackId);

        if (stackExists) {
            setStacks(prev => prev.map(s => {
                if (s.id === targetStackId) {
                    return { ...s, taskIds: [...s.taskIds, restoredTask.id] };
                }
                return s;
            }));
        } else {
            // Fallback: Add to the first stack if original doesn't exist
            if (stacks.length > 0) {
                setStacks(prev => {
                    const newStacks = [...prev];
                    newStacks[0] = { ...newStacks[0], taskIds: [...newStacks[0].taskIds, restoredTask.id] };
                    return newStacks;
                });
            }
        }

        addToHistory('ADD_TASK', `Restored task "${restoredTask.title}" from archive`);
    };

    return (
        <div className="h-screen flex flex-col overflow-visible p-8 transition-colors duration-300">
            {/* Custom Background Layer */}
            {(backgroundImage || bgGrain > 0) && (
                <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
                    {/* Image Layer with Blur */}
                    {backgroundImage && (
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: `blur(${bgBlur}px)`,
                                transform: 'scale(1.1) translate3d(0,0,0)', // Force GPU to fix Safari repaint
                                transition: 'filter 300ms ease-out', // Animate ONLY filter to prevent scale animation on load
                                WebkitBackfaceVisibility: 'hidden', // Extra Safari fix
                                backfaceVisibility: 'hidden',
                            }}
                        />
                    )}
                    {/* Grain Layer */}
                    {bgGrain > 0 && (
                        <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-300"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                                opacity: bgGrain / 100,
                                mixBlendMode: 'overlay'
                            }}
                        />
                    )}
                    {/* Darken Layer */}
                    {bgDarken > 0 && (
                        <div
                            className="absolute inset-0 transition-colors duration-300"
                            style={{
                                backgroundColor: `rgba(0, 0, 0, ${bgDarken / 100})`
                            }}
                        />
                    )}
                </div>
            )}

            {/* Hero Section */}
            <header className="mb-2 mt-2 text-center relative z-10">
                <div className={`absolute ${!showHero ? 'top-0' : 'top-4'} right-4 flex gap-3 items-center`}>
                    <button
                        onClick={() => setIsArchiveOpen(true)}
                        className="p-2 rounded-full bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) hover:border-(--accent-color) hover:scale-110 active:scale-95 transition-all cursor-pointer text-(--glass-card-text)"
                        title="Archived Tasks"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="p-2 rounded-full bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) hover:border-(--accent-color) hover:scale-110 active:scale-95 transition-all cursor-pointer text-(--glass-card-text)"
                        title="History"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-2 rounded-full backdrop-blur-sm border hover:scale-110 active:scale-95 transition-all cursor-pointer text-(--glass-card-text) ${isSettingsOpen ? 'bg-(--accent-color) border-(--accent-color) text-white rotate-90' : 'bg-(--glass-card-bg) border-(--glass-card-border) text-(--glass-card-text) hover:bg-(--glass-card-hover-bg) hover:border-(--accent-color)'}`}
                        title="Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) hover:border-(--accent-color) hover:scale-110 active:scale-95 transition-all cursor-pointer text-(--glass-card-text)"
                        title={`Current theme: ${theme}`}
                    >
                        {theme === 'light' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0" />
                            </svg>
                        )}
                        {theme === 'dark' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>
                        )}
                        {theme === 'system' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                            </svg>
                        )}
                    </button>

                    <SettingsPanel
                        isOpen={isSettingsOpen}
                        // onClose={() => setIsSettingsOpen(false)}
                        onAddStack={handleAddStack}
                        showHero={showHero}
                        onToggleHero={() => setShowHero(prev => !prev)}
                        onSetBackgroundImage={handleSetBackgroundImage}
                        bgBlur={bgBlur}
                        onSetBgBlur={setBgBlur}
                        bgGrain={bgGrain}
                        onSetBgGrain={setBgGrain}
                        bgDarken={bgDarken}
                        onSetBgDarken={setBgDarken}
                        accentColor={accentColor}
                        onSetAccentColor={setAccentColor}
                    />
                    <HistoryPanel
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        history={history}
                        onDeleteHistoryItem={handleDeleteHistoryItem}
                        accentColor={accentColor}
                    />
                    <ArchivedTasksPanel
                        isOpen={isArchiveOpen}
                        onClose={() => setIsArchiveOpen(false)}
                        archivedTasks={archivedTasks}
                        onDelete={handleDeleteArchivedTask}
                        onRestore={handleRestoreArchivedTask}
                    />
                </div>
                {showHero ? (
                    <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-(--accent-color) opacity-30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-[oklch(from_var(--accent-color)_l_c_calc(h-30))] via-(--accent-color) to-[oklch(from_var(--accent-color)_l_c_calc(h+30))] animate-gradient-x">
                                Stack Manager
                            </span>
                        </h1>
                        <p className="text-xl text-(--glass-card-text-muted) max-w-2xl mx-auto font-light">
                            Organize tasks with <span className="text-(--accent-color) font-medium">stacks.</span>
                        </p>
                    </>
                ) : (
                    <div className="h-12"></div>
                )}
            </header>

            <DragDropProvider
                onDragStart={(event) => {
                    const { source } = event.operation;
                    if (source && source.type === 'Stack') {
                        const index = stacks.findIndex(s => s.id === source.id);
                        if (index !== -1) {
                            dragStartRef.current = { index };
                        }
                    } else if (source && source.type === 'Task') {
                        const stack = stacks.find(s => s.taskIds.includes(source.id as string));
                        if (stack) {
                            const index = stack.taskIds.indexOf(source.id as string);
                            dragStartRef.current = { index, stackId: stack.id, stackTitle: stack.title };
                        }
                    }
                }}
                onDragOver={(event) => {
                    setStacks(prevStacks => move_items(prevStacks, event));
                }}
                onDragEnd={(event) => {
                    const { source, target } = event.operation;

                    if (source && target && dragStartRef.current) {
                        if (source.type === 'Stack') {
                            const stack = stacks.find(s => s.id === source.id);
                            const newIndex = stacks.findIndex(s => s.id === source.id);
                            const oldIndex = dragStartRef.current.index;

                            if (stack && newIndex !== -1 && newIndex !== oldIndex) {
                                addToHistory('MOVE_STACK', `Reordered stack "${stack.title}" from index ${oldIndex} to ${newIndex}`);
                            }
                        } else if (source.type === 'Task') {
                            const task = tasks.find(t => t.id === source.id);
                            const newStack = stacks.find(s => s.taskIds.includes(source.id as string));

                            if (task && newStack) {
                                const newIndex = newStack.taskIds.indexOf(source.id as string);
                                const oldIndex = dragStartRef.current.index;
                                const oldStackTitle = dragStartRef.current.stackTitle;

                                if (dragStartRef.current.stackId === newStack.id) {
                                    // Same stack move
                                    if (newIndex !== oldIndex) {
                                        addToHistory('MOVE_TASK', `Moved task "${task.title}" in "${newStack.title}" from index ${oldIndex} to ${newIndex}`);
                                    }
                                } else {
                                    // Different stack move
                                    addToHistory('MOVE_TASK', `Moved task "${task.title}" from "${oldStackTitle}" index ${oldIndex} to "${newStack.title}" index ${newIndex}`);
                                }
                            }
                        }
                    }
                    dragStartRef.current = null;
                }}
            >
                <div className='flex-1 min-h-0 flex flex-row gap-6 items-start justify-center overflow-x-auto overflow-y-hidden pb-4 pt-4'>
                    {stacks.map((stack, index) => (
                        <StackColumn
                            key={stack.id}
                            stack={stack}
                            index={index}
                            onAddTask={handleAddTask}
                            onDeleteStack={handleDeleteStack}
                            onRenameStack={handleRenameStack}
                        >
                            {stack.taskIds.map((taskId, index) => {
                                const task = tasksById.get(taskId);
                                if (!task) return null;
                                return (
                                    <TaskCard
                                        key={taskId}
                                        task={task}
                                        stackId={stack.id}
                                        index={index}
                                        onUpdateTask={handleUpdateTask}
                                        onToggleStatus={handleToggleTaskStatus}
                                        onDeleteTask={handleDeleteTask}
                                        onArchiveTask={handleArchiveTask}
                                    />
                                );
                            })}
                        </StackColumn>
                    ))}
                </div>
            </DragDropProvider >
        </div>
    );
}



// Helper type to extract the event object type from DragDropEvents
// We use 'any' for the generics as we just want the event structure
type DragDropEvent = Parameters<DragDropEvents<any, any, any>['dragover']>[0];

function move_items(stacks: Stack[], event: DragDropEvent) {
    const { source, target } = event.operation;

    if (!source || !target) return stacks;

    // Case 1: Moving a Stack
    if (source.type === 'Stack') {
        const sourceIndex = stacks.findIndex(s => s.id === source.id);
        if (sourceIndex === -1) return stacks;

        let targetStackId: string | undefined;

        if (target.type === 'Stack') {
            targetStackId = target.id as string;
        } else if (target.type === 'Task') {
            // If we drag a stack over a task, we're essentially dragging it over that task's stack
            const targetStack = stacks.find(s => s.taskIds.includes(target.id as string));
            targetStackId = targetStack?.id;
        }

        if (!targetStackId) return stacks;

        const targetIndex = stacks.findIndex(s => s.id === targetStackId);
        if (targetIndex === -1 || sourceIndex === targetIndex) return stacks;

        return arrayMove(stacks, sourceIndex, targetIndex);
    }

    // Case 2: Moving a Task
    if (source.type === 'Task') {
        const sourceId = source.id as string;
        const targetId = target.id as string;

        // Find the source stack
        const sourceStack = stacks.find(s => s.taskIds.includes(sourceId));
        if (!sourceStack) return stacks;
        const sourceIndex = sourceStack.taskIds.indexOf(sourceId);

        // Find the target stack
        // If target is a Stack, we drop into it.
        // If target is a Task, we drop into its parent stack.
        let targetStack: Stack | undefined;
        let targetIndex: number;

        if (target.type === 'Stack') {
            targetStack = stacks.find(s => s.id === targetId);
            if (!targetStack) return stacks;
            // If dropping on a stack, append to the end
            targetIndex = targetStack.taskIds.length;
        } else if (target.type === 'Task') {
            targetStack = stacks.find(s => s.taskIds.includes(targetId));
            if (!targetStack) return stacks;
            targetIndex = targetStack.taskIds.indexOf(targetId);
        } else {
            // Unknown target type
            return stacks;
        }

        // Sub-case: Moving within the same stack
        if (sourceStack.id === targetStack.id) {
            if (sourceIndex === targetIndex) return stacks;

            const newTaskIds = arrayMove(sourceStack.taskIds, sourceIndex, targetIndex);

            return stacks.map(stack => {
                if (stack.id === sourceStack.id) {
                    return { ...stack, taskIds: newTaskIds };
                }
                return stack;
            });
        }

        // Sub-case: Moving to a different stack
        const newSourceTaskIds = [...sourceStack.taskIds];
        newSourceTaskIds.splice(sourceIndex, 1); // Remove from source

        const newTargetTaskIds = [...targetStack.taskIds];
        newTargetTaskIds.splice(targetIndex, 0, sourceId); // Insert into target

        return stacks.map(stack => {
            if (stack.id === sourceStack.id) {
                return { ...stack, taskIds: newSourceTaskIds };
            }
            if (stack.id === targetStack!.id) {
                return { ...stack, taskIds: newTargetTaskIds };
            }
            return stack;
        });
    }

    return stacks;
};


function useTheme() {
    // Initialize state from localStorage to match the script logic
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'system';
        }
        return 'system';
    });

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            if (theme === 'dark') {
                root.classList.add('dark');
            } else if (theme === 'light') {
                root.classList.remove('dark');
            } else {
                // System mode logic
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme();

        // Save manual choice
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }

        // Event listener for System changes
        const handleSystemChange = () => {
            if (theme === 'system') applyTheme();
        };

        mediaQuery.addEventListener('change', handleSystemChange);

        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [theme]);

    return { theme, setTheme };
}