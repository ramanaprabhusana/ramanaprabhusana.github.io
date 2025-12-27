// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReveal } from "./hooks/useReveal";
import { asset } from "./utils/asset";

/* -------------------------------- utilities ------------------------------- */

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function useRafScroll(callback) {
  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        callback();
      });
    };

    callback();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [callback]);
}

function useScrollProgress() {
  const [p, setP] = useState(0);

  useRafScroll(() => {
    const doc = document.documentElement;
    const total = Math.max(1, doc.scrollHeight - window.innerHeight);
    const v = clamp01(window.scrollY / total);
    setP(v);
  });

  return p;
}

function SafeImg({ src, alt, className = "", fallbackText = "IMG" }) {
  const [ok, setOk] = useState(true);
  if (!src) return null;

  return ok ? (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setOk(false)}
    />
  ) : (
    <div
      className={[
        className,
        "grid place-items-center rounded-xl border border-white/10 bg-white/5 text-xs text-neutral-200/70",
      ].join(" ")}
      aria-label={alt}
      title={alt}
    >
      {fallbackText}
    </div>
  );
}

function SmartImg({ sources, alt, className = "", fallbackText = "IMG" }) {
  const list = Array.isArray(sources) ? sources.filter(Boolean) : [];
  const [idx, setIdx] = useState(0);

  if (!list.length) return null;
  const src = asset(list[Math.min(idx, list.length - 1)]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (idx < list.length - 1) setIdx((x) => x + 1);
      }}
    />
  );
}

/* --------------------------------- UI bits -------------------------------- */

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm text-neutral-200/80 hover:text-neutral-100 transition"
  >
    {children}
  </a>
);

