'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, Check, Plus, Clock, Sparkles, ShieldCheck, Trash2 } from 'lucide-react';
import { ReminderSetting } from '@/types/exam';
import { playChimeSound } from '@/lib/constants';

interface ReminderNotificationCenterProps {
  reminders: ReminderSetting[];
  onUpdateReminders: (reminders: ReminderSetting[]) => void;
}

export const ReminderNotificationCenter: React.FC<ReminderNotificationCenterProps> = ({
  reminders,
  onUpdateReminders,
}) => {
  const [permissionState, setPermissionState] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('20:00');
  const [newDesc, setNewDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setToastMessage('Trình duyệt của bạn không hỗ trợ tính năng Web Notification.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission === 'granted') {
        playChimeSound('complete');
        new Notification('Sĩ Tử 2027: Đã kích hoạt nhắc nhở!', {
          body: 'Bạn sẽ nhận được thông báo học tập đúng giờ để không bao giờ bỏ lỡ mục tiêu NV1.',
          icon: '/favicon.ico',
        });
        setToastMessage('Đã bật thông báo đẩy trình duyệt thành công!');
      } else {
        setToastMessage('Bạn đã từ chối quyền thông báo trên trình duyệt.');
      }
    } catch (e) {
      console.error(e);
      setToastMessage('Không thể kích hoạt thông báo trên môi trường này.');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRem: ReminderSetting = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      enabled: true,
      repeat: 'daily',
      description: newDesc.trim() || 'Nhắc nhở học tập duy trì kỷ luật 2K9.',
    };

    onUpdateReminders([...reminders, newRem]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
    playChimeSound('complete');
  };

  return (
    <div id="reminder-notification-widget" className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Chuông Báo Nhắc Nhở Thông Minh</h3>
              <p className="text-[11px] text-stone-500">Thông báo đúng giờ ôn luyện & giữ gìn sức khỏe</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="p-1.5 text-stone-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors text-xs flex items-center gap-1 font-semibold"
            title="Thêm giờ nhắc mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm giờ</span>
          </button>
        </div>

        {/* Browser Notification Banner */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-stone-600 truncate">
              {permissionState === 'granted'
                ? 'Thông báo trình duyệt: Đã sẵn sàng hoạt động'
                : 'Bật thông báo đẩy để không bỏ lỡ ca học'}
            </div>
          </div>

          {permissionState !== 'granted' ? (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-semibold transition-colors shrink-0"
            >
              Kích hoạt
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
              Đang bật ✓
            </span>
          )}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs">
            {toastMessage}
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                rem.enabled
                  ? 'bg-stone-50/70 border-stone-200 text-stone-800'
                  : 'bg-white border-stone-100 text-stone-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-xs font-mono font-bold text-stone-700 shrink-0">
                  {rem.time}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {rem.title}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {rem.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    rem.enabled ? 'bg-purple-600' : 'bg-stone-200'
                  }`}
                  title={rem.enabled ? 'Tắt nhắc nhở này' : 'Bật nhắc nhở này'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      rem.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-1 text-stone-300 hover:text-rose-500 rounded-md transition-colors"
                  title="Xóa giờ nhắc này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
        <span>Tự động phát chuông nhắc khi tới giờ</span>
        <span className="text-stone-600 font-medium">Hằng ngày</span>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border border-stone-200">
            <h4 className="text-base font-bold text-stone-900 mb-1">Thêm Giờ Nhắc Nhở Mới</h4>
            <p className="text-xs text-stone-500 mb-3">Tạo lịch nhắc để luôn vào bàn học đúng giờ.</p>

            <form onSubmit={handleAddReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tiêu đề nhắc</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn 10 câu trắc nghiệm đúng sai"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Thời gian</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nội dung chi tiết</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ví dụ: Tắt wifi điện thoại và mở vở ghi công thức"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
                >
                  Lưu chuông
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
