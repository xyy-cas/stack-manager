import React, { useState, useRef, useEffect } from 'react';
import { clearDatabase } from '../db';

interface Props {
    isOpen: boolean;
    onAddStack: (title: string) => void;
    showHero: boolean;
    onToggleHero: () => void;
    onSetBackgroundImage: (url: string | null) => void;
    bgBlur: number;
    onSetBgBlur: (value: number) => void;
    bgGrain: number;
    onSetBgGrain: (value: number) => void;
    bgDarken: number;
    onSetBgDarken: (value: number) => void;
    accentColor: string;
    onSetAccentColor: (value: string) => void;
}

export function SettingsPanel({ isOpen, onAddStack, showHero, onToggleHero, onSetBackgroundImage, bgBlur, onSetBgBlur, bgGrain, onSetBgGrain, bgDarken, onSetBgDarken, accentColor, onSetAccentColor }: Props) {
    const [isAddingStack, setIsAddingStack] = useState(false);
    const [newStackTitle, setNewStackTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAddingStack && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAddingStack]);

    // Reset state when panel closes
    useEffect(() => {
        if (!isOpen) {
            setIsAddingStack(false);
            setNewStackTitle('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddStackClick = () => {
        setIsAddingStack(true);
    };

    const handleSubmitStack = () => {
        if (newStackTitle.trim()) {
            onAddStack(newStackTitle.trim());
            setNewStackTitle('');
            setIsAddingStack(false);
        }
    };

    const handleCancelStack = () => {
        setIsAddingStack(false);
        setNewStackTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmitStack();
        } else if (e.key === 'Escape') {
            handleCancelStack();
        }
    };

    const handleDeleteEverything = async () => {
        if (window.confirm('Are you sure you want to delete EVERYTHING? This includes all tasks, stacks, history, and settings. This action cannot be undone.')) {
            await clearDatabase();
            indexedDB.deleteDatabase('StackManagerDB');
            localStorage.clear();
            // trigger a reload
            window.location.reload();
        }
    };

    return (
        <div className="absolute top-full right-0 mt-4 w-72 bg-(--glass-panel-bg) backdrop-blur-xl border border-(--glass-panel-border) shadow-2xl rounded-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
                <h3 className="font-bold text-lg text-(--glass-card-text) mb-4">Settings</h3>
                <div className="space-y-3">
                    {/* Add Stack Section */}
                    {!isAddingStack ? (
                        <div
                            onClick={handleAddStackClick}
                            className="p-3 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) transition-colors cursor-pointer flex items-center gap-3 group"
                        >
                            <div className="p-2 rounded-full bg-(--accent-color)/10 text-(--accent-color) group-hover:bg-(--accent-color) group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-(--glass-card-text)">Add New Stack</p>
                                <p className="text-xs text-(--glass-card-text-muted)">Create a new column.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border)">
                            <p className="text-xs font-medium text-(--glass-card-text-muted) mb-2">New Stack Title</p>
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newStackTitle}
                                    onChange={(e) => setNewStackTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-transparent border-b border-(--glass-card-border) text-sm text-(--glass-card-text) outline-none pb-1 focus:border-(--accent-color) transition-colors"
                                    placeholder="e.g. Backlog"
                                />
                                <button
                                    onClick={handleSubmitStack}
                                    className="p-1 text-(--accent-color) hover:bg-(--accent-color)/10 rounded transition-colors cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleCancelStack}
                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hero Toggle */}
                    <div
                        onClick={onToggleHero}
                        className="p-3 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) transition-colors cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-(--glass-card-text)">Show Header</p>
                                <p className="text-xs text-(--glass-card-text-muted)">Toggle hero section visibility.</p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${showHero ? 'bg-(--accent-color)' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showHero ? 'left-5' : 'left-1'}`} />
                        </div>
                    </div>

                    {/* Background Image Setting */}
                    <div className="p-3 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-pink-500/10 text-pink-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-(--glass-card-text)">Background</p>
                                <p className="text-xs text-(--glass-card-text-muted)">Customize app background.</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                if (ev.target?.result) {
                                                    onSetBackgroundImage(ev.target.result as string);
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="w-full py-1.5 px-3 text-xs font-medium text-center rounded-lg border border-dashed border-(--glass-card-border) text-(--glass-card-text-muted) hover:text-(--glass-card-text) hover:border-(--accent-color) transition-all">
                                    Upload Image
                                </div>
                            </label>
                            <button
                                onClick={() => onSetBackgroundImage(null)}
                                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                                title="Reset to Default"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Effects Sliders */}
                        <div className="mt-4 space-y-3 border-t border-(--glass-card-border) pt-3">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-(--glass-card-text-muted)">Blur</span>
                                    <span className="text-xs text-(--glass-card-text-muted)">{bgBlur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={bgBlur}
                                    onChange={(e) => onSetBgBlur(Number(e.target.value))}
                                    className="w-full h-1.5 bg-(--glass-card-border) rounded-lg appearance-none cursor-pointer accent-(--accent-color)"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-(--glass-card-text-muted)">Grain</span>
                                    <span className="text-xs text-(--glass-card-text-muted)">{bgGrain}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={bgGrain}
                                    onChange={(e) => onSetBgGrain(Number(e.target.value))}
                                    className="w-full h-1.5 bg-(--glass-card-border) rounded-lg appearance-none cursor-pointer accent-(--accent-color)"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-(--glass-card-text-muted)">Darken</span>
                                    <span className="text-xs text-(--glass-card-text-muted)">{bgDarken}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    value={bgDarken}
                                    onChange={(e) => onSetBgDarken(Number(e.target.value))}
                                    className="w-full h-1.5 bg-(--glass-card-border) rounded-lg appearance-none cursor-pointer accent-(--accent-color)"
                                />
                            </div>
                            <div className="mt-3 pt-3 border-t border-(--glass-card-border)">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-medium text-(--glass-card-text-muted)">Accent Color</span>
                                </div>
                                <div className="flex gap-2 flex-wrap items-center">
                                    {['#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => onSetAccentColor(color)}
                                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${accentColor === color ? 'ring-2 ring-offset-2 ring-(--glass-card-border)' : ''}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden transition-transform hover:scale-110 border border-(--glass-card-border)">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => onSetAccentColor(e.target.value)}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border)">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-(--glass-card-text)">Danger Zone</p>
                                <p className="text-xs text-(--glass-card-text-muted)">Manage your data.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDeleteEverything}
                            className="w-full py-2 px-3 text-xs font-medium text-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                        >
                            Delete Everything
                        </button>
                    </div>
                    <div className="text-center text-xs text-(--glass-card-text) pt-2 border-t border-(--glass-panel-border)">
                        Stack Manager v0.1.0
                    </div>
                </div>
            </div>
        </div>
    );
}
