"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Trash2, X, Zap, Trophy, Settings, Users, BookOpen } from "lucide-react";
import { useNotifications } from "@/contexts/notifications";
import { Button } from "@/components/ui/button";

const TYPE_CONFIG = {
    progress: {
        icon: BookOpen,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
        dot: "bg-blue-400",
    },
    achievement: {
        icon: Trophy,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/20",
        dot: "bg-yellow-400",
    },
    system: {
        icon: Settings,
        color: "text-gray-400",
        bg: "bg-gray-500/10 border-gray-500/20",
        dot: "bg-gray-400",
    },
    social: {
        icon: Users,
        color: "text-pink-400",
        bg: "bg-pink-500/10 border-pink-500/20",
        dot: "bg-pink-400",
    },
};

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();
    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const preview = notifications.slice(0, 8);

    return (
        <div className="relative" ref={dropdownRef}>

            <Button
                variant="ghost"
                size="icon"
                id="notification-bell-btn"
                onClick={() => setOpen((v) => !v)}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground relative"
                aria-label="Notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>


            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-foreground" />
                            <span className="font-medium text-sm text-foreground">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                    All read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
                        ) : preview.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground font-light">No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/50">
                                {preview.map((n) => {
                                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                                    const Icon = cfg.icon;
                                    return (
                                        <li
                                            key={n.id}
                                            className={`group flex gap-3 px-4 py-3 transition-colors ${n.read ? "opacity-60" : "bg-muted/30"
                                                } hover:bg-muted/50`}
                                        >
                                            <div
                                                className={`mt-0.5 shrink-0 h-8 w-8 rounded-full border flex items-center justify-center ${cfg.bg}`}
                                            >
                                                <Icon className={`h-4 w-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {n.link ? (
                                                    <Link
                                                        href={n.link}
                                                        onClick={() => { markAsRead(n.id); setOpen(false); }}
                                                        className="block"
                                                    >
                                                        <p className="text-sm font-medium text-foreground line-clamp-1">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-foreground line-clamp-1">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                                                    </>
                                                )}
                                                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                {!n.read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="h-6 w-6 rounded-full hover:bg-green-500/20 flex items-center justify-center text-green-500"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="h-6 w-6 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>


                    {notifications.length > 0 && (
                        <div className="border-t border-border px-4 py-2.5">
                            <Link
                                href="/notifications"
                                onClick={() => setOpen(false)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Zap className="h-3 w-3" />
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
