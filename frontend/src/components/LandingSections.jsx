import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldAlert, Sparkles, BrainCircuit, MapPin, MessageSquareQuote, FileSearch, ArrowUpRight } from "lucide-react";
import { getFeaturedCities } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: BrainCircuit, title: "AI-Synthesized Truth", body: "We don't write travel content. We read thousands of Reddit posts and synthesize what real travelers say.", tint: "tint-teal" },
  { icon: ShieldAlert, title: "Risk Radar", body: "Scams, safety, overtourism, current events, weather — graded with severity, sourced from recent reports.", tint: "tint-rose" },
  { icon: FileSearch, title: "Citations First", body: "Every claim links back to the exact Reddit thread, with date and upvotes. No black boxes.", tint: "tint-violet" },
  { icon: MessageSquareQuote, title: "Anti-Influencer", body: "If a place is overrated, we say it. If a hidden gem is real, we prove it. No sponsored angles.", tint: "tint-amber" },
];

export const Features = () => (
  <section id="features" className="relative py-28 px-5">
    <div className="max-w-6xl mx-auto">
      <SectionHeader kicker="Features" title="Built for travelers who hate being lied to" />
      <div className="grid sm:grid-cols-2 gap-5 mt-12">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
            className={`liquid-card ${f.tint} p-7`}
            data-testid={`feature-${i}`}
          >
            <f.icon className="w-6 h-6 text-white mb-4" strokeWidth={1.4} />
            <h3 className="text-xl text-white font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const STEPS = [
  { n: "01", title: "Type a city", body: "Bangkok, Lisbon, Medellín, anywhere. Add traveler type for tailored truth." },
  { n: "02", title: "We harvest Reddit", body: "Fresh posts and comments across r/travel, r/solotravel, r/digitalnomad, and more." },
  { n: "03", title: "AI synthesizes truth", body: "Hidden pros, hidden cons, risk radar, neighborhoods, practical tips — sourced & dated." },
];

export const HowItWorks = () => (
  <section id="how" className="relative py-28 px-5">
    <div className="max-w-6xl mx-auto">
      <SectionHeader kicker="How it Works" title="From question to truth in 30 seconds" />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="liquid-card p-8"
            data-testid={`step-${i}`}
          >
            <div className="font-serif-i text-5xl text-white/30">{s.n}</div>
            <h3 className="mt-4 text-xl text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-white/60">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const FeaturedCities = () => {
  const [cities, setCities] = useState([]);
  const nav = useNavigate();
  useEffect(() => {
    getFeaturedCities().then((d) => setCities(d.cities || [])).catch(() => {});
  }, []);
  return (
    <section id="cities" className="relative py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="Destinations" title="The truth on cities people argue about" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {cities.map((c, i) => (
            <motion.button
              key={c.name}
              onClick={() => nav(`/app?q=${encodeURIComponent(c.name)}`)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="liquid-card overflow-hidden group text-left"
              data-testid={`city-${c.name.toLowerCase()}`}
            >
              <div className="relative h-44 overflow-hidden">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-white/55">{c.country}</div>
                    <div className="text-xl text-white font-medium flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {c.name}</div>
                  </div>
                  <div className="chip active text-xs">{c.score}/10</div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="text-sm text-white/70">{c.tag}</div>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

const TESTIMONIALS = [
  { quote: "Saved me from the Bali influencer trap. The 'reality check' was savage and accurate.", author: "Maya P.", role: "Solo traveler" },
  { quote: "Found the actual scam patterns in Marrakech 2 days before our flight. Worth a year of guidebooks.", author: "Daniel R.", role: "Travel writer" },
  { quote: "Lisbon's overtourism risk was rated high — and we got hit with exactly what they predicted.", author: "Sofia V.", role: "Digital nomad" },
];

export const Testimonials = () => (
  <section className="relative py-28 px-5">
    <div className="max-w-6xl mx-auto">
      <SectionHeader kicker="Loved by travelers" title="Praise from people who hate platitudes" />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="liquid-card p-7"
            data-testid={`testimonial-${i}`}
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <p className="mt-4 font-serif-i text-2xl text-white/90 leading-snug">"{t.quote}"</p>
            <div className="mt-5 text-sm text-white/55">{t.author} · {t.role}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="relative py-14 px-5 border-t border-white/5">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div>
        <div className="font-serif-i text-3xl text-white">TripReality</div>
        <div className="text-sm text-white/40 mt-1">The anti-influencer truth layer for travel.</div>
      </div>
      <div className="text-xs text-white/40">© {new Date().getFullYear()} TripReality. Synthesized from public Reddit posts.</div>
    </div>
  </footer>
);

const SectionHeader = ({ kicker, title }) => (
  <div className="max-w-2xl">
    <div className="text-xs uppercase tracking-[0.2em] text-teal-300/80">{kicker}</div>
    <h2 className="mt-3 font-serif-i text-4xl sm:text-5xl text-white leading-tight">{title}</h2>
  </div>
);
