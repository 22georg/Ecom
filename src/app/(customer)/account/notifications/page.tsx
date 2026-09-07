'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Clock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/account/notifications')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setNotifications(json.data.notifications);
          setUnreadCount(json.data.unreadCount);
        } else {
          setError(json.message || 'Failed to load notifications');
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/account/notifications/mark-all-read', { method: 'POST' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {}
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch(`/api/account/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Loading Notification Center...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--mq-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--mq-text-secondary)] mt-1">Real-time order updates, security alerts, and system events</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-[var(--mq-surface)] border border-[var(--mq-border)] hover:bg-[var(--mq-background)] text-xs font-semibold text-[var(--mq-primary)] rounded-xl flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card variant="default" className="p-12 text-center flex flex-col items-center justify-center">
          <Bell className="w-16 h-16 text-[var(--mq-text-tertiary)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)] mb-1">No Notifications</h3>
          <p className="text-xs text-[var(--mq-text-secondary)] max-w-sm">
            You're all caught up! Order status alerts and account updates will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              variant="default"
              className={`p-4 transition border ${
                n.isRead
                  ? 'border-[var(--mq-border)] bg-[var(--mq-surface)]'
                  : 'border-[var(--mq-primary)]/40 bg-[var(--mq-primary-light)]/10 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.isRead
                        ? 'bg-[var(--mq-surface-muted)] text-[var(--mq-text-muted)]'
                        : 'bg-[var(--mq-primary)] text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-xs text-[var(--mq-text-primary)] truncate">{n.title}</h4>
                      <Badge variant={n.type === 'SECURITY' ? 'error' : 'info'} size="sm">
                        {n.type}
                      </Badge>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-[var(--mq-text-tertiary)] flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.actionUrl && (
                    <Link
                      href={n.actionUrl}
                      onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                      className="px-3 py-1.5 bg-[var(--mq-primary)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--mq-primary-dark)] transition flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(n.id)}
                      className="p-1.5 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-primary)] hover:bg-[var(--mq-surface-muted)] rounded-lg transition"
                      title="Mark as Read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
