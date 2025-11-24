import React, { useState, type KeyboardEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useSortable } from '@dnd-kit/react/sortable';

import type { Stack } from '../db';

interface Props {
    children?: React.ReactNode;
    stack: Stack;
    index: number;
    onAddTask: (stackId: string, title: string, description: string, dueDate?: number) => void;
    onDeleteStack: (stackId: string) => void;
    onRenameStack: (stackId: string, newTitle: string) => void;
}

export function StackColumn({ children, stack, index, onAddTask, onDeleteStack, onRenameStack }: Props) {

    // This allows us to drop an item onto the empty column area
    const { ref } = useSortable({
        id: stack.id,
        index,
        type: 'Stack',
        collisionPriority: CollisionPriority.Lowest,
        accept: ['Stack', 'Task'],
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newDueDate, setNewDueDate] = useState('');

    const handleAddTaskClick = () => {
        setIsAdding((prev) => !prev);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
    };

    const handleSubmit = () => {
        if (!newTitle.trim()) return;
        const dueDateTimestamp = newDueDate ? new Date(newDueDate).getTime() : undefined;
        onAddTask(stack.id, newTitle, newDescription, dueDateTimestamp);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setIsAdding(false);
    };

    const [isRenaming, setIsRenaming] = useState(false);
    const [renameTitle, setRenameTitle] = useState(stack.title);

    const handleRenameClick = () => {
        setIsRenaming(true);
        setRenameTitle(stack.title);
        setContextMenu(null);
    };

    const handleRenameSubmit = () => {
        if (renameTitle.trim() && renameTitle !== stack.title) {
            onRenameStack(stack.id, renameTitle);
        }
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsRenaming(false);
            setRenameTitle(stack.title);
        }
    };

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
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete the stack "${stack.title}"? This action cannot be undone.`)) {
            onDeleteStack(stack.id);
        }
        setContextMenu(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div
            ref={ref}
            onContextMenu={handleContextMenu}
            className="flex flex-col w-80 bg-(--glass-panel-bg) backdrop-blur-md border border-(--glass-panel-border) shadow-(--glass-panel-shadow) rounded-3xl p-5 max-h-full relative"
        >
            <div className="flex justify-between items-center mb-6 px-1">
                {isRenaming ? (
                    <input
                        autoFocus
                        type="text"
                        className="font-bold text-xl text-(--glass-card-text) bg-transparent border-b border-(--accent-color) outline-none w-full mr-2"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleRenameKeyDown}
                    />
                ) : (
                    <h2 className="font-bold text-xl text-(--glass-card-text) tracking-wide drop-shadow-md cursor-text" onDoubleClick={handleRenameClick}>{stack.title}</h2>
                )}
                <button
                    onClick={handleAddTaskClick}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${isAdding ? 'bg-(--accent-color) border-(--accent-color) text-white rotate-45' : 'bg-(--glass-card-bg) border-(--glass-card-border) text-(--glass-card-text) hover:bg-(--glass-card-hover-bg)'}`}
                    aria-label={isAdding ? "Cancel add task" : "Add task"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[100px] px-2 py-2">
                {isAdding && (
                    <div className="bg-(--glass-card-bg) backdrop-blur-sm border border-(--glass-card-border) p-4 rounded-xl mb-3">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Task Title"
                            className="w-full bg-transparent border-none outline-none text-lg font-medium text-(--glass-card-text) placeholder-(--glass-card-text-muted) mb-2"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full bg-transparent border-none outline-none text-sm text-(--glass-card-text-muted) placeholder-(--glass-card-text-muted)/70 resize-none mb-3"
                            rows={2}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="datetime-local"
                                className="bg-transparent border border-(--glass-card-border) rounded-lg px-2 py-1 text-xs text-(--glass-card-text-muted) outline-none focus:border-(--accent-color) transition-colors"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
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
                                onClick={handleSubmit}
                                className="px-3 py-1.5 text-xs font-medium bg-(--accent-color) text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}
                {children}
            </div>

            {/* Context Menu */}
            {contextMenu && createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-50 w-48 bg-(--glass-panel-bg) backdrop-blur-xl border border-(--glass-panel-border) shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleRenameClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-(--glass-card-text) hover:bg-(--glass-card-hover-bg) transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Rename Stack
                    </button>
                    <div className="h-px bg-(--glass-panel-border) my-1" />
                    <button
                        onClick={handleDeleteClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete Stack
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}