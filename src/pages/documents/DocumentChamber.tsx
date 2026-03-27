import { useState, useRef } from "react";

type DocStatus = "Draft" | "In Review" | "Signed";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  uploadedAt: string;
  parties: string[];
  signed: boolean;
}

const INITIAL_DOCS: Document[] = [
  { id: "1", name: "Term_Sheet_Series_A.pdf", type: "pdf", size: "1.2 MB", status: "In Review", uploadedAt: "Mar 25, 2026", parties: ["Sarah Chen", "You"], signed: false },
  { id: "2", name: "NDA_Agreement_2026.pdf", type: "pdf", size: "892 KB", status: "Signed", uploadedAt: "Mar 20, 2026", parties: ["Marcus Webb", "You"], signed: true },
  { id: "3", name: "Investment_Contract_Draft.docx", type: "docx", size: "2.4 MB", status: "Draft", uploadedAt: "Mar 27, 2026", parties: ["You"], signed: false },
];

const STATUS_STYLES: Record<DocStatus, string> = {
  Draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "In Review": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Signed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  doc: "📝",
  default: "📎",
};

export default function DocumentChamber() {
  const [docs, setDocs] = useState<Document[]>(INITIAL_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [view, setView] = useState<"list" | "preview" | "sign">("list");
  const [signature, setSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [filter, setFilter] = useState<DocStatus | "All">("All");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = filter === "All" ? docs : docs.filter((d) => d.status === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.split(".").pop() || "pdf",
      size: `${(file.size / 1024).toFixed(0)} KB`,
      status: "Draft",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      parties: ["You"],
      signed: false,
    };
    setDocs([newDoc, ...docs]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(false);
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setHasSigned(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const applySignature = () => {
    if (!selectedDoc) return;
    setDocs(docs.map((d) => d.id === selectedDoc.id ? { ...d, status: "Signed", signed: true } : d));
    setSelectedDoc({ ...selectedDoc, status: "Signed", signed: true });
    setView("preview");
  };

  const changeStatus = (id: string, status: DocStatus) => {
    setDocs(docs.map((d) => d.id === id ? { ...d, status } : d));
    if (selectedDoc?.id === id) setSelectedDoc({ ...selectedDoc, status });
  };

  const deleteDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) { setSelectedDoc(null); setView("list"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl font-bold text-white">Document Chamber</h1>
            <p className="text-slate-400 text-sm mt-1">Secure contract & deal management</p>
          </div>
          <div className="flex gap-3">
            {view !== "list" && (
              <button onClick={() => setView("list")} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all">
                ← Back
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-all shadow-lg shadow-indigo-500/20"
            >+ Upload Document</button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {view === "list" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", val: docs.length, color: "text-white", bg: "bg-slate-800/60" },
                { label: "Drafts", val: docs.filter((d) => d.status === "Draft").length, color: "text-slate-400", bg: "bg-slate-800/60" },
                { label: "In Review", val: docs.filter((d) => d.status === "In Review").length, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Signed", val: docs.filter((d) => d.status === "Signed").length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} border border-slate-700/40 rounded-xl p-4`}>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {(["All", "Draft", "In Review", "Signed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-500 transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >{f}</button>
              ))}
            </div>

            {/* Doc list */}
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600/60 transition-all">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {FILE_ICONS[doc.type] || FILE_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-500 text-white truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.size} · Uploaded {doc.uploadedAt} · Parties: {doc.parties.join(", ")}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[doc.status]}`}>{doc.status}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setSelectedDoc(doc); setView("preview"); }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
                    >Preview</button>
                    {!doc.signed && (
                      <button
                        onClick={() => { setSelectedDoc(doc); setView("sign"); }}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs transition-all"
                      >Sign</button>
                    )}
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-xs transition-all"
                    >Delete</button>
                  </div>
                </div>
              ))}

              {filteredDocs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-3">📂</div>
                  <p>No documents found</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === "preview" && selectedDoc && (
          <div className="grid grid-cols-3 gap-6">
            {/* Mock document viewer */}
            <div className="col-span-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{FILE_ICONS[selectedDoc.type]}</span>
                  <div>
                    <p className="text-sm font-500 text-white">{selectedDoc.name}</p>
                    <p className="text-xs text-slate-500">{selectedDoc.size}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[selectedDoc.status]}`}>{selectedDoc.status}</span>
              </div>
              {/* Simulated PDF preview */}
              <div className="p-6 space-y-3">
                <div className="w-full h-4 bg-slate-800 rounded animate-pulse" style={{ width: "70%" }} />
                <div className="w-full h-3 bg-slate-800/60 rounded" />
                <div className="w-full h-3 bg-slate-800/60 rounded" style={{ width: "85%" }} />
                <div className="h-6" />
                <div className="w-full h-px bg-slate-800" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-800/60 rounded" />
                    <div className="h-3 bg-slate-800/60 rounded" style={{ width: "80%" }} />
                    <div className="h-3 bg-slate-800/60 rounded" style={{ width: "60%" }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-800/60 rounded" />
                    <div className="h-3 bg-slate-800/60 rounded" style={{ width: "75%" }} />
                    <div className="h-3 bg-slate-800/60 rounded" style={{ width: "90%" }} />
                  </div>
                </div>
                <div className="h-6" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 bg-slate-800/60 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                ))}
                {selectedDoc.signed && (
                  <div className="mt-6 p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
                    <p className="text-xs text-emerald-400 font-500">✓ Digitally Signed · {new Date().toLocaleDateString()}</p>
                    <div className="mt-2 h-8 border-b border-indigo-400/40 flex items-end">
                      <span className="text-indigo-400 text-lg italic" style={{ fontFamily: "cursive" }}>Signed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document details */}
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-500 text-slate-300 mb-4">Document Details</h3>
                <div className="space-y-3">
                  {[
                    { label: "Name", val: selectedDoc.name },
                    { label: "Type", val: selectedDoc.type.toUpperCase() },
                    { label: "Size", val: selectedDoc.size },
                    { label: "Uploaded", val: selectedDoc.uploadedAt },
                    { label: "Parties", val: selectedDoc.parties.join(", ") },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-sm text-slate-200">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-500 text-slate-300 mb-3">Change Status</h3>
                <div className="space-y-2">
                  {(["Draft", "In Review", "Signed"] as DocStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(selectedDoc.id, s)}
                      className={`w-full py-2 rounded-lg text-xs border transition-all ${selectedDoc.status === s ? STATUS_STYLES[s] : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {!selectedDoc.signed && (
                <button
                  onClick={() => setView("sign")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
                >✍️ Sign Document</button>
              )}
            </div>
          </div>
        )}

        {view === "sign" && selectedDoc && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl font-bold text-white mb-1">E-Signature</h3>
              <p className="text-slate-400 text-sm mb-6">Signing: <span className="text-slate-200">{selectedDoc.name}</span></p>

              {/* Type signature */}
              <div className="mb-6">
                <label className="text-xs text-slate-400 mb-2 block">Type your full name</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-lg italic"
                  style={{ fontFamily: "Georgia, serif" }}
                  placeholder="Your full name..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>

              {/* Draw signature */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Or draw your signature</label>
                  <button onClick={clearCanvas} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={580}
                  height={120}
                  className="w-full h-28 bg-slate-800 border border-slate-700 rounded-xl cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              {/* Legal notice */}
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-400 leading-relaxed">
                  By signing this document, you agree that this electronic signature has the same legal validity as a handwritten signature. This action is recorded with a timestamp for audit purposes.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setView("preview")} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-all">Cancel</button>
                <button
                  onClick={applySignature}
                  disabled={!signature && !hasSigned}
                  className={`flex-1 py-3 rounded-xl text-sm font-500 transition-all shadow-lg ${signature || hasSigned ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                >Apply Signature ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
