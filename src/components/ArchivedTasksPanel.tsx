import { createPortal } from 'react-dom';
import type { ArchivedTask } from '../db';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    archivedTasks: ArchivedTask[];
    onDelete: (taskId: string) => void;
    onRestore: (taskId: string) => void;
}

export function ArchivedTasksPanel({ isOpen, onClose, archivedTasks, onDelete, onRestore }: Props) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 isolate">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 translate-z-0"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="relative w-full h-full max-w-[850px] max-h-[650px] flex flex-col animate-in zoom-in-95 duration-200 z-100 isolate bg-(--glass-panel-bg) backdrop-blur-xl border border-(--glass-panel-border) shadow-2xl rounded-3xl transform-gpu backface-hidden"
            >
                {/* Content Layer */}
                <div className="flex flex-col h-full p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-(--glass-card-text)">Archived Tasks</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-(--glass-card-border) text-(--glass-card-text-muted) hover:text-(--glass-card-text) transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {archivedTasks.length === 0 ? (
                            <div className="text-center py-12 text-(--glass-card-text-muted)">
                                <p>No archived tasks.</p>
                            </div>
                        ) : (
                            archivedTasks.slice().reverse().map((task) => (
                                <div key={task.id} className="flex gap-4 p-4 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border) relative pr-28 group">
                                    <div className="shrink-0 mt-1">
                                        {task.isFinished ? (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-green-500 bg-green-500/10" title="Completed">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-orange-500 bg-orange-500/10" title="Archived (Incomplete)">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-lg text-(--glass-card-text) mb-1">{task.title}</h4>
                                        {task.description && <p className="text-sm text-(--glass-card-text-muted) mb-2">{task.description}</p>}
                                        <p className="text-[10px] text-(--glass-card-text-muted)/70">
                                            Created: {new Date(task.createdAt).toLocaleString()}
                                            <span className="mx-2">•</span>
                                            Archived: {new Date(task.archivedAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => onRestore(task.id)}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer"
                                            title="Restore to Board"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                                            title="Delete Permanently"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
