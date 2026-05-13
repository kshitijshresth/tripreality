import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, GitCompare, FileDown, Bookmark, Globe } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ReportView } from "@/components/ReportView";
import { ReportSkeleton } from "@/components/ReportSkeleton";
import { queryDestination, chatFollowup } from "@/lib/api";
import { toast } from "sonner";

const FOLLOWUPS = [
  "Is it safe for solo female travelers?",
  "Best time to visit?",
  "Hidden food spots?",
  "Common scams to avoid?",
  "Realistic daily budget?",
];

export default function AppPage() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") || "";
  const initialType = params.get("type") || "Any";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [destination, setDestination] = useState(initialQ);
  const [travelerType, setTravelerType] = useState(initialType);
  const [budget, setBudget] = useState("Mid");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState([]);
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);
  const navg = useNavigate();

  // Load persisted recent/saved
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem("tr_recent") || "[]"));
      setSaved(JSON.parse(localStorage.getItem("tr_saved") || "[]"));
    } catch {}
  }, []);

  // Auto-run if q in url
  useEffect(() => {
    if (initialQ) runQuery(initialQ, initialType);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [report, messages, loading]);

  const persistRecent = (dest) => {
    const next = [{ destination: dest, ts: Date.now() }, ...recent.filter(r => r.destination !== dest)].slice(0, 12);
    setRecent(next);
    localStorage.setItem("tr_recent", JSON.stringify(next));
  };

  const runQuery = async (dest, type) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setMessages([]);
    try {
      const data = await queryDestination({ destination: dest, traveler_type: type || travelerType, extra: `budget=${budget}` });
      setReport(data);
      persistRecent(dest);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Failed to fetch report");
      toast.error("Couldn't fetch report. Try a different city.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSearch = (e) => {
    e?.preventDefault();
    const d = destination.trim();
    if (!d) return;
    runQuery(d, travelerType);
  };

  const onSendChat = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || !report) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setChatLoading(true);
    try {
      const data = await chatFollowup({ destination: report.destination, history: messages, message: msg, report });
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (e) {
      toast.error("Chat failed");
    } finally {
      setChatLoading(false);
    }
  };

  const onSave = () => {
    if (!report) return;
    const next = [{ destination: report.destination, id: report.id, ts: Date.now() }, ...saved.filter(s => s.destination !== report.destination)].slice(0, 20);
    setSaved(next);
    localStorage.setItem("tr_saved", JSON.stringify(next));
    toast.success("Report saved");
  };

  const onExportPDF = () => {
    if (!report) return;
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-stars text-white flex" data-testid="app-page">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        recent={recent}
        saved={saved}
        onPickRecent={(r) => { setDestination(r.destination); runQuery(r.destination, travelerType); }}
        travelerType={travelerType}
        setTravelerType={setTravelerType}
        budget={budget}
        setBudget={setBudget}
        onNewSearch={() => { setReport(null); setMessages([]); setDestination(""); }}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 px-5 py-3 border-b border-white/5 bg-[#07080b]/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => navg("/")} className="flex md:hidden items-center gap-2 text-white">
              <Globe className="w-4 h-4 text-teal-300" /><span className="font-semibold">TripReality</span>
            </button>
            <div className="flex-1 text-sm text-white/60 truncate">
              {report ? <>Report for <span className="text-white">{report.destination}</span></> : "Ask about any destination"}
            </div>
            {report && (
              <div className="flex items-center gap-2">
                <button onClick={onSave} className="chip" data-testid="save-button"><Bookmark className="w-3.5 h-3.5" />Save</button>
                <button className="chip" data-testid="compare-button"><GitCompare className="w-3.5 h-3.5" />Compare</button>
                <button onClick={onExportPDF} className="chip" data-testid="export-pdf-button"><FileDown className="w-3.5 h-3.5" />Export PDF</button>
              </div>
            )}
          </div>
        </div>

        {/* Scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8">
          <div className="max-w-4xl mx-auto">
            {!report && !loading && !error && <EmptyState onPick={(c) => { setDestination(c); runQuery(c, travelerType); }} />}
            {loading && <ReportSkeleton />}
            {error && (
              <div className="liquid-card p-8 text-center" data-testid="error-state">
                <div className="text-rose-300 font-medium">Something went wrong</div>
                <div className="text-white/60 text-sm mt-2">{error}</div>
              </div>
            )}
            {report && <ReportView report={report} />}

            {/* chat messages */}
            {messages.length > 0 && (
              <div className="mt-8 space-y-3" data-testid="chat-messages">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-2xl ${m.role === "user" ? "ml-auto" : ""}`}
                  >
                    <div className={`liquid-card p-4 text-sm whitespace-pre-wrap ${m.role === "user" ? "tint-teal" : ""}`}>{m.content}</div>
                  </motion.div>
                ))}
                {chatLoading && <div className="liquid-card p-4 max-w-2xl"><div className="shimmer h-3 w-40 rounded" /></div>}
              </div>
            )}
          </div>
        </div>

        {/* Chat input */}
        <div className="sticky bottom-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#07080b] via-[#07080b]/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            {report && (
              <div className="mb-3 flex flex-wrap gap-2" data-testid="followup-chips">
                {FOLLOWUPS.map((q) => (
                  <button key={q} onClick={() => onSendChat(q)} className="chip">{q}</button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); if (!report) onSubmitSearch(e); else onSendChat(); }}
              className="liquid-glass flex items-center pl-5 pr-2 py-2"
              data-testid="chat-form"
            >
              <input
                value={report ? input : destination}
                onChange={(e) => (report ? setInput(e.target.value) : setDestination(e.target.value))}
                placeholder={report ? "Ask a follow-up… e.g. Best 3 days itinerary?" : "Type a destination — Bangkok, Lisbon, Medellín…"}
                className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-base py-2"
                data-testid="chat-input"
              />
              <button type="submit" className="btn-primary inline-flex items-center justify-center w-10 h-10 rounded-full" data-testid="chat-submit">
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

const SUGG = ["Bangkok", "Lisbon", "Medellín", "Tokyo", "Bali", "Mexico City"];

const EmptyState = ({ onPick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="liquid-card p-12 text-center"
    data-testid="empty-state"
  >
    <div className="text-xs uppercase tracking-[0.2em] text-teal-300/80">Start exploring</div>
    <h2 className="mt-3 font-serif-i text-4xl text-white">Ask the truth about any city</h2>
    <p className="mt-3 text-sm text-white/55 max-w-md mx-auto">We'll harvest fresh Reddit posts and synthesize hidden pros, hidden cons, and a risk radar.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-2">
      {SUGG.map(c => <button key={c} onClick={() => onPick(c)} className="chip">{c}</button>)}
    </div>
  </motion.div>
);
