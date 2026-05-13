import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { downloadSourceUrl } from "@/lib/api";
import { toast } from "sonner";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";
const TRAVELER_TYPES = ["Solo", "Couple", "Family", "Digital Nomad", "Female Solo"];

export const Hero = () => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const fadingOutRef = useRef(false);
  const [destination, setDestination] = useState("");
  const [travelerType, setTravelerType] = useState("Solo");
  const nav = useNavigate();

  // ===== Custom fade logic =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeIn = () => {
      fadingOutRef.current = false;
      const start = performance.now();
      const startOpacity = parseFloat(video.style.opacity || "0");
      const step = (t) => {
        const p = Math.min(1, (t - start) / 500);
        video.style.opacity = String(startOpacity + (1 - startOpacity) * p);
        if (p < 1) rafRef.current = requestAnimationFrame(step);
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    const fadeOut = (onDone) => {
      if (fadingOutRef.current) return;
      fadingOutRef.current = true;
      const start = performance.now();
      const startOpacity = parseFloat(video.style.opacity || "1");
      const step = (t) => {
        const p = Math.min(1, (t - start) / 500);
        video.style.opacity = String(startOpacity * (1 - p));
        if (p < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else if (onDone) {
          onDone();
        }
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    const onTimeUpdate = () => {
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !fadingOutRef.current) {
        fadeOut();
      }
    };

    const onEnded = () => {
      fadeOut(() => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(fadeIn).catch(fadeIn);
        } else {
          fadeIn();
        }
      });
    };

    const onLoaded = () => {
      video.style.opacity = "0";
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(fadeIn).catch(fadeIn);
      } else {
        fadeIn();
      }
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const d = destination.trim();
    if (!d) {
      toast.error("Please enter a destination");
      return;
    }
    nav(`/app?q=${encodeURIComponent(d)}&type=${encodeURIComponent(travelerType)}`);
  };

  const onDownload = () => {
    toast.message("Preparing source zip…");
    window.location.href = downloadSourceUrl();
  };

  return (
    <section className="relative w-full h-screen overflow-hidden" data-testid="hero-section">
      {/* Video background */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        loop={false}
        preload="auto"
        style={{ opacity: 0 }}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        src={VIDEO_URL}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080b]/55 via-[#07080b]/35 to-[#07080b] pointer-events-none" />
      <div className="absolute inset-0 grain pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 -translate-y-[20%]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
          className="text-center max-w-4xl"
        >
          <div className="chip mb-6 mx-auto" data-testid="hero-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Anti-influencer truth layer for travel
          </div>
          <h1 className="font-serif-i text-[44px] leading-[1.05] sm:text-6xl lg:text-7xl text-white">
            Instagram shows the highlight reel.
            <br />
            <span className="italic text-white/85">We show you reality.</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-white/65 max-w-xl mx-auto">
            Hidden pros. Hidden cons. Real Reddit truth synthesized by AI.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-10 w-full max-w-2xl"
          data-testid="hero-search-form"
        >
          <div className="liquid-glass flex items-center pl-5 pr-2 py-2">
            <Search className="w-5 h-5 text-white/55 mr-2" strokeWidth={1.6} />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-base py-2"
              placeholder="Where are you heading? e.g. Bangkok, Lisbon, Medellín"
              data-testid="hero-destination-input"
            />
            <button
              type="submit"
              className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 text-sm"
              data-testid="hero-submit-button"
            >
              Reveal <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {TRAVELER_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTravelerType(t)}
                className={`chip ${travelerType === t ? "active" : ""}`}
                data-testid={`chip-${t.toLowerCase().replace(/\s/g, "-")}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Download source */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors"
              data-testid="download-source-button"
            >
              <Download className="w-3.5 h-3.5" />
              Download Source Code (.zip)
            </button>
          </div>
        </motion.form>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07080b] to-transparent pointer-events-none" />
    </section>
  );
};
