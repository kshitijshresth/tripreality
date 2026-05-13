import { motion, AnimatePresence } from "framer-motion";
import { Plus, History, Bookmark, Sliders, Globe, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { downloadSourceUrl } from "@/lib/api";

const TRAVELER_TYPES = ["Any", "Solo", "Couple", "Family", "Digital Nomad", "Female Solo"];
const BUDGETS = ["Shoestring", "Mid", "Comfort", "Luxury"];

export const Sidebar = ({ open, setOpen, recent, saved, onPickRecent, travelerType, setTravelerType, budget, setBudget, onNewSearch }) => {
  const nav = useNavigate();
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="hidden md:flex flex-col w-[280px] shrink-0 border-r border-white/5 p-4 gap-4 bg-[#0a0c11]/60 backdrop-blur-xl"
            data-testid="sidebar"
          >
            <button
              onClick={() => nav("/")}
              className="flex items-center gap-2 px-2 py-2 text-white"
              data-testid="sidebar-brand"
            >
              <Globe className="w-4 h-4 text-teal-300" />
              <span className="font-semibold">TripReality</span>
            </button>

            <button
              className="liquid-glass flex items-center gap-2 px-4 py-2.5 text-sm text-white w-full"
              onClick={onNewSearch}
              data-testid="new-search-button"
            >
              <Plus className="w-4 h-4" /> New Search
            </button>

            <Section icon={History} label="Recent">
              <div className="space-y-1 max-h-44 overflow-auto">
                {recent.length === 0 && <div className="text-xs text-white/40 px-2">No recent searches</div>}
                {recent.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onPickRecent(r)}
                    className="w-full text-left text-sm text-white/75 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors truncate"
                    data-testid={`recent-${i}`}
                  >{r.destination}</button>
                ))}
              </div>
            </Section>

            <Section icon={Bookmark} label="Saved Reports">
              <div className="space-y-1 max-h-32 overflow-auto">
                {saved.length === 0 && <div className="text-xs text-white/40 px-2">Saved reports appear here</div>}
                {saved.map((r, i) => (
                  <button key={i} onClick={() => onPickRecent(r)} className="w-full text-left text-sm text-white/75 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 truncate">{r.destination}</button>
                ))}
              </div>
            </Section>

            <Section icon={Sliders} label="Filters">
              <div className="space-y-3">
                <Filter title="Traveler Type">
                  <div className="flex flex-wrap gap-1.5">
                    {TRAVELER_TYPES.map(t => (
                      <button key={t} onClick={() => setTravelerType(t)} className={`chip text-[11px] ${travelerType === t ? "active" : ""}`}>{t}</button>
                    ))}
                  </div>
                </Filter>
                <Filter title="Budget">
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGETS.map(b => (
                      <button key={b} onClick={() => setBudget(b)} className={`chip text-[11px] ${budget === b ? "active" : ""}`}>{b}</button>
                    ))}
                  </div>
                </Filter>
              </div>
            </Section>

            <div className="mt-auto">
              <a
                href={downloadSourceUrl()}
                className="flex items-center justify-center gap-2 text-xs text-white/55 hover:text-white px-3 py-2 rounded-full border border-white/10 hover:border-white/20"
                data-testid="sidebar-download"
              >
                <Download className="w-3.5 h-3.5" /> Download Source Code
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex items-center justify-center w-7 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-r-lg absolute top-1/2 -translate-y-1/2 z-10"
        style={{ left: open ? 280 : 0 }}
        data-testid="sidebar-toggle"
      >
        {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </>
  );
};

const Section = ({ icon: Icon, label, children }) => (
  <div>
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40 px-2 mb-2">
      <Icon className="w-3 h-3" /> {label}
    </div>
    {children}
  </div>
);

const Filter = ({ title, children }) => (
  <div>
    <div className="text-[11px] text-white/55 px-2 mb-1.5">{title}</div>
    <div className="px-2">{children}</div>
  </div>
);
