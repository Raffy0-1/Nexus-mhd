import { useState } from "react";

type Role = "investor" | "entrepreneur";

function PasswordStrengthMeter({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const levels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  const level = levels[Math.min(score, 4)];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? level.color : "bg-slate-700"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] ${score === 0 ? "text-slate-500" : level.color.replace("bg-","text-")}`}>{score === 0 ? "Enter password" : level.label}</p>
        <div className="flex gap-2">
          {checks.map((c) => (
            <span key={c.label} className={`text-[9px] ${c.pass ? "text-emerald-400" : "text-slate-600"}`} title={c.label}>✓</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...value];
    next[i] = v;
    onChange(next);
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i+1}`);
      el?.focus();
    }
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      document.getElementById(`otp-${i-1}`)?.focus();
    }
  };
  return (
    <div className="flex gap-3 justify-center my-6">
      {value.map((v, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`w-12 h-14 text-center text-xl font-bold bg-slate-800 border-2 rounded-xl text-white focus:outline-none transition-all ${v ? "border-indigo-500" : "border-slate-700 focus:border-indigo-500/60"}`}
        />
      ))}
    </div>
  );
}

export default function SecurityAccess() {
  // Login flow state
  const [loginStep, setLoginStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role>("entrepreneur");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState<"login" | "dashboard" | "settings">("login");

  const handleStep1 = () => {
    if (email && password.length >= 8) setLoginStep(2);
  };

  const handleStep2 = () => {
    if (otp.every((d) => d)) {
      setLoginStep(3);
      setTimeout(() => { setLoggedIn(true); setActiveSection("dashboard"); }, 1000);
    }
  };

  const investorFeatures = [
    "Portfolio Overview & Analytics",
    "Deal Flow Management",
    "Document Chamber Access",
    "Payment & Wire Transfers",
    "Meeting Scheduling",
    "Video Call with Entrepreneurs",
  ];
  const entrepreneurFeatures = [
    "Pitch Deck Management",
    "Investor Outreach Tools",
    "Document Chamber (deals/contracts)",
    "Funding Progress Tracker",
    "Meeting Scheduling",
    "Video Call with Investors",
  ];

  if (activeSection === "login" && !loggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

        <div className="w-full max-w-md" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-3 shadow-lg shadow-indigo-500/30">⚡</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-bold text-white">Nexus Platform</h1>
            <p className="text-slate-400 text-sm mt-1">Secure access portal</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1,2,3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${loginStep >= s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                  {loginStep > s ? "✓" : s}
                </div>
                <p className={`text-xs ${loginStep >= s ? "text-slate-300" : "text-slate-600"}`}>
                  {s === 1 ? "Credentials" : s === 2 ? "2FA Verify" : "Access"}
                </p>
                {s < 3 && <div className={`flex-1 h-px ${loginStep > s ? "bg-indigo-600" : "bg-slate-800"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            {loginStep === 1 && (
              <>
                <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold text-white mb-5">Sign In</h2>

                {/* Role toggle */}
                <div className="flex gap-2 mb-5 p-1 bg-slate-800 rounded-xl">
                  {(["entrepreneur", "investor"] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 rounded-lg text-sm font-500 transition-all capitalize ${role === r ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >{r}</button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm"
                      >{showPassword ? "🙈" : "👁️"}</button>
                    </div>
                    <PasswordStrengthMeter password={password} />
                  </div>
                </div>

                <button
                  onClick={handleStep1}
                  disabled={!email || password.length < 8}
                  className={`w-full mt-5 py-3 rounded-xl font-500 text-sm transition-all ${email && password.length >= 8 ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                >Continue →</button>
              </>
            )}

            {loginStep === 2 && (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl mb-3">📱</div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold text-white">Two-Factor Auth</h2>
                  <p className="text-slate-400 text-sm mt-1">Enter the 6-digit code sent to your phone</p>
                </div>

                <OTPInput value={otp} onChange={setOtp} />

                <p className="text-center text-xs text-slate-500 mb-4">Demo: enter any 6 digits</p>

                <button
                  onClick={handleStep2}
                  disabled={!otp.every((d) => d)}
                  className={`w-full py-3 rounded-xl font-500 text-sm transition-all ${otp.every((d) => d) ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                >Verify Code</button>

                <button onClick={() => setLoginStep(1)} className="w-full mt-2 py-2 text-slate-500 hover:text-slate-300 text-sm transition-all">← Back</button>
              </>
            )}

            {loginStep === 3 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl mb-3 animate-pulse">✓</div>
                <p className="text-emerald-400 font-500">Verified! Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / role-based UI
  const features = role === "investor" ? investorFeatures : entrepreneurFeatures;
  const roleColor = role === "investor" ? "violet" : "cyan";

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl font-bold text-white">Security & Access</h1>
            <p className="text-slate-400 text-sm mt-1">Role-based dashboard & 2FA management</p>
          </div>
          <button onClick={() => { setLoggedIn(false); setActiveSection("login"); setLoginStep(1); setOtp(["","","","","",""]); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Profile & role */}
          <div className="space-y-4">
            <div className={`bg-${roleColor}-500/10 border border-${roleColor}-500/25 rounded-2xl p-5`}>
              <div className={`w-14 h-14 rounded-2xl bg-${roleColor}-500/20 flex items-center justify-center text-2xl mb-3`}>
                {role === "investor" ? "💼" : "🚀"}
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-white capitalize">{role}</p>
              <p className="text-xs text-slate-400 mt-0.5">{email || "demo@nexus.io"}</p>
              <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-${roleColor}-500/20 text-${roleColor}-400 border border-${roleColor}-500/25`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Active Session
              </div>
            </div>

            {/* Security status */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Security Status</p>
              {[
                { label: "2FA Enabled", ok: true },
                { label: "Email Verified", ok: true },
                { label: "Strong Password", ok: true },
                { label: "Last Login", val: "Just now" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-xs text-slate-300">{item.label}</span>
                  {item.val ? (
                    <span className="text-[10px] text-slate-400">{item.val}</span>
                  ) : (
                    <span className={`text-xs ${item.ok ? "text-emerald-400" : "text-red-400"}`}>{item.ok ? "✓" : "✗"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Features access */}
          <div className="col-span-2">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 mb-4">
              <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-white mb-1">
                {role === "investor" ? "Investor" : "Entrepreneur"} Dashboard Access
              </p>
              <p className="text-xs text-slate-400 mb-4">Features available for your role</p>
              <div className="grid grid-cols-2 gap-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 p-3 bg-slate-800/60 rounded-xl border border-slate-700/30">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <span className="text-xs text-slate-200">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role switcher demo */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-white mb-1">Role Demo</p>
              <p className="text-xs text-slate-400 mb-4">Switch between roles to see access changes</p>
              <div className="flex gap-3">
                {(["entrepreneur", "investor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 p-4 rounded-xl border transition-all text-left ${role === r ? "border-indigo-500/40 bg-indigo-500/10" : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"}`}
                  >
                    <div className="text-2xl mb-2">{r === "investor" ? "💼" : "🚀"}</div>
                    <p className="text-sm font-500 text-white capitalize">{r}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r === "investor" ? "Portfolio & deals" : "Fundraising tools"}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
