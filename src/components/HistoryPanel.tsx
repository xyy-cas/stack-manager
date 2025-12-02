import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import HeatMap from '@uiw/react-heat-map';
import type { HistoryItem, HistoryActionType } from '../db';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onDeleteHistoryItem: (id: string) => void;
    accentColor: string;
}

const getActionConfig = (type: HistoryActionType) => {
    switch (type) {
        case 'ADD_TASK':
            return {
                label: 'Added Task',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                ),
                color: 'text-green-500 bg-green-500/10'
            };
        case 'UPDATE_TASK':
            return {
                label: 'Updated Task',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                ),
                color: 'text-blue-500 bg-blue-500/10'
            };
        case 'UPDATE_STATUS':
            return {
                label: 'Updated Status',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
                color: 'text-green-500 bg-green-500/10'
            };
        case 'ADD_STACK':
            return {
                label: 'Added Stack',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
                color: 'text-purple-500 bg-purple-500/10'
            };
        case 'DELETE_STACK':
            return {
                label: 'Deleted Stack',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                ),
                color: 'text-red-500 bg-red-500/10'
            };
        case 'DELETE_TASK':
            return {
                label: 'Deleted Task',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                ),
                color: 'text-red-500 bg-red-500/10'
            };
        case 'MOVE_STACK':
            return {
                label: 'Moved Stack',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                ),
                color: 'text-yellow-500 bg-yellow-500/10'
            };
        case 'MOVE_TASK':
            return {
                label: 'Moved Task',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                ),
                color: 'text-yellow-500 bg-yellow-500/10'
            };
        case 'UPDATE_STACK':
            return {
                label: 'Updated Stack',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                ),
                color: 'text-blue-500 bg-blue-500/10'
            };
        case 'ARCHIVE_TASK':
            return {
                label: 'Archived Task',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                ),
                color: 'text-orange-500 bg-orange-500/10'
            };
        default:
            return {
                label: 'Unknown Action',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
                color: 'text-gray-500 bg-gray-500/10'
            };
    }
};

const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

const getHeatMapData = (history: HistoryItem[]) => {
    const map = new Map<string, { count: number, details: string[] }>();

    // Sort by timestamp to ensure chronological order
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

    sortedHistory.forEach(item => {
        // Use local date to ensure the heatmap matches the user's timezone
        const d = new Date(item.timestamp);
        const date = formatDate(d);

        const current = map.get(date) || { count: 0, details: [] };
        const config = getActionConfig(item.actionType);

        current.details.push(`${config.label}: ${item.details}`);

        map.set(date, {
            count: current.count + 1,
            details: current.details
        });
    });
    return Array.from(map.entries()).map(([date, data]) => ({
        date,
        count: data.count,
        summary: data.details
    }));
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export function HistoryPanel({ isOpen, onClose, history, onDeleteHistoryItem, accentColor }: Props) {
    if (!isOpen) return null;

    // Sort history by timestamp to ensure consistent order (IndexedDB returns by ID/random)
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const heatMapData = getHeatMapData(sortedHistory);
    const today = new Date();
    const todayStr = formatDate(today);

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, itemId: string } | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null);
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

    const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, itemId });
    };

    const handleDeleteClick = () => {
        if (contextMenu) {
            onDeleteHistoryItem(contextMenu.itemId);
            setContextMenu(null);
        }
    };

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
                        <h2 className="text-2xl font-bold text-(--glass-card-text)">Modification History</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-(--glass-card-border) text-(--glass-card-text-muted) hover:text-(--glass-card-text) transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-2 pb-2">
                        <HeatMap
                            value={heatMapData}
                            width={1000}
                            style={{ color: 'var(--glass-card-text-muted)' }}
                            startDate={(() => {
                                const date = new Date(today);
                                date.setMonth(date.getMonth() - 10);
                                return date;
                            })()}
                            endDate={(() => {
                                const date = new Date(today);
                                date.setMonth(date.getMonth() + 2);
                                return date;
                            })()}
                            panelColors={{
                                0: 'var(--glass-card-bg)',
                                1: (() => { const rgb = hexToRgb(accentColor); return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(14, 165, 233, 0.2)'; })(),
                                2: (() => { const rgb = hexToRgb(accentColor); return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(14, 165, 233, 0.3)'; })(),
                                4: (() => { const rgb = hexToRgb(accentColor); return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : 'rgba(14, 165, 233, 0.5)'; })(),
                                10: (() => { const rgb = hexToRgb(accentColor); return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` : 'rgba(14, 165, 233, 0.7)'; })(),
                                20: (() => { const rgb = hexToRgb(accentColor); return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` : 'rgba(14, 165, 233, 0.9)'; })(),
                                30: accentColor,
                            }}
                            legendRender={(props) => <rect {...props} y={(props.y as number) + 10} rx={2.5} />}
                            rectRender={(props, data) => {
                                const d = data as any;
                                const isToday = d.date === todayStr;

                                if (!d.count && !isToday) return <rect {...props} rx={2.5} />;

                                const summary = d.summary || [];
                                const maxItems = 3;
                                const displayItems = summary.slice(0, maxItems);
                                const remaining = summary.length - maxItems;

                                const rectNode = (
                                    <rect
                                        {...props}
                                        rx={2.5}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top,
                                                content: (
                                                    <div className="text-xs">
                                                        <div className="font-bold mb-1">{d.date} {isToday && '(Today)'}</div>
                                                        {displayItems.length > 0 ? (
                                                            <>
                                                                {displayItems.map((item: string, i: number) => (
                                                                    <div key={i} className="whitespace-nowrap">{item}</div>
                                                                ))}
                                                                {remaining > 0 && <div className="text-white/50 italic">...and {remaining} more</div>}
                                                            </>
                                                        ) : (
                                                            <div className="text-white/50 italic">No activity</div>
                                                        )}
                                                    </div>
                                                )
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                );

                                if (isToday) {
                                    return (
                                        <g>
                                            {rectNode}
                                            <circle
                                                cx={(props.x as number) + (props.width as number) / 2}
                                                cy={(props.y as number) + (props.height as number) / 2}
                                                r={1.5}
                                                fill={accentColor}
                                                style={{ pointerEvents: 'none' }}
                                            />
                                        </g>
                                    );
                                }

                                return rectNode;
                            }}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {sortedHistory.length === 0 ? (
                            <div className="text-center py-12 text-(--glass-card-text-muted)">
                                <p>No history yet.</p>
                            </div>
                        ) : (
                            sortedHistory.slice().reverse().map((item) => {
                                const config = getActionConfig(item.actionType);
                                return (
                                    <div
                                        key={item.id}
                                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                                        className="flex gap-4 p-4 rounded-xl bg-(--glass-card-bg) border border-(--glass-card-border) hover:bg-(--glass-card-hover-bg) transition-colors cursor-default"
                                    >
                                        <div className="shrink-0 mt-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                                                {config.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-(--glass-card-text)">{config.label}</p>
                                            <p className="text-xs text-(--glass-card-text-muted) mt-1">{item.details}</p>
                                            <p className="text-[10px] text-(--glass-card-text-muted)/70 mt-2">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-110 px-3 py-2 bg-black/80 backdrop-blur-md text-white text-xs rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: tooltip.y - 8,
                        left: tooltip.x,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    {tooltip.content}
                    {/* Arrow */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/80"
                    />
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={menuRef}
                    className="fixed z-110 w-48 bg-(--glass-panel-bg) backdrop-blur-xl border border-(--glass-panel-border) shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleDeleteClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete Record
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
}
