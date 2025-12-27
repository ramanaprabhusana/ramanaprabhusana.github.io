import { profile } from "./data/profile.js";

const Section = ({ id, title, children }) => (
  <section id={id} className="mx-auto max-w-6xl px-5 py-10">
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
    {children}
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
    {children}
  </span>
);

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#home" className="font-semibold">
            {profile.name}
          </a>

          <nav className="hidden gap-5 text-sm text-neutral-300 md:flex">
            <a className="hover:text-white" href="#about">
              About
            </a>
            <a className="hover:text-white" href="#experience">
              Experience
            </a>
            <a className="hover:text-white" href="#projects">
              Projects
            </a>
            <a className="hover:text-white" href="#skills">
              Skills
            </a>
            <a className="hover:text-white" href="#contact">
              Contact
            </a>
          </nav>

          <a
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-100"
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            View Resume
          </a>
        </div>
      </header>

      <main className="pt-16">
        <section id="home" className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-center">
            <Card>
              <p className="text-neutral-300">Hi, I am</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-4 text-neutral-200">{profile.headline}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-100"
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume
                </a>

                <a
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>

                <a
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  href={`mailto:${profile.email}`}
                >
                  Email
                </a>
              </div>
            </Card>

            <Card>
              <div className="text-sm text-neutral-300">Location</div>
              <div className="mt-1">{profile.location}</div>

              <div className="mt-4 text-sm text-neutral-300">Email</div>
              <a
                className="mt-1 block underline hover:text-white"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>

              <div className="mt-4 text-sm text-neutral-300">LinkedIn</div>
              <a
                className="mt-1 block underline hover:text-white"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                {profile.linkedin.replace("https://", "")}
              </a>
            </Card>
          </div>
        </section>

        <Section id="about" title="About">
          <Card>
            <p className="text-neutral-200">{profile.about}</p>
          </Card>
        </Section>

        <Section id="experience" title="Experience">
          <div className="space-y-4">
            {profile.experience.map((e) => (
              <Card key={`${e.company}-${e.role}-${e.dates}`}>
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="text-lg font-semibold">
                    {e.company} . {e.role}
                  </div>
                  <div className="text-sm text-neutral-400">{e.dates}</div>
                </div>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-200">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="projects" title="Projects">
          <div className="grid gap-4 md:grid-cols-2">
            {profile.projects.map((p) => (
              <Card key={p.name}>
                <div className="text-lg font-semibold">{p.name}</div>
                <p className="mt-2 text-neutral-200">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="skills" title="Skills">
          <Card>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </Card>
        </Section>

        <Section id="contact" title="Contact">
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-neutral-400">Email</div>
                <a
                  className="underline hover:text-white"
                  href={`mailto:${profile.email}`}
                >
                  {profile.email}
                </a>
              </div>
              <div>
                <div className="text-sm text-neutral-400">LinkedIn</div>
                <a
                  className="underline hover:text-white"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.linkedin.replace("https://", "")}
                </a>
              </div>
            </div>
          </Card>
        </Section>

        <footer className="border-t border-white/10 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-neutral-400 md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} {profile.name}
            </div>
            <div className="flex gap-4">
              <a
                className="hover:text-white"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a className="hover:text-white" href={`mailto:${profile.email}`}>
                Email
              </a>
              <a
                className="hover:text-white"
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Resume
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
