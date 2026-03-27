import { useState } from "react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  with: string;
  status: "confirmed" | "pending" | "declined";
  type: "investor" | "entrepreneur";
}

interface Slot {
  date: string;
  time: string;
  available: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const TIME_SLOTS = ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];

const initialMeetings: Meeting[] = [
  { id: "1", title: "Investment Discussion", date: "2026-03-30", time: "10:00", with: "Sarah Chen", status: "confirmed", type: "investor" },
  { id: "2", title: "Product Demo", date: "2026-04-01", time: "14:00", with: "Alex Rivera", status: "pending", type: "entrepreneur" },
  { id: "3", title: "Due Diligence Call", date: "2026-04-03", time: "11:00", with: "Marcus Webb", status: "confirmed", type: "investor" },
];

export default function MeetingCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "request">("add");
  const [form, setForm] = useState({ title: "", time: "", with: "", type: "investor" as "investor" | "entrepreneur" });
  const [activeTab, setActiveTab] = useState<"calendar" | "meetings">("calendar");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getMeetingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetings.filter((m) => m.date === dateStr);
  };

  const toggleSlot = (day: number, time: string) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const exists = availableSlots.find((s) => s.date === dateStr && s.time === time);
    if (exists) {
      setAvailableSlots(availableSlots.filter((s) => !(s.date === dateStr && s.time === time)));
    } else {
      setAvailableSlots([...availableSlots, { date: dateStr, time, available: true }]);
    }
  };

  const isSlotAvailable = (day: number, time: string) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availableSlots.some((s) => s.date === dateStr && s.time === time);
  };

  const handleAddMeeting = () => {
    if (!selectedDay || !form.title || !form.time || !form.with) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: form.title,
      date: dateStr,
      time: form.time,
      with: form.with,
      status: "pending",
      type: form.type,
    };
    setMeetings([...meetings, newMeeting]);
    setShowModal(false);
    setForm({ title: "", time: "", with: "", type: "investor" });
  };

  const handleStatusChange = (id: string, status: "confirmed" | "declined") => {
    setMeetings(meetings.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : s === "declined" ? "bg-red-500/20 text-red-400 border-red-500/30"
    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .nexus-cal { font-family: 'DM Sans', sans-serif; }
        .nexus-heading { font-family: 'Syne', sans-serif; }
        .day-cell:hover { background: rgba(99,102,241,0.15); }
        .slot-btn { transition: all 0.15s ease; }
      `}</style>

      <div className="nexus-cal max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="nexus-heading text-3xl font-800 text-white">Meeting Scheduler</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage availability & investor meetings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${activeTab === "calendar" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >Calendar</button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${activeTab === "meetings" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >Meetings ({meetings.length})</button>
          </div>
        </div>

        {activeTab === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">‹</button>
                <h2 className="nexus-heading font-700 text-lg">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">›</button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs text-slate-500 font-600 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayMeetings = getMeetingsForDay(day);
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const isSelected = selectedDay === day;
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`day-cell relative cursor-pointer rounded-lg p-2 min-h-[52px] border transition-all ${
                        isSelected ? "bg-indigo-600/30 border-indigo-500/60" :
                        isToday ? "border-indigo-500/40 bg-indigo-600/10" :
                        "border-transparent hover:border-slate-600/50"
                      }`}
                    >
                      <span className={`text-xs font-500 ${isToday ? "text-indigo-400" : "text-slate-300"}`}>{day}</span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayMeetings.slice(0, 2).map((m) => (
                          <div key={m.id} className={`text-[9px] px-1 rounded truncate ${
                            m.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                            m.status === "declined" ? "bg-red-500/20 text-red-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>{m.time}</div>
                        ))}
                        {dayMeetings.length > 2 && <div className="text-[9px] text-slate-500">+{dayMeetings.length - 2}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {selectedDay && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                  <h3 className="nexus-heading font-700 text-base mb-4">
                    {MONTHS[month]} {selectedDay}
                  </h3>

                  <p className="text-xs text-slate-400 mb-3">Set availability slots</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleSlot(selectedDay, t)}
                        className={`slot-btn text-xs py-1.5 rounded-lg border font-500 ${
                          isSlotAvailable(selectedDay, t)
                            ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                            : "bg-slate-800 border-slate-700/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >{t}</button>
                    ))}
                  </div>

                  <button
                    onClick={() => { setModalType("request"); setShowModal(true); }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-500 transition-all"
                  >+ Schedule Meeting</button>

                  {getMeetingsForDay(selectedDay).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-slate-400">Meetings this day</p>
                      {getMeetingsForDay(selectedDay).map((m) => (
                        <div key={m.id} className="bg-slate-800/60 rounded-lg p-3">
                          <p className="text-sm font-500 text-white">{m.title}</p>
                          <p className="text-xs text-slate-400">{m.time} · {m.with}</p>
                          <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full border ${statusColor(m.status)}`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming confirmed */}
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                <h3 className="nexus-heading font-700 text-sm mb-3 text-slate-300">Confirmed Meetings</h3>
                <div className="space-y-2">
                  {meetings.filter((m) => m.status === "confirmed").map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-700">
                        {m.date.split("-")[2]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-500 text-white truncate">{m.title}</p>
                        <p className="text-[10px] text-slate-400">{m.time} · {m.with}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Meetings Tab */
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="nexus-heading font-700 text-lg mb-5">All Meeting Requests</h3>
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-700 ${
                    m.type === "investor" ? "bg-violet-500/20 text-violet-400" : "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    {m.with[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-500 text-white text-sm">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.with} · {m.date} at {m.time}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColor(m.status)}`}>{m.status}</span>
                  {m.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(m.id, "confirmed")}
                        className="text-xs px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
                      >Accept</button>
                      <button
                        onClick={() => handleStatusChange(m.id, "declined")}
                        className="text-xs px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                      >Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="nexus-heading font-700 text-lg mb-5">Schedule Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Meeting Title</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Investment Discussion"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">With</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Contact name"
                  value={form.with}
                  onChange={(e) => setForm({ ...form, with: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Time</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  >
                    <option value="">Select</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Role</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "investor" | "entrepreneur" })}
                  >
                    <option value="investor">Investor</option>
                    <option value="entrepreneur">Entrepreneur</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all">Cancel</button>
              <button onClick={handleAddMeeting} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-all">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
