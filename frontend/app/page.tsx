"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, AtSign, Check, Code2, Database, Download, Globe2, MapPin, Menu, Send, Server, Terminal, X } from "lucide-react";

const experience = [
  { date: "AUG 2026 — PRESENT", company: "SM Marains Advances Gear Boxs India Private Limited", role: "Software Developer", details: ["Develop and maintain the SML Oil Care marine engine service-management platform.", "Build REST APIs with Python, FastAPI, SQLAlchemy and PostgreSQL.", "Implement role-based dashboards, service requests, technician assignment and tracking.", "Contribute to feature enhancements, database operations, debugging and system testing."] },
  { date: "OCT 2025 — JUL 2026", company: "Techneat Info Solutions", role: "Java Development Trainee", details: ["Develop backend features using Core Java, Spring Boot, JDBC and object-oriented principles.", "Build RESTful APIs and CRUD operations with Controller–Service–Repository architecture.", "Use Spring Data JPA and Hibernate with MySQL; test endpoints in Postman.", "Contribute to the Employee Timesheet Management System, debugging, validation and technical documentation."] },
];
const skillGroups = [
  { title: "Programming", items: ["Java", "Python", "SQL"], icon: Terminal },
  { title: "Backend", items: ["Spring Boot", "Spring Data JPA", "Hibernate", "JDBC", "RESTful APIs", "CRUD operations", "Layered architecture"], icon: Server },
  { title: "Databases", items: ["MySQL", "PostgreSQL"], icon: Database },
  { title: "Web", items: ["HTML", "CSS"], icon: Globe2 },
  { title: "Tools", items: ["Git", "GitHub", "Postman", "IntelliJ IDEA", "Eclipse", "Visual Studio Code"], icon: Code2 },
];
const services = ["Role-based service workflows", "Service tracking & technician assignment", "Invoice OCR & duplicate detection", "OTP authentication & password recovery", "In-app, browser push & SMS reminders"];
const timesheets = ["Timesheet creation & updates", "Approval and retrieval workflows", "Spring Boot layered architecture", "Input validation & exception handling", "MySQL persistence with Spring Data JPA"];
const marineTech = ["Next.js 14", "React", "TypeScript", "Tailwind CSS", "Python", "FastAPI", "SQLAlchemy 2", "PostgreSQL", "Docker", "GitLab"];
const timesheetTech = ["Java", "Spring Boot", "Spring Data JPA", "Hibernate", "MySQL", "REST APIs", "Postman", "Git"];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.14 }} transition={{ duration: reduce ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function TiltCard({ children, className, delay = 0, reducedMotion }: { children: React.ReactNode; className: string; delay?: number; reducedMotion: boolean | null }) {
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--card-x", `${(-y * 3).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--card-y", `${(x * 4).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--card-light-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--card-light-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const resetPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--card-x", "0deg");
    event.currentTarget.style.setProperty("--card-y", "0deg");
    event.currentTarget.style.setProperty("--card-light-x", "50%");
    event.currentTarget.style.setProperty("--card-light-y", "50%");
  };
  return <Reveal className="project-reveal" delay={delay}><div className={`project-card ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>{children}</div></Reveal>;
}

function MagneticLink({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const reduceMotion = useReducedMotion();
  const onMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    event.currentTarget.style.transform = `translate(${(dx * .07).toFixed(1)}px, ${(dy * .1).toFixed(1)}px)`;
  };
  const onLeave = (event: React.PointerEvent<HTMLAnchorElement>) => { event.currentTarget.style.transform = "translate(0, 0)"; };
  return <a className={className} href={href} onPointerMove={onMove} onPointerLeave={onLeave}>{children}</a>;
}

function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("loading"); setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) { setState("success"); setMessage("Thanks for reaching out. Your message has been received."); form.reset(); return; }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Please check your details and try again.");
      setState("success");
      setMessage(result.email_sent ? "Your message was saved and an email notification was sent." : "Your message was saved, but the email notification could not be sent. Please email me directly if your message is urgent.");
      form.reset();
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "We couldn't send your message. Please email me directly."); }
  };
  return <form className="contact-form" onSubmit={submit}>
    <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={100} placeholder="Jane Smith" required /></label><label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} placeholder="jane@company.com" required /></label></div>
    <label>Subject<input name="subject" minLength={3} maxLength={150} placeholder="Let's talk about a role" required /></label>
    <label>Message<textarea name="message" minLength={10} maxLength={5000} rows={4} placeholder="A little about what you have in mind…" required /></label>
    <div className="form-bottom"><button type="submit" className="button button-primary" disabled={state === "loading"}>{state === "loading" ? "Sending…" : state === "success" ? <><Check size={16} /> Message received</> : <>Send message <ArrowUpRight size={16} /></>}</button><p className={`form-status ${state}`} aria-live="polite">{message}</p></div>
  </form>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const artRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const links = ["About", "Skills", "Projects", "Experience", "Education", "Contact"];
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }); }, { rootMargin: "-30% 0px -58% 0px" });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const closeMenu = () => setMenuOpen(false);
  const handleArtPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--pointer-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const handleArtPointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--pointer-x", "50%");
    event.currentTarget.style.setProperty("--pointer-y", "50%");
  };

  return <>
    <header className="site-header"><nav className="nav-shell" aria-label="Main navigation"><a href="#home" className="wordmark" onClick={closeMenu}><span className="wordmark-monogram">N<span>R</span></span><span className="wordmark-name">Nithyasree A R<small>Software Developer</small></span></a><button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button><div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>{links.map((name) => <a key={name} onClick={closeMenu} aria-current={active === name.toLowerCase() ? "location" : undefined} href={`#${name.toLowerCase()}`}>{name}</a>)}</div><a href="/documents/Nithyasree_AR_Resume.pdf" download="Nithyasree_AR_Resume.pdf" className="nav-cta"><Download size={16} /> Download Resume</a></nav></header>
    <main>
      <section id="home" className="hero page-wrap"><div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> AVAILABLE FOR OPPORTUNITIES <span className="eyebrow-rule" /></div><motion.p className="hero-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .12 }}>Hi, I’m Nithyasree</motion.p><motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .7, ease: [.22, 1, .36, 1] }}>I build<br /><span className="hero-highlight">thoughtful</span><br />digital experiences<span className="hero-period">.</span></motion.h1><motion.div className="hero-role" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .45 }}><span /> Nithyasree A R <span className="role-divider">/</span> Software Developer</motion.div><motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .52 }}>A Software Developer focused on Java, Spring Boot, Python, and building reliable full-stack applications.</motion.p><motion.div className="hero-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }}><MagneticLink className="button button-primary" href="#projects">View my work <ArrowRight size={17} /></MagneticLink><MagneticLink className="button button-quiet" href="#contact">Get in touch <Send size={16} /></MagneticLink></motion.div><div className="hero-social"><a href="mailto:nithyasree2904@gmail.com"><AtSign size={15} /> nithyasree2904@gmail.com <ArrowUpRight size={12} /></a><span className="hero-social-line" /></div></div>
        <motion.div className="hero-art" initial={{ opacity: 0, scale: .975 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .85, delay: .25, ease: [.22, 1, .36, 1] }}><div ref={artRef} onPointerMove={handleArtPointerMove} onPointerLeave={handleArtPointerLeave} className="portrait-scene"><div className="portrait-orbit orbit-one" /><div className="portrait-orbit orbit-two" /><span className="portrait-coordinate coord-top">JAVA · SPRING · PYTHON</span><span className="portrait-coordinate coord-side">CODE<br />CREATE<br />IMPROVE</span><div className="portrait-frame"><Image src="/images/nithyasree-ar.png" alt="Nithyasree A R, Software Developer" fill priority sizes="(max-width: 760px) 85vw, 40vw" className="portrait-image" /></div><div className="portrait-note"><span className="note-marker" /><span>SOFTWARE DEVELOPER<small>Java · Spring Boot · Python</small></span><Code2 size={19} /></div><div className="portrait-index">NR <span>·</span> 01</div><div className="art-grid" /><div className="pointer-glow" aria-hidden="true" /></div></motion.div>
      <a className="scroll-cue" href="#about"><span className="scroll-line" /><span>SCROLL</span><ArrowDown size={13} /><span className="scroll-line" /></a>
      </section>

      <div className="ticker" aria-label="Java, Spring Boot, Python, FastAPI, PostgreSQL"><div className="ticker-track">{Array.from({ length: 2 }, (_, i) => <div className="ticker-run" key={i}><span>JAVA</span><i /> <span>SPRING BOOT</span><i /> <span>PYTHON</span><i /> <span>FASTAPI</span><i /> <span>POSTGRESQL</span><i /> <span>REST APIS</span><i /></div>)}</div></div>

      <section id="about" className="section about-section page-wrap"><Reveal className="section-kicker"><span>01</span> A LITTLE ABOUT ME</Reveal><div className="about-grid"><Reveal><h2 className="section-heading">Turning ideas<br />into <span className="serif-accent">functional</span><br />solutions<span className="heading-period">.</span></h2></Reveal><Reveal className="about-copy" delay={.12}><p className="body-lead">I’m a Software Developer with a foundation in Java, Spring Boot, REST APIs, SQL, and backend application development.</p><p>I have hands-on experience building CRUD features, layered backend services, and database integrations, with additional project experience in Python, FastAPI, and PostgreSQL. I enjoy solving problems, debugging applications, and writing maintainable code.</p><a className="text-link" href="#experience">A little more about my work <ArrowDownRight size={16} /></a><div className="about-location"><MapPin size={17} /><span>BASED IN<small>Nagercoil, Tamil Nadu</small></span></div></Reveal></div><div className="about-divider"><span>JAVA BACKEND</span><span className="divider-line" /><span>FULL-STACK CURIOSITY</span><span className="divider-line" /><span>THOUGHTFUL CODE</span></div></section>

      <section id="skills" className="section skills-section"><div className="page-wrap"><Reveal className="section-kicker"><span>02</span> TOOLS OF THE TRADE</Reveal><div className="section-title-row"><Reveal><h2 className="section-heading">Built on a <span className="serif-accent">solid</span><br />foundation<span className="heading-period">.</span></h2></Reveal><Reveal className="section-aside" delay={.1}><p>Technologies I’ve used to build, connect, and ship working software.</p></Reveal></div><div className="skills-grid">{skillGroups.map(({ title, items, icon: Icon }, i) => <Reveal className="skill-group" key={title} delay={i * .055}><div className="skill-group-top"><Icon size={19} strokeWidth={1.45} /><span>0{i + 1}</span></div><h3>{title}</h3><div className="skill-tags">{items.map((skill) => <span key={skill}>{skill}</span>)}</div></Reveal>)}</div><div className="skills-foot"><div className="skills-foot-left"><span className="signal-dot" /> CURRENT FOCUS <span className="focus-text">Java &amp; Spring Boot</span></div><span>Practical experience, always learning.</span></div></div></section>

      <section id="projects" className="section projects-section page-wrap"><Reveal className="section-kicker"><span>03</span> SELECTED WORK</Reveal><div className="section-title-row"><Reveal><h2 className="section-heading">Made to solve<br /><span className="serif-accent">real problems</span><span className="heading-period">.</span></h2></Reveal><Reveal className="section-aside" delay={.12}><p>A look at systems I’ve helped build, from service workflows to reliable backend APIs.</p></Reveal></div>
        <TiltCard className="project-card marine-card" reducedMotion={reduceMotion}><div className="project-visual marine-visual"><div className="marine-topline"><span>FIELD SYSTEM / 01</span><span>OIL CARE<span className="visual-orange">.</span></span></div><div className="marine-water"><div className="waterline waterline-one" /><div className="waterline waterline-two" /><div className="waterline waterline-three" /><div className="ship"><div className="ship-stack" /><div className="ship-deck" /><div className="ship-hull" /></div><span className="water-coordinate">SERVICE / 08°09′ N</span></div><div className="marine-bottomline"><span>MARINE ENGINE SERVICE PLATFORM</span><span>01 — 02</span></div><div className="visual-index">A</div></div><div className="project-content"><div className="project-meta"><span className="project-number">01 / FEATURED PROJECT</span><span className="project-category"><span /> FULL-STACK PLATFORM</span></div><h3>SML Oil Care<span className="heading-period">.</span></h3><p className="project-subtitle">Marine Engine Service Management System</p><p className="project-description">A full-stack platform that coordinates marine engine oil services across customers, technicians, mechanics, toll operators, zonal managers, and administrators.</p><div className="project-details"><div className="detail-block"><h4>WHAT IT DOES</h4><ul>{services.map((s) => <li key={s}><span />{s}</li>)}</ul></div><div className="detail-block"><h4>HOW IT’S BUILT</h4><p className="architecture-copy">Role-based workflows connect service requests to API-driven backend services, SQL data, OCR verification, and timely customer reminders.</p></div></div><div className="tech-list">{marineTech.map((s) => <span key={s}>{s}</span>)}</div><div className="project-card-footer"><a href="#contact" aria-label="Ask about the SML Oil Care project">Ask about this project <ArrowUpRight size={13} /></a><span>INTERNAL PROJECT <span className="private-indicator" /></span></div></div></TiltCard>
        <TiltCard className="project-card timesheet-card" delay={.08} reducedMotion={reduceMotion}><div className="project-content"><div className="project-meta"><span className="project-number">02 / BACKEND PROJECT</span><span className="project-category"><span /> JAVA APPLICATION</span></div><h3>Employee Timesheet<br />Management System<span className="heading-period">.</span></h3><p className="project-description">A Java backend application for recording and managing employee work hours, built with a structured service layer and MySQL persistence.</p><div className="detail-block timesheet-features"><h4>CORE WORKFLOWS</h4><ul>{timesheets.map((s) => <li key={s}><span />{s}</li>)}</ul></div><div className="tech-list">{timesheetTech.map((s) => <span key={s}>{s}</span>)}</div><div className="project-card-footer"><a href="#contact" aria-label="Ask about the Employee Timesheet project">Ask about this project <ArrowUpRight size={13} /></a><span>INTERNAL PROJECT <span className="private-indicator" /></span></div></div><div className="project-visual timesheet-visual"><div className="timesheet-topline"><span>BACKEND / 02</span><Terminal size={16} /></div><div className="code-window"><div className="code-window-top"><span /><span /><span /><small>TimesheetService.java</small></div><div className="code-lines"><div><span>01</span><i>public class</i> <b>TimesheetService</b> &#123;</div><div><span>02</span>　 <i>public</i> Timesheet <em>create</em>(Request r) &#123;</div><div><span>03</span>　　 validator.<em>check</em>(r);</div><div><span>04</span>　　 repository.<em>save</em>(r);</div><div><span>05</span>　　 <i>return</i> Timesheet.<b>from</b>(r);</div><div><span>06</span>　 &#125;</div><div><span>07</span>&#125;</div></div><div className="code-cursor" /></div><div className="timesheet-base"><span>CONTROLLER <b>→</b> SERVICE <b>→</b> REPOSITORY</span><span>SPRING BOOT / MYSQL</span></div><div className="visual-index">B</div></div></TiltCard>
      </section>

      <section id="experience" className="section experience-section"><div className="page-wrap"><Reveal className="section-kicker"><span>04</span> THE PATH SO FAR</Reveal><div className="section-title-row"><Reveal><h2 className="section-heading">Learning by<br /><span className="serif-accent">building</span><span className="heading-period">.</span></h2></Reveal><Reveal className="section-aside" delay={.1}><p>Growing through hands-on product work and a strong backend foundation.</p></Reveal></div><div className="experience-list">{experience.map((job, i) => <Reveal className="experience-item" key={job.company} delay={i * .08}><div className="experience-rail"><span>0{i + 1}</span><div className="rail-line"><i /></div></div><div className="experience-main"><div className="experience-heading"><div><span className="experience-date">{job.date}</span><h3>{job.role}</h3><p>{job.company}</p></div><ArrowUpRight className="experience-arrow" size={19} /></div><ul className="experience-details">{job.details.map((d) => <li key={d}>{d}</li>)}</ul></div></Reveal>)}</div></div></section>

      <section id="education" className="section education-section page-wrap"><Reveal className="section-kicker"><span>05</span> THE FOUNDATION</Reveal><div className="section-title-row"><Reveal><h2 className="section-heading">Curiosity has<br /><span className="serif-accent">a classroom</span><span className="heading-period">.</span></h2></Reveal><Reveal className="section-aside" delay={.1}><p>Computer science foundations, built one year at a time.</p></Reveal></div><div className="education-grid"><Reveal className="education-card"><div className="education-card-top"><span>2022 — 2026</span><span>01 / 02</span></div><div className="edu-monogram">B<span>.</span>E</div><div className="education-info"><span className="edu-level">BACHELOR OF ENGINEERING</span><h3>Computer Science<br />&amp; Engineering</h3><p>Amrita College of Engineering and Technology</p></div><div className="education-result"><span>RESULT AS LISTED</span><strong>7.88</strong></div></Reveal><Reveal className="education-card education-card-secondary" delay={.1}><div className="education-card-top"><span>2021 — 2022</span><span>02 / 02</span></div><div className="edu-monogram edu-hsc">H<span>.</span>S</div><div className="education-info"><span className="edu-level">HIGHER SECONDARY CERTIFICATE</span><h3>Higher<br />Secondary</h3><p>Duthie Higher Secondary School for Girls</p></div><div className="education-result"><span>RESULT AS LISTED</span><strong>67<span className="result-unit">%</span></strong></div></Reveal></div><div className="languages-row"><div className="language-heading"><span>ALSO SPOKEN</span><span className="signal-dot" /></div><div className="language-item"><span>EN</span> English <ArrowUpRight size={13} /></div><div className="language-item"><span>TA</span> Tamil <ArrowUpRight size={13} /></div></div></section>

      <section id="contact" className="section contact-section"><div className="page-wrap"><Reveal className="section-kicker"><span>06</span> YOUR NEXT MOVE</Reveal><div className="contact-grid"><Reveal className="contact-intro"><h2 className="section-heading">Good work<br />starts with<br /><span className="serif-accent">a hello</span><span className="contact-spark">✳</span></h2><p>Have a role, a project, or an interesting problem to solve? I’d love to hear about it.</p><div className="contact-links"><a href="mailto:nithyasree2904@gmail.com"><span className="contact-link-icon"><AtSign size={17} /></span><span>EMAIL ME<small>nithyasree2904@gmail.com</small></span><ArrowUpRight size={15} /></a><a href="tel:+916383544458"><span className="contact-link-icon"><Send size={16} /></span><span>CALL ME<small>+91 63835 44458</small></span><ArrowUpRight size={15} /></a><div className="contact-place"><MapPin size={17} /><span>BASED IN<small>Nagercoil, Tamil Nadu</small></span></div></div></Reveal><Reveal className="contact-form-wrap" delay={.1}><div className="form-heading"><div><span>CONTACT FORM</span><h3>Start a conversation.</h3></div><div className="form-index">GET<br />IN<br />TOUCH<span>.</span></div></div><ContactForm /><div className="form-footnote"><span className="signal-dot" />Your details are only used to respond to your message.</div></Reveal></div></div></section>
    </main>
    <footer className="site-footer"><div className="page-wrap footer-top"><a href="#home" className="wordmark footer-wordmark"><span className="wordmark-monogram">N<span>R</span></span><span className="wordmark-name">Nithyasree A R<small>Software Developer</small></span></a><p>Built with care, curiosity,<br />and good coffee<span className="footer-spark">✳</span></p><a className="back-top" href="#home">BACK TO THE TOP <ArrowUpRight size={14} /></a></div><div className="page-wrap footer-bottom"><span>© {new Date().getFullYear()} Nithyasree A R</span><span>NAGERCOIL, TAMIL NADU</span><a href="mailto:nithyasree2904@gmail.com">SAY HELLO <ArrowUpRight size={12} /></a></div></footer>
  </>;
}