const Card = ({ children, className = "" }) => (
  <div
    className={[
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm",
      "transition will-change-transform hover:bg-white/10 hover:-translate-y-0.5",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Section = ({ id, title, subtitle, children }) => (
  <section id={id} className="scroll-mt-24 py-14">
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-50">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm sm:text-base text-neutral-200/70 max-w-3xl">
          {subtitle}
        </p>
      ) : null}
    </div>
    {children}
  </section>
);

function MarqueeStrip({ items, seconds = 22 }) {
  const repeated = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-white/[0.03]"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
      aria-hidden="true"
    >
      <div
        className="flex w-max gap-10 py-3"
        style={{ animation: `marquee ${seconds}s linear infinite` }}
      >
        {repeated.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-200/80"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function StickyStory({ title, subtitle, items }) {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(0);
  const count = Math.max(items?.length || 0, 1);

  useRafScroll(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = rect.height - vh;

    if (total <= 0) {
      setActive(0);
      return;
    }

    const scrolled = clamp01((-rect.top) / total);
    const idx = Math.min(count - 1, Math.max(0, Math.floor(scrolled * count)));
    setActive(idx);
  });

  const current = items?.[active];

  return (
    <section ref={wrapRef} className="py-14">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm sm:text-base text-neutral-200/70 max-w-3xl">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="lg:sticky lg:top-24 h-[420px] sm:h-[520px] lg:h-[70vh]">
          <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="absolute inset-0 opacity-70">
              <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative h-full p-6 flex flex-col justify-end">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden">
                  <SafeImg
                    src={current?.image ? asset(current.image) : ""}
                    alt={current?.heading || "Highlight"}
                    className="h-full w-full object-contain p-2"
                    fallbackText={(current?.heading || "HL")
                      .slice(0, 2)
                      .toUpperCase()}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm text-neutral-200/70">Highlight</div>
                  <div className="font-semibold truncate">
                    {current?.heading || "Section"}
                  </div>
                </div>

                <div className="ml-auto text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200/80">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg sm:text-xl font-semibold tracking-tight">
                  {current?.subheading || ""}
                </div>
                <p className="mt-2 text-sm sm:text-base text-neutral-200/70 leading-relaxed">
                  {current?.body || ""}
                </p>

                {current?.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {current.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-10">
          <div className="space-y-4">
            {items.map((it, idx) => {
              const isActive = idx === active;
              return (
                <div
                  key={`${it.heading}-${idx}`}
                  data-reveal
                  className={[
                    "reveal-init rounded-2xl border p-6 transition",
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center text-sm font-semibold">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold">{it.heading}</div>
                        {it.when ? (
                          <span className="text-xs text-neutral-200/60">
                            {it.when}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm text-neutral-200/70 leading-relaxed">
                        {it.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-[55vh]" />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- App ---------------------------------- */

export default function App() {
  useReveal();
  const progress = useScrollProgress();

  const profile = useMemo(
    () => ({
      name: "Ramana Prabhu Sana",
      email: "rsana@purdue.edu",
      phone: "(347) 269-9365",
      linkedin: "https://www.linkedin.com/in/ramanaprabhusana/",
      photo: "brand/profile.jpg",
      objective:
        "Seeking 2026 Internship or Full-time opportunities in Analytics and technology",
      headline: "Senior Lead Analyst. Pharma forecasting. Analytics and automation.",
      summary:
        "Strategic and results-oriented Senior Lead Analyst with 6+ years of global experience delivering actionable insights and scalable forecasting solutions across pharmaceutical and consulting domains. Adept at leading cross-functional initiatives, developing predictive models, and automating analytical platforms to influence multi-billion-dollar portfolio decisions.",
      chips: [
        "6+ years global",
        "Pharma forecasting",
        "Predictive modeling (ARIMA)",
        "Excel (VBA, macros)",
        "Python, SQL",
      ],
    }),
    []
  );

  const marqueeItems = useMemo(
    () => [
      "PHARMA FORECASTING",
      "ANALYTICS",
      "PREDICTIVE MODELING",
      "DATA VISUALIZATION",
      "AUTOMATION",
    ],
    []
  );

  const highlights = useMemo(
    () => [
      {
        heading: "ARIMA trend forecasting",
        subheading: "Prostate cancer market and pipeline valuation",
        when: "Novartis",
        body:
          "Spearheaded prostate cancer market and pipeline valuation using ARIMA-based trend forecasting in Excel to deliver accurate trend insights for strategic planning.",
        tags: ["ARIMA", "Excel", "Valuation"],
        image: "brand/novartis.svg",
      },
      {
        heading: "$1.2Bn lung cancer asset",
        subheading: "Sales forecast to support launch planning",
        when: "Novartis",
        body:
          "Developed an Excel-based sales forecast for a $1.2Bn lung cancer asset using syndicated data. Improved accuracy and supported 2024 launch decisions with cross-functional leadership.",
        tags: ["Forecasting", "Excel", "Launch"],
        image: "brand/novartis.svg",
      },
      {
        heading: "20+ country forecasting",
        subheading: "Global model and dashboard for launch strategy",
        when: "Genpact",
        body:
          "Built a global forecasting model and a Power BI dashboard with cardiovascular teams across 20+ countries. Improved prediction accuracy and streamlined leadership decisions.",
        tags: ["Power BI", "Global", "Strategy"],
        image: "brand/genpact.png",
      },
      {
        heading: "VBA submission tool",
        subheading: "On-time global oncology submissions",
        when: "Novartis",
        body:
          "Reconfigured a VBA-based forecasting submission tool for the global oncology portfolio. Enabled on-time submissions and reduced subcontracting costs.",
        tags: ["VBA", "Operations", "Reliability"],
        image: "brand/novartis.svg",
      },
      {
        heading: "$3.5Bn M&A model and dashboard",
        subheading: "Scenario-ready forecasting for deal assessment",
        when: "ZS Associates",
        body:
          "Built a forecast model and Tableau dashboard supporting a $3.5Bn M&A evaluation in multiple myeloma. Improved scenario clarity to support data-driven assessment.",
        tags: ["Tableau", "M&A", "Scenario modeling"],
        image: "brand/zs.svg",
      },
    ],
    []
  );

  const experience = useMemo(
    () => [
      {
        company: "Novartis Pharmaceuticals Corporation",
        role: "Senior Lead Analyst",
        dates: "July 2023 to July 2025",
        logo: "brand/novartis.svg",
        bullets: [
          "Spearheaded prostate cancer market and pipeline valuation using ARIMA-based trend forecasting in Excel for strategic planning.",
          "Developed Excel-based sales forecast for a $1.2Bn lung cancer asset using syndicated data to support launch decisions.",
          "Built a predictive Excel model for an emerging radio ligand therapy brand to evaluate country-level revenue potential for launch strategy.",
        ],
      },
      {
        company: "Genpact",
        role: "Lead Analyst",
        dates: "October 2022 to July 2023",
        logo: "brand/genpact.png",
        bullets: [
          "Built a global forecasting model and Power BI dashboard with cardiovascular teams across 20+ countries for a client.",
          "Improved prediction accuracy and streamlined leadership decisions for launch strategy.",
        ],
      },
      {
        company: "Novartis Pharmaceuticals Corporation",
        role: "Business Analyst",
        dates: "January 2021 to October 2022",
        logo: "brand/novartis.svg",
        bullets: [
          "Reconfigured a VBA-based forecasting submission tool for the global oncology portfolio, enabling on-time forecast submissions and reducing subcontracting costs.",
          "Forecasted $800M global revenue for a migraine brand using Excel-based forecasting models.",
          "Developed a Qlik Sense dashboard for the global neuroscience team to visualize KPIs and drive strategic decisions.",
        ],
      },
      {
        company: "ZS Associates",
        role: "Decision Analytics Associate",
        dates: "July 2019 to December 2020",
        logo: "brand/zs.svg",
        bullets: [
          "Led global forecast model creation and Tableau dashboard for a $3.5Bn M&A deal in multiple myeloma to support deal assessment.",
          "Designed an HIV forecast model in Scarsin i2e platform with automated patient-level data integration and weekly actuals tracking.",
          "Conducted in-depth market research across therapy areas and clinical trials, strengthening assumptions and decision narratives.",
        ],
      },
      {
        company: "STL",
        role: "Engineer. Quality Assurance",
        dates: "December 2018 to June 2019",
        logo: "brand/stl.png",
        bullets: [
          "Led and mentored a 50-member team to drive timely, high-quality inspections of optical fiber cables.",
          "Conducted reliability tests and root-cause analysis to reduce failures and decrease scrap.",
        ],
      },
    ],
    []
  );

  const projects = useMemo(
    () => [
      {
        name: "Global forecasting submission workflow",
        desc:
          "Improved a VBA-driven workflow with stronger QA checks and standardized outputs so submissions become reliable and predictable.",
        tags: ["Excel", "VBA", "Process"],
      },
      {
        name: "Multi-market launch dashboard layer",
        desc:
          "Created leadership-friendly views that connect model outputs to clear decisions across regions and teams.",
        tags: ["Power BI", "Forecasting", "Stakeholders"],
      },
      {
        name: "Scenario-ready M&A modeling",
        desc:
          "Built scenario structure and output views to support structured deal assessment and clearer decision discussions.",
        tags: ["Tableau", "Scenario modeling", "Strategy"],
      },
      {
        name: "KPI reporting for portfolio tracking",
        desc:
          "Built KPI views and cadence-ready reporting outputs for cross-functional reviews and leadership updates.",
        tags: ["KPIs", "Insights", "Reporting"],
      },
    ],
    []
  );

  const skills = useMemo(
    () => ({
      core: [
        "Pharma and oncology forecasting",
        "Predictive modeling (ARIMA)",
        "Data visualization",
        "Market research",
      ],
      tools: [
        "Advanced Excel (VBA, macros)",
        "Python",
        "NumPy",
        "Pandas",
        "SQL",
        "Power BI",
        "Qlik Sense",
        "Tableau",
      ],
    }),
    []
  );

  const education = useMemo(
    () => [
      {
        school: "Purdue University, Daniels School of Business",
        degree: "Master of Science in Business Analytics and Information Management",
        dates: "Aug 2025 to Present",
        location: "West Lafayette, IN",
        logo: "brand/purdue.svg",
      },
      {
        school: "Vellore Institute of Technology",
        degree: "Bachelor of Technology in Mechanical Engineering",
        dates: "July 2017",
        location: "Vellore, TN, India",
        logo: "brand/vit.png",
      },
      {
        school: "Ascent Classes",
        degree: "High School",
        dates: "Apr 2011 to Mar 2013",
        location: "India",
        logoChoices: ["brand/ascent.png", "brand/ascent.svg", "brand/ascent.jpg"],
      },
      {
        school: "Krishna Vikash Group of Institutions",
        degree: "Secondary School",
        dates: "Mar 2011 to Mar 2011",
        location: "India",
        logo: "brand/krishna-vikash.png",
      },
    ],
    []
  );

  // Scroll-based background themes. This is the "page changes" effect.
  const THEMES = useMemo(
    () => ({
      top: { a: "rgba(255,255,255,0.10)", b: "rgba(255,255,255,0.06)" },
      highlights: { a: "rgba(120,80,255,0.18)", b: "rgba(0,200,255,0.12)" },
      experience: { a: "rgba(255,120,80,0.16)", b: "rgba(255,255,255,0.06)" },
      projects: { a: "rgba(80,255,170,0.14)", b: "rgba(255,255,255,0.06)" },
      skills: { a: "rgba(255,200,0,0.14)", b: "rgba(255,255,255,0.06)" },
      education: { a: "rgba(0,160,255,0.14)", b: "rgba(255,255,255,0.06)" },
      contact: { a: "rgba(255,80,200,0.14)", b: "rgba(255,255,255,0.06)" },
    }),
    []
  );

  const [activeTheme, setActiveTheme] = useState("top");
  const bg = THEMES[activeTheme] || THEMES.top;

  useEffect(() => {
    const ids = [
      { id: "highlights", key: "highlights" },
      { id: "experience", key: "experience" },
      { id: "projects", key: "projects" },
      { id: "skills", key: "skills" },
      { id: "education", key: "education" },
      { id: "contact", key: "contact" },
    ];

    const els = ids
      .map((s) => ({ ...s, el: document.getElementById(s.id) }))
      .filter((x) => x.el);

    const io = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best) return;

        const match = els.find((x) => x.el === best.target);
        if (match) setActiveTheme(match.key);
      },
      { threshold: [0.22, 0.38, 0.55] }
    );

    els.forEach((x) => io.observe(x.el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        html { scroll-behavior: smooth; }

        .reveal-init { opacity: 0; transform: translateY(12px); }
        .reveal-in { opacity: 1; transform: translateY(0); transition: opacity 650ms ease, transform 650ms ease; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes drift {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(10px,-8px,0); }
          100% { transform: translate3d(0,0,0); }
        }

        @keyframes grainMove {
          0% { transform: translate3d(0,0,0); }
          25% { transform: translate3d(-2%, -3%, 0); }
          50% { transform: translate3d(-4%, 1%, 0); }
          75% { transform: translate3d(3%, 4%, 0); }
          100% { transform: translate3d(0,0,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .reveal-init, .reveal-in { transition: none; transform: none; opacity: 1; }
          [data-animated="true"] { animation: none !important; }
        }
      `}</style>

      {/* scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-white/5">
        <div
          className="h-full bg-white/40"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* dynamic background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `
              radial-gradient(700px 500px at 15% 20%, ${bg.a}, transparent 60%),
              radial-gradient(650px 520px at 85% 30%, ${bg.b}, transparent 60%),
              radial-gradient(900px 650px at 50% 95%, rgba(255,255,255,0.05), transparent 60%)
            `,
          }}
        />

        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          data-animated="true"
          style={{ background: bg.a, animation: "drift 10s ease-in-out infinite" }}
        />
        <div
          className="absolute top-72 right-12 h-72 w-72 rounded-full blur-3xl opacity-25"
          data-animated="true"
          style={{ background: bg.b, animation: "drift 12s ease-in-out infinite" }}
        />

        {/* grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          data-animated="true"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.6%22/></svg>')",
            animation: "grainMove 9s steps(4) infinite",
          }}
        />
      </div>

      {/* navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/60 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-white/5 grid place-items-center">
              <SafeImg
                src={asset(profile.photo)}
                alt={profile.name}
                className="h-full w-full object-cover"
                fallbackText="RP"
              />
            </span>
            <span>{profile.name}</span>
          </a>

          <nav className="hidden sm:flex items-center gap-6">
            <NavLink href="#highlights">Highlights</NavLink>
            <NavLink href="#experience">Experience</NavLink>
            <NavLink href="#projects">Projects</NavLink>
            <NavLink href="#skills">Skills</NavLink>
            <NavLink href="#education">Education</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-sm rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
            >
              LinkedIn
            </a>
            <a
              href="#contact"
              className="text-sm rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/15 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* hero */}
        <section className="pt-14 pb-10">
          <div data-reveal className="reveal-init">
            <p className="text-xs uppercase tracking-widest text-neutral-200/60">
              {profile.objective}
            </p>

            <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              <div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <SafeImg
                      src={asset(profile.photo)}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      fallbackText="RP"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
                      {profile.headline}
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-neutral-200/70">
                  {profile.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#experience"
                    className="rounded-2xl bg-white text-neutral-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                  >
                    View experience
                  </a>
                  <a
                    href="#projects"
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                  >
                    View projects
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {profile.chips.map((x) => (
                    <span
                      key={x}
                      className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200/80"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:block">
                <Card className="overflow-hidden">
                  <div className="p-5">
                    <div className="text-xs text-neutral-200/60">Quick contact</div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-neutral-200/60">Email</div>
                        <div className="mt-1 font-semibold">{profile.email}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-neutral-200/60">Phone</div>
                        <div className="mt-1 font-semibold">{profile.phone}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center overflow-hidden border border-white/10">
                          <SafeImg
                            src={asset("brand/purdue.svg")}
                            alt="Purdue"
                            className="h-full w-full object-contain p-2"
                            fallbackText="PU"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">Purdue MSBAIM</div>
                          <div className="text-xs text-neutral-200/60">
                            Aug 2025 to Present
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* marquee */}
        <div data-reveal className="reveal-init">
          <MarqueeStrip items={marqueeItems} seconds={22} />
        </div>

        {/* sticky highlights */}
        <div id="highlights" data-reveal className="reveal-init">
          <StickyStory
            title="Highlights that shift as you scroll"
            subtitle="Pinned visual on the left, story-driven movement on the right."
            items={highlights}
          />
        </div>

        {/* experience */}
        <Section
          id="experience"
          title="Experience"
          subtitle="Impact across pharma forecasting, analytics, and automation."
        >
          <div className="grid gap-4">
            {experience.map((e) => (
              <Card key={`${e.company}-${e.role}`}>
                <div className="p-5 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-4 sm:w-[300px]">
                    <div className="h-12 w-12 rounded-xl bg-white/10 p-2 grid place-items-center overflow-hidden">
                      <SafeImg
                        src={asset(e.logo)}
                        alt={e.company}
                        className="h-full w-full object-contain"
                        fallbackText={e.company.slice(0, 2).toUpperCase()}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">{e.role}</div>
                      <div className="text-sm text-neutral-200/70">{e.company}</div>
                      <div className="mt-1 text-xs text-neutral-200/60">{e.dates}</div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-2 text-sm text-neutral-200/70">
                      {e.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/40" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* projects */}
        <Section
          id="projects"
          title="Selected work"
          subtitle="Short case-study cards that scan fast."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Card key={p.name}>
                <div className="p-5">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-neutral-200/70">{p.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-200/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* skills */}
        <Section
          id="skills"
          title="Skills"
          subtitle="Skills and tools used for forecasting and analytics delivery."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <div className="p-5">
                <h3 className="font-semibold">Skills</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-200/70">
                  {skills.core.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <h3 className="font-semibold">Tools</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.tools.map((t) => (
                    <span
                      key={t}
                      className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* education */}
        <Section id="education" title="Education">
          <div className="grid gap-4">
            {education.map((ed) => (
              <Card key={ed.school}>
                <div className="p-5 flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 p-2 grid place-items-center overflow-hidden">
                    {ed.logo ? (
                      <SafeImg
                        src={asset(ed.logo)}
                        alt={ed.school}
                        className="h-full w-full object-contain"
                        fallbackText={ed.school.slice(0, 2).toUpperCase()}
                      />
                    ) : (
                      <SmartImg
                        sources={ed.logoChoices}
                        alt={ed.school}
                        className="h-full w-full object-contain"
                        fallbackText={ed.school.slice(0, 2).toUpperCase()}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{ed.school}</h3>
                      <span className="text-xs text-neutral-200/60">{ed.dates}</span>
                    </div>
                    <div className="mt-2 text-sm text-neutral-200/70">{ed.degree}</div>
                    <div className="mt-1 text-xs text-neutral-200/60">{ed.location}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* contact */}
        <Section
          id="contact"
          title="Contact"
          subtitle="Open to 2026 internship and full-time opportunities."
        >
          <Card>
            <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-200/70">
                <div>
                  Email:{" "}
                  <a
                    className="text-neutral-100 underline underline-offset-4 hover:opacity-80"
                    href={`mailto:${profile.email}`}
                  >
                    {profile.email}
                  </a>
                </div>
                <div className="mt-2">
                  Phone: <span className="text-neutral-100">{profile.phone}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  className="text-sm rounded-xl border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  className="text-sm rounded-xl border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15 transition"
                  href={`mailto:${profile.email}`}
                >
                  Email me
                </a>
              </div>
            </div>
          </Card>
        </Section>

        <footer className="py-10 text-xs text-neutral-200/50">
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </main>
    </div>
  );
}
