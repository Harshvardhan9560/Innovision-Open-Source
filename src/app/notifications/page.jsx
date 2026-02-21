"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Bell,
    CheckCheck,
    Trash2,
    BookOpen,
    Trophy,
    Settings,
    Users,
    Check,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { useNotifications } from "@/contexts/notifications";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
    { key: "all", label: "All" },
    { key: "progress", label: "Progress", icon: BookOpen },
    { key: "achievement", label: "Achievements", icon: Trophy },
    { key: "system", label: "System", icon: Settings },
    { key: "social", label: "Social", icon: Users },
];

const TYPE_CONFIG = {
    progress: {
        icon: BookOpen,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
        label: "Progress",
        labelColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    achievement: {
        icon: Trophy,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/20",
        label: "Achievement",
        labelColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    system: {
        icon: Settings,
        color: "text-gray-400",
        bg: "bg-gray-500/10 border-gray-500/20",
        label: "System",
        labelColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
    social: {
        icon: Users,
        color: "text-pink-400",
        bg: "bg-pink-500/10 border-pink-500/20",
        label: "Social",
        labelColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    },
};

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}

function NotificationItem({ notification, onMarkRead, onDelete }) {
    const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
    const Icon = cfg.icon;

    return (
        <div
            className={`group relative flex gap-4 p-4 rounded-xl border transition-all duration-200 ${notification.read
                    ? "border-border bg-card opacity-60 hover:opacity-80"
                    : "border-border bg-card hover:border-border/80 shadow-sm"
                }`}
        >
            {/* Unread indicator */}
            {!notification.read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary" />
            )}

            {/* Icon */}
            <div
                className={`shrink-0 h-10 w-10 rounded-full border flex items-center justify-center ${cfg.bg}`}
            >
                <Icon className={`h-5 w-5 ${cfg.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-foreground">{notification.title}</h3>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-light ${cfg.labelColor}`}
                        >
                            {cfg.label}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed font-light">
                    {notification.body}
                </p>
                {notification.link && (
                    <Link
                        href={notification.link}
                        onClick={() => !notification.read && onMarkRead(notification.id)}
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                        View →
                    </Link>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!notification.read && (
                    <button
                        onClick={() => onMarkRead(notification.id)}
                        title="Mark as read"
                        className="h-7 w-7 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(notification.id)}
                    title="Delete"
                    className="h-7 w-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();

    const filtered =
        activeCategory === "all"
            ? notifications
            : notifications.filter((n) => n.type === activeCategory);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/roadmap">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-sm px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-light">
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5 font-light">
                            All your alerts, achievements, and updates in one place.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fetchNotifications}
                            disabled={loading}
                            className="h-9 w-9 rounded-full"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-9 rounded-full text-xs px-3 font-light"
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {CATEGORIES.map(({ key, label, icon: Icon }) => {
                        const count =
                            key === "all"
                                ? notifications.length
                                : notifications.filter((n) => n.type === key).length;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-light transition-all ${activeCategory === key
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                                    }`}
                            >
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                                {label}
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === key ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Notification List */}
                {loading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                        <p className="text-muted-foreground font-light text-sm">Loading notifications…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Bell className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-light">No notifications</p>
                            <p className="text-sm text-muted-foreground mt-1 font-light">
                                {activeCategory === "all"
                                    ? "You're all caught up!"
                                    : `No ${activeCategory} notifications yet.`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Unread section */}
                        {filtered.some((n) => !n.read) && (
                            <>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-1">
                                    Unread
                                </p>
                                {filtered
                                    .filter((n) => !n.read)
                                    .map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onMarkRead={markAsRead}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                            </>
                        )}

                        {/* Read section */}
                        {filtered.some((n) => n.read) && (
                            <>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-1 mt-4">
                                    Earlier
                                </p>
                                {filtered
                                    .filter((n) => n.read)
                                    .map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onMarkRead={markAsRead}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
