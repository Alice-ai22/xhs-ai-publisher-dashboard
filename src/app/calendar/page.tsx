"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { parseStringArray } from "@/lib/json-fields";

interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  draftId: string;
  draft: { titles: string; status: string };
}

const SUGGESTED_TIMES = ["08:00", "12:00", "18:00", "21:00"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [readyDrafts, setReadyDrafts] = useState<
    Array<{ id: string; titles: string }>
  >([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");

  const loadSchedules = useCallback(() => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    fetch(`/api/schedule?startDate=${start}&endDate=${end}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setSchedules(r.data);
      });
  }, [currentMonth]);

  useEffect(() => {
    loadSchedules();
    fetch("/api/drafts?status=ReadyToPublish")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setReadyDrafts(r.data);
      });
  }, [loadSchedules]);

  async function handleAddSchedule() {
    if (!selectedDraftId || !selectedDate) return;

    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        time: selectedTime,
        draftId: selectedDraftId,
      }),
    });

    setShowScheduleModal(false);
    setSelectedDraftId("");
    loadSchedules();
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm("确定删除此排期？")) return;
    await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
    loadSchedules();
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const schedulesByDate: Record<string, ScheduleItem[]> = {};
  schedules.forEach((s) => {
    if (!schedulesByDate[s.date]) schedulesByDate[s.date] = [];
    schedulesByDate[s.date].push(s);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">发布日历</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">
            最佳发布时间: 8:00 / 12:00 / 18:00 / 21:00
          </span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            ← 上月
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "yyyy年 M月", { locale: zhCN })}
          </h2>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            下月 →
          </button>
        </div>

        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div
              key={d}
              className="text-center text-sm font-medium text-[var(--muted)] py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24" />
          ))}

          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySchedules = schedulesByDate[dateStr] || [];
            const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={dateStr}
                className={`min-h-24 p-2 rounded-lg border transition-colors ${
                  isToday
                    ? "border-[var(--primary)] bg-red-50"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm ${isToday ? "font-bold text-[var(--primary)]" : ""}`}
                  >
                    {format(day, "d")}
                  </span>
                  <button
                    className="text-xs text-[var(--info)] hover:underline"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowScheduleModal(true);
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((s) => {
                    const titles = parseStringArray(s.draft.titles);
                    return (
                      <div
                        key={s.id}
                        className="group text-xs p-1 rounded bg-blue-50 text-blue-700 truncate relative"
                      >
                        <span className="font-mono">{s.time}</span>{" "}
                        {titles[0]?.slice(0, 8) || "无标题"}
                        <button
                          className="absolute right-1 top-0.5 text-red-400 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteSchedule(s.id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <span className="text-xs text-[var(--muted)]">
                      +{daySchedules.length - 3} 更多
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card w-96 space-y-4">
            <h3 className="font-semibold">
              添加排期 - {selectedDate}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                选择草稿
              </label>
              <select
                className="input"
                value={selectedDraftId}
                onChange={(e) => setSelectedDraftId(e.target.value)}
              >
                <option value="">请选择</option>
                {readyDrafts.map((d) => {
                  const titles = parseStringArray(d.titles);
                  return (
                    <option key={d.id} value={d.id}>
                      {titles[0] || "无标题"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                发布时间
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {SUGGESTED_TIMES.map((t) => (
                  <button
                    key={t}
                    className={`btn text-xs ${
                      selectedTime === t ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="time"
                className="input"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="btn btn-primary flex-1"
                onClick={handleAddSchedule}
                disabled={!selectedDraftId}
              >
                添加
              </button>
              <button
                className="btn btn-outline flex-1"
                onClick={() => setShowScheduleModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
