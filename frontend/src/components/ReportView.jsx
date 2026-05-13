import { motion } from "framer-motion";
import { ShieldAlert, Sparkles, AlertTriangle, MapPin, Compass, Cloud, Megaphone, Eye, Lightbulb, ExternalLink, TrendingUp, Activity } from "lucide-react";

const RISK_ICONS = {
  "Scams": Eye,
  "Safety": ShieldAlert,
  "Overtourism": Megaphone,
  "Current Events": Activity,
  "Weather": Cloud,
};

export const ReportView = ({ report }) => {
  if (!report) return null;
  return (
    <div className="space-y-5" data-testid="report-view">
      <Header report={report} />
      <RealityCheck text={report.reality_check} />
      <div className="grid lg:grid-cols-2 gap-5">
        <ProsCard items={report.hidden_pros || []} />
        <ConsCard items={report.hidden_cons || []} />
      </div>
      <RiskRadar items={report.risk_radar || []} />
      <Neighborhoods items={report.neighborhoods || []} />
      <CurrentSituation text={report.current_situation} />
      <PracticalTips items={report.practical_tips || []} />
      <Sources items={report.sources || []} confidence={report.confidence} />
    </div>
  );
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] },
});

const Header = ({ report }) => (
  <motion.div {...fadeUp(0)} className="liquid-card p-7" data-testid="report-header">
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-teal-300/80">TripReality Report</div>
        <h2 className="mt-2 font-serif-i text-4xl text-white">{report.destination}</h2>
        <p className="mt-3 text-white/70 max-w-2xl text-sm">{report.summary}</p>
      </div>
      <VibeScore score={report.vibe_score} />
    </div>
  </motion.div>
);

const VibeScore = ({ score }) => {
  const s = Number(score || 0);
  const color = s >= 8 ? "text-teal-300" : s >= 6 ? "text-amber-300" : "text-rose-300";
  return (
    <div className="text-right" data-testid="vibe-score">
      <div className="text-xs uppercase tracking-[0.18em] text-white/40">Reality Score</div>
      <div className={`font-serif-i text-5xl ${color}`}>{s.toFixed(1)}<span className="text-white/30 text-2xl">/10</span></div>
    </div>
  );
};

const RealityCheck = ({ text }) => (
  text ? (
    <motion.div {...fadeUp(1)} className="liquid-card tint-violet p-6">
      <div className="flex items-center gap-2 text-white/80"><Compass className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Reality Check</span></div>
      <p className="mt-3 text-white/85 font-serif-i text-xl leading-snug">{text}</p>
    </motion.div>
  ) : null
);

const ProsCard = ({ items }) => (
  <motion.div {...fadeUp(2)} className="liquid-card tint-teal p-6" data-testid="hidden-pros">
    <div className="flex items-center gap-2 text-teal-300"><Sparkles className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Hidden Pros</span></div>
    <ul className="mt-4 space-y-4">
      {items.map((p, i) => (
        <li key={i} className="border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
          <div className="text-white text-base font-medium">{p.title}</div>
          <div className="text-sm text-white/65 mt-1">{p.detail}</div>
        </li>
      ))}
    </ul>
  </motion.div>
);

const ConsCard = ({ items }) => (
  <motion.div {...fadeUp(2.5)} className="liquid-card tint-rose p-6" data-testid="hidden-cons">
    <div className="flex items-center gap-2 text-rose-300"><AlertTriangle className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Hidden Cons & Risks</span></div>
    <ul className="mt-4 space-y-4">
      {items.map((p, i) => (
        <li key={i} className="border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
          <div className="text-white text-base font-medium">{p.title}</div>
          <div className="text-sm text-white/65 mt-1">{p.detail}</div>
        </li>
      ))}
    </ul>
  </motion.div>
);

const RiskRadar = ({ items }) => (
  <motion.div {...fadeUp(3)} className="liquid-card p-6" data-testid="risk-radar">
    <div className="flex items-center gap-2 text-amber-300"><TrendingUp className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Risk Radar</span></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
      {items.map((r, i) => {
        const Icon = RISK_ICONS[r.category] || ShieldAlert;
        return (
          <div key={i} className="liquid-card p-4">
            <div className="flex items-center justify-between">
              <Icon className="w-4 h-4 text-white/70" />
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full sev-${(r.severity || "low").toLowerCase()}`}>{r.severity}</span>
            </div>
            <div className="mt-3 text-sm text-white font-medium">{r.category}</div>
            <div className="mt-1 text-xs text-white/55 leading-relaxed">{r.detail}</div>
          </div>
        );
      })}
    </div>
  </motion.div>
);

const Neighborhoods = ({ items }) => (
  items.length ? (
    <motion.div {...fadeUp(4)} className="liquid-card p-6" data-testid="neighborhoods">
      <div className="flex items-center gap-2 text-white/80"><MapPin className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Best Neighborhoods</span></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {items.map((n, i) => (
          <div key={i} className="liquid-card p-4">
            <div className="text-white font-medium">{n.name}</div>
            <div className="text-xs text-white/55 mt-1">{n.vibe}</div>
            <div className="mt-3 text-xs text-teal-300/90">Best for: <span className="text-white/70">{n.best_for}</span></div>
            <div className="text-xs text-rose-300/90">Avoid if: <span className="text-white/70">{n.avoid_if}</span></div>
          </div>
        ))}
      </div>
    </motion.div>
  ) : null
);

const CurrentSituation = ({ text }) => (
  text ? (
    <motion.div {...fadeUp(4.5)} className="liquid-card tint-amber p-6">
      <div className="flex items-center gap-2 text-amber-300"><Activity className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Current Situation (last 30-90 days)</span></div>
      <p className="mt-3 text-white/80 text-sm leading-relaxed">{text}</p>
    </motion.div>
  ) : null
);

const PracticalTips = ({ items }) => (
  items.length ? (
    <motion.div {...fadeUp(5)} className="liquid-card p-6" data-testid="practical-tips">
      <div className="flex items-center gap-2 text-white/80"><Lightbulb className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Practical Tips</span></div>
      <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/75">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2"><span className="text-teal-300">›</span><span>{t}</span></li>
        ))}
      </ul>
    </motion.div>
  ) : null
);

const Sources = ({ items, confidence }) => (
  <motion.div {...fadeUp(6)} className="liquid-card p-6" data-testid="sources">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-white/80"><ExternalLink className="w-4 h-4" /><span className="text-xs uppercase tracking-[0.2em]">Sources</span></div>
      {confidence != null && (
        <div className="text-xs text-white/55">Confidence: <span className="text-teal-300">{Math.round(Number(confidence) * 100)}%</span></div>
      )}
    </div>
    <ul className="mt-4 divide-y divide-white/5">
      {items.slice(0, 20).map((s) => (
        <li key={s.id} className="py-3 flex items-start justify-between gap-4">
          <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-white/85 hover:text-teal-300 transition-colors line-clamp-1">{s.title}</a>
          <div className="text-xs text-white/40 whitespace-nowrap">r/{s.subreddit} · {new Date(s.date).toLocaleDateString()} · ↑{s.score}</div>
        </li>
      ))}
      {!items.length && <li className="text-sm text-white/50 py-3">No Reddit sources found.</li>}
    </ul>
  </motion.div>
);
