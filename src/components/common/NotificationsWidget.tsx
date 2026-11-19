'use client';

import { Bell, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useNotifications } from '@/hooks/useNotifications';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsWidget() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary-red" />
          <h3 className="text-base font-medium text-black">Notifications</h3>
          {unreadCount > 0 ? (
            <Badge variant="danger">{unreadCount} New</Badge>
          ) : (
            <Badge variant="subtle">All Read</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-medium text-slate-500 hover:text-primary-deepblue hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs text-slate-400 mt-1">
            You're all caught up! Updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {notifications.map((note) => (
            <div
              key={note.id}
              onClick={() => !note.is_read && markAsRead(note.id)}
              className={`p-3 rounded-lg transition-colors border ${
                note.is_read
                  ? 'bg-white border-slate-100 hover:bg-slate-50/50'
                  : 'bg-blue-50/40 border-blue-100/60 cursor-pointer hover:bg-blue-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={`text-sm ${
                    note.is_read
                      ? 'font-medium text-slate-800'
                      : 'font-semibold text-primary-deepblue'
                  }`}
                >
                  {note.title}
                </h4>
                {!note.is_read && (
                  <span
                    className="w-2 h-2 rounded-full bg-primary-red mt-1.5 flex-shrink-0"
                    title="Unread"
                  />
                )}
              </div>
              {note.message && (
                <p className="text-sm text-primary-gray mt-1 leading-relaxed">
                  {note.message}
                </p>
              )}
              <span className="text-xs text-slate-400 mt-2 block font-normal">
                {formatRelativeTime(note.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
