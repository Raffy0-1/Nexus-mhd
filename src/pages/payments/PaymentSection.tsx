import { useState } from "react";

type TxStatus = "completed" | "pending" | "failed";
type TxType = "deposit" | "withdraw" | "transfer" | "deal";

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  status: TxStatus;
  date: string;
  note?: string;
}

const INITIAL_TXS: Transaction[] = [
  { id: "1", type: "deposit", amount: 50000, sender: "Bank Account", receiver: "Nexus Wallet", status: "completed", date: "Mar 27, 2026", note: "Initial funding" },
  { id: "2", type: "deal", amount: 25000, sender: "Sarah Chen", receiver: "You (TechFlow Inc.)", status: "completed", date: "Mar 25, 2026", note: "Series A · Tranche 1" },
  { id: "3", type: "transfer", amount: 5000, sender: "You", receiver: "Marcus Webb", status: "pending", date: "Mar 27, 2026", note: "Revenue share Q1" },
  { id: "4", type: "withdraw", amount: 8000, sender: "Nexus Wallet", receiver: "Bank Account", status: "completed", date: "Mar 22, 2026" },
  { id: "5", type: "deal", amount: 10000, sender: "Alex Rivera", receiver: "You (TechFlow Inc.)", status: "pending", date: "Mar 20, 2026", note: "Seed extension" },
];

const TX_ICONS: Record<TxType, string> = {
  deposit: "↓", withdraw: "↑", transfer: "⇄", deal: "🤝",
};
const TX_COLORS: Record<TxType, string> = {
  deposit: "text-emerald-400 bg-emerald-500/15",
  withdraw: "text-red-400 bg-red-500/15",
  transfer: "text-blue-400 bg-blue-500/15",
  deal: "text-violet-400 bg-violet-500/15",
};
const STATUS_COLORS: Record<TxStatus, string> = {
  completed: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
  pending: "text-amber-400 bg-amber-500/15 border-amber-500/25",
  failed: "text-red-400 bg-red-500/15 border-red-500/25",
};

const cardMask = (n: string) => `•••• •••• •••• ${n}`;

export default function PaymentSection() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TXS);
  const [balance, setBalance] = useState(67000);
  const [activeTab, setActiveTab] = useState<"overview" | "deposit" | "withdraw" | "transfer" | "deal">("overview");
  const [form, setForm] = useState({ amount: "", recipient: "", note: "", card: "" });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");

  const process = (type: TxType) => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: Date.now().toString(),
        type,
        amount,
        sender: type === "deposit" ? (form.card || "Card ending 4242") : "You",
        receiver: type === "deposit" ? "Nexus Wallet" : (form.recipient || "Recipient"),
        status: "pending",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        note: form.note || undefined,
      };
      setTransactions([newTx, ...transactions]);
      if (type === "deposit") setBalance(balance + amount);
      if (type === "withdraw") setBalance(balance - amount);
      setProcessing(false);
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} of $${amount.toLocaleString()} initiated!`);
      setForm({ amount: "", recipient: "", note: "", card: "" });
      setTimeout(() => { setSuccess(""); setActiveTab("overview"); }, 2500);
    }, 1500);
  };

  const completed = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + (["deposit","deal"].includes(t.type) ? t.amount : -t.amount), 0);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">Wallet, transactions & deal funding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wallet card + actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Wallet card */}
            <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-4" />
              <div className="relative">
                <p className="text-indigo-200 text-xs mb-1 tracking-widest uppercase">Nexus Wallet</p>
                <p className="text-white text-3xl font-bold mt-2">${balance.toLocaleString()}</p>
                <p className="text-indigo-300 text-xs mt-1">Available balance</p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-indigo-200 text-xs">{cardMask("4242")}</p>
                  <p className="text-indigo-300 text-[10px] mt-0.5">TechFlow Inc. · Entrepreneur</p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Raised</p>
                <p className="text-emerald-400 font-bold text-lg">$85K</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Pending</p>
                <p className="text-amber-400 font-bold text-lg">
                  ${transactions.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { type: "deposit" as TxType, label: "Deposit", icon: "↓", color: "hover:border-emerald-500/40 hover:bg-emerald-500/5" },
                  { type: "withdraw" as TxType, label: "Withdraw", icon: "↑", color: "hover:border-red-500/40 hover:bg-red-500/5" },
                  { type: "transfer" as TxType, label: "Transfer", icon: "⇄", color: "hover:border-blue-500/40 hover:bg-blue-500/5" },
                  { type: "deal" as TxType, label: "Fund Deal", icon: "🤝", color: "hover:border-violet-500/40 hover:bg-violet-500/5" },
                ]).map((a) => (
                  <button
                    key={a.type}
                    onClick={() => setActiveTab(a.type)}
                    className={`p-3 bg-slate-800 border border-slate-700/50 rounded-xl text-left transition-all ${activeTab === a.type ? "border-indigo-500/40 bg-indigo-500/5" : a.color}`}
                  >
                    <div className="text-lg mb-1">{a.icon}</div>
                    <p className="text-xs text-slate-300">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action forms */}
            {activeTab !== "overview" && (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold mb-5 capitalize">{activeTab === "deal" ? "Fund a Deal" : activeTab}</h3>

                {success && (
                  <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
                    ✓ {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-lg font-500"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  {activeTab === "deposit" && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Card Number</label>
                      <input
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        placeholder="•••• •••• •••• 4242"
                        value={form.card}
                        onChange={(e) => setForm({ ...form, card: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" placeholder="MM / YY" />
                        <input className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" placeholder="CVV" />
                      </div>
                    </div>
                  )}

                  {["transfer", "deal"].includes(activeTab) && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{activeTab === "deal" ? "Entrepreneur / Company" : "Recipient"}</label>
                      <input
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        placeholder={activeTab === "deal" ? "e.g. TechFlow Inc." : "Name or wallet ID"}
                        value={form.recipient}
                        onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Note (optional)</label>
                    <input
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Series A · Tranche 1"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="flex gap-2">
                    {[1000, 5000, 10000, 25000].map((a) => (
                      <button
                        key={a}
                        onClick={() => setForm({ ...form, amount: String(a) })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-xs text-slate-400 transition-all"
                      >${(a / 1000).toFixed(0)}K</button>
                    ))}
                  </div>

                  <button
                    onClick={() => process(activeTab as TxType)}
                    disabled={processing || !form.amount}
                    className={`w-full py-3 rounded-xl font-500 text-sm transition-all shadow-lg ${
                      processing || !form.amount
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        Processing...
                      </span>
                    ) : (
                      `Confirm ${activeTab === "deal" ? "Funding" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Transaction history */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold mb-5">Transaction History</h3>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/40 transition-all">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${TX_COLORS[tx.type]}`}>
                      {TX_ICONS[tx.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-500 text-white capitalize">{tx.type === "deal" ? "Deal Funding" : tx.type}</p>
                      <p className="text-xs text-slate-500 truncate">{tx.sender} → {tx.receiver}</p>
                      {tx.note && <p className="text-xs text-slate-600 italic">{tx.note}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-500 ${["deposit","deal"].includes(tx.type) ? "text-emerald-400" : "text-red-400"}`}>
                        {["deposit","deal"].includes(tx.type) ? "+" : "-"}${tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500">{tx.date}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[tx.status]}`}>{tx.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
