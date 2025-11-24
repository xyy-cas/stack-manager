import { useState, type KeyboardEvent, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/react/sortable';

import type { Task } from '../db';

interface Props {
    task: Task;
    stackId: string;
    index: number;
    onUpdateTask: (taskId: string, title: string, description: string, dueDate?: number) => void;
    onToggleStatus: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onArchiveTask: (taskId: string) => void;
}

export function TaskCard({ task, stackId, index, onUpdateTask, onToggleStatus, onDeleteTask, onArchiveTask }: Props) {
    const { ref, isDragging } = useSortable({
        id: task.id,
        index,
        type: 'Task',
        accept: ['Task'],
        group: stackId,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);

    // Helper to format timestamp for datetime-local input
    const formatDateForInput = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        // Adjust for local timezone offset to ensure correct display
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const [editDueDate, setEditDueDate] = useState(formatDateForInput(task.dueDate));

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setContextMenu(null);
            }
        };

        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('contextmenu', handleClickOutside, { capture: true });
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside, { capture: true });
        };
    }, [contextMenu]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent stack context menu
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditDueDate(formatDateForInput(task.dueDate));
        setContextMenu(null);
    };

    const handleToggleStatusClick = () => {
        onToggleStatus(task.id);
        setContextMenu(null);
    };

    const handleDeleteClick = () => {
        onDeleteTask(task.id);
        setContextMenu(null);
    };

    const handleArchiveClick = () => {
        onArchiveTask(task.id);
        setContextMenu(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditDueDate(formatDateForInput(task.dueDate));
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;
        const dueDateTimestamp = editDueDate ? new Date(editDueDate).getTime() : undefined;
        onUpdateTask(task.id, editTitle, editDescription, dueDateTimestamp);
        setIsEditing(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div
                ref={ref}
                className="bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) p-4 rounded-xl mb-3 cursor-default"
            >
                <input
                    autoFocus
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-lg font-medium text-(--glass-card-text) placeholder-(--glass-card-text-muted) mb-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <textarea
                    className="w-full bg-transparent border-none outline-none text-sm text-(--glass-card-text-muted) placeholder-(--glass-card-text-muted)/70 resize-none mb-3"
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="datetime-local"
                        className="bg-transparent border border-(--glass-card-border) rounded-lg px-2 py-1 text-xs text-(--glass-card-text-muted) outline-none focus:border-(--accent-color) transition-colors"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-xs font-medium text-(--glass-card-text-muted) hover:text-(--glass-card-text) transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1.5 text-xs font-medium bg-(--accent-color) text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                ref={ref}
                onContextMenu={handleContextMenu}
                className="bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) transition-all duration-300 hover:bg-(--glass-card-hover-bg) hover:-translate-y-0.5 hover:shadow-[0_5px_5px_color(display-p3_0_0_0/0.1)] hover:border-(--accent-color) p-4 rounded-xl mb-3 cursor-grab active:cursor-grabbing group relative"
                data-dragging={isDragging}
            >
                <h4 className={`font-medium text-lg mb-1 transition-colors ${task.isFinished ? 'line-through text-(--glass-card-text-muted)' : 'text-(--glass-card-text) group-hover:text-(--accent-color)'}`}>
                    {task.title}
                </h4>
                {task.description && <p className="text-sm text-(--glass-card-text-muted) group-hover:text-(--glass-card-text) transition-colors">{task.description}</p>}
                {task.dueDate && (
                    <div className="mt-2 flex items-center justify-between text-xs text-(--glass-card-text-muted)">
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span>{new Date(task.dueDate).toLocaleString()}</span>
                        </div>
                        <span className="font-mono opacity-80">
                            {(() => {
                                const now = Date.now();
                                const diff = task.dueDate! - now;
                                if (diff <= 0) return 'Overdue';
                                const seconds = Math.floor(diff / 1000);
                                const days = Math.floor(seconds / (3600 * 24));
                                const hours = Math.floor(seconds / 3600);
                                const minutes = Math.floor(seconds / 60);

                                if (days >= 1) return `${days}d`;
                                if (hours >= 1) return `${hours}h`;
                                return `${minutes}m`;
                            })()}
                        </span>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-50 w-48 bg-(--glass-panel-bg) backdrop-blur-xl border border-(--glass-panel-border) shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleEditClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-(--glass-card-text) hover:bg-(--glass-card-hover-bg) transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit Task
                    </button>
                    <button
                        onClick={handleToggleStatusClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-(--glass-card-text) hover:bg-(--glass-card-hover-bg) transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        {task.isFinished ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                </svg>
                                Mark Incomplete
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                Mark Complete
                            </>
                        )}
                    </button>
                    <div className="h-px bg-(--glass-panel-border) my-1" />
                    <button
                        onClick={handleArchiveClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-(--glass-card-text) hover:bg-(--glass-card-hover-bg) transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                        Archive Task
                    </button>
                    <div className="h-px bg-(--glass-panel-border) my-1" />
                    <button
                        onClick={handleDeleteClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete Task
                    </button>
                </div>,
                document.body
            )}
        </>
    );
}