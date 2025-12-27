import React from "react";

export default function Marquee({
  items = [],
  speedSeconds = 18,
  className = "",
}) {
  const repeated = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-10 py-3"
        style={{
          animation: `marquee ${speedSeconds}s linear infinite`,
        }}
        aria-hidden="true"
      >
        {repeated.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="text-4xl sm:text-5xl font-semibold tracking-tight opacity-80"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
