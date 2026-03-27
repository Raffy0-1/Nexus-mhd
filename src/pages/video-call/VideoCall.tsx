import { useState, useRef, useEffect } from "react";

interface Participant {
  id: string;
  name: string;
  role: "investor" | "entrepreneur";
  muted: boolean;
  videoOff: boolean;
  avatar: string;
}

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "1", name: "You", role: "entrepreneur", muted: false, videoOff: false, avatar: "Y" },
  { id: "2", name: "Sarah Chen", role: "investor", muted: false, videoOff: false, avatar: "S" },
];

export default function VideoCall() {
  const [callState, setCallState] = useState<"lobby" | "calling" | "connected" | "ended">("lobby");
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", from: "Sarah Chen", text: "Looking forward to discussing the Q2 projections.", time: "2m ago" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callState !== "connected") setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startCall = () => {
    setCallState("calling");
    setTimeout(() => setCallState("connected"), 2000);
  };

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => setCallState("lobby"), 3000);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), from: "You", text: chatInput, time: "now" }]);
    setChatInput("");
  };

  const AvatarBox = ({ p, large }: { p: Participant; large?: boolean }) => (
    <div className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 ${large ? "w-full h-full" : "w-full h-40"}`}>
      {/* Simulated video — static gradient as mock */}
      <div className={`absolute inset-0 opacity-20 ${p.role === "investor" ? "bg-gradient-to-br from-violet-600 to-indigo-900" : "bg-gradient-to-br from-cyan-600 to-blue-900"}`} />
      {p.videoOff ? (
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-700 ${p.role === "investor" ? "bg-violet-500/30 text-violet-300" : "bg-cyan-500/30 text-cyan-300"}`}>
          {p.avatar}
        </div>
      ) : (
        /* Animated "video" placeholder */
        <div className="relative w-full h-full flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-700 ring-4 ${p.role === "investor" ? "bg-violet-500/40 text-violet-200 ring-violet-500/20" : "bg-cyan-500/40 text-cyan-200 ring-cyan-500/20"}`}>
            {p.avatar}
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`w-1 rounded-full ${p.role==="investor"?"bg-violet-400":"bg-cyan-400"}`}
                style={{ height: `${8 + Math.sin(i)*6}px`, animation: `pulse ${0.6 + i*0.15}s ease-in-out infinite alternate` }} />
            ))}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
        <span className="text-xs text-white font-500">{p.name}</span>
        {p.muted && <span className="text-red-400 text-xs">🔇</span>}
      </div>
      {p.id === "1" && callState === "connected" && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  );

  if (callState === "lobby") {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .nexus-heading { font-family: 'Syne', sans-serif; }
          .nexus-body { font-family: 'DM Sans', sans-serif; }
        `}</style>
        <div className="nexus-body max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/40 flex items-center justify-center text-4xl mb-4 ring-4 ring-indigo-500/10">
              📹
            </div>
            <h2 className="nexus-heading text-2xl font-700 text-white">Investment Call</h2>
            <p className="text-slate-400 text-sm mt-1">with Sarah Chen · Venture Capital</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Before you join</p>
            <div className="space-y-3">
              {[
                { label: "Camera", icon: "📸", ok: !videoOff },
                { label: "Microphone", icon: "🎙️", ok: !muted },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.icon} {item.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {item.ok ? "Ready" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button onClick={() => setVideoOff(!videoOff)} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${videoOff ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"}`}>
              {videoOff ? "Camera Off" : "Camera On"}
            </button>
            <button onClick={() => setMuted(!muted)} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${muted ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"}`}>
              {muted ? "Muted" : "Mic On"}
            </button>
          </div>

          <button onClick={startCall} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-500 transition-all text-sm shadow-lg shadow-indigo-500/20">
            Join Call
          </button>
        </div>
      </div>
    );
  }

  if (callState === "calling") {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-4xl mb-6 animate-pulse">S</div>
          <p className="text-white text-lg font-500">Calling Sarah Chen...</p>
          <p className="text-slate-400 text-sm mt-1">Connecting</p>
          <div className="flex justify-center gap-1 mt-4">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (callState === "ended") {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📞</div>
          <p className="text-white text-lg font-500">Call Ended</p>
          <p className="text-slate-400 text-sm mt-1">Duration: {formatTime(callDuration)}</p>
        </div>
      </div>
    );
  }

  // Connected
  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');`}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-500">Live · {formatTime(callDuration)}</span>
        </div>
        <p className="text-slate-400 text-sm">Investment Discussion · Sarah Chen</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">HD</span>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 p-4 flex gap-4">
        {/* Main video */}
        <div className="flex-1 relative rounded-2xl overflow-hidden">
          <AvatarBox p={participants[1]} large />
          {/* PiP self */}
          <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl overflow-hidden shadow-2xl border border-slate-600/50">
            <AvatarBox p={participants[0]} />
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="w-72 bg-slate-900/80 border border-slate-700/50 rounded-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800/60">
              <p className="text-sm font-500 text-white">In-call Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.from === "You" ? "text-right" : ""}`}>
                  <p className="text-[10px] text-slate-500 mb-1">{msg.from} · {msg.time}</p>
                  <div className={`inline-block text-xs px-3 py-2 rounded-xl max-w-[85%] text-left ${msg.from === "You" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800/60 flex gap-2">
              <input
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs text-white">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-5 bg-slate-900/80 border-t border-slate-800/60 backdrop-blur-sm">
        <button
          onClick={() => setMuted(!muted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${muted ? "bg-red-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
          title={muted ? "Unmute" : "Mute"}
        >{muted ? "🔇" : "🎙️"}</button>

        <button
          onClick={() => setVideoOff(!videoOff)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${videoOff ? "bg-red-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
          title={videoOff ? "Turn on camera" : "Turn off camera"}
        >{videoOff ? "🚫" : "📸"}</button>

        <button
          onClick={() => setScreenSharing(!screenSharing)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${screenSharing ? "bg-indigo-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
          title="Share screen"
        >🖥️</button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${chatOpen ? "bg-indigo-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
        >💬</button>

        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-xl text-white transition-all shadow-lg shadow-red-500/30"
        >📵</button>
      </div>
    </div>
  );
}
