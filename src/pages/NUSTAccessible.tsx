import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  Headphones,
  HeartHandshake,
  Menu,
  MonitorSmartphone,
  School,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NUSTAccessible = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const storedContrast = window.localStorage.getItem("nust-high-contrast") === "true";
    const storedLargeText = window.localStorage.getItem("nust-large-text") === "true";
    const storedReducedMotion = window.localStorage.getItem("nust-reduced-motion") === "true";

    setHighContrast(storedContrast);
    setLargeText(storedLargeText);
    setReducedMotion(storedReducedMotion);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("accessibility-high-contrast", highContrast);
    document.body.classList.toggle("accessibility-large-text", largeText);
    document.body.classList.toggle("accessibility-reduced-motion", reducedMotion);

    window.localStorage.setItem("nust-high-contrast", String(highContrast));
    window.localStorage.setItem("nust-large-text", String(largeText));
    window.localStorage.setItem("nust-reduced-motion", String(reducedMotion));
  }, [highContrast, largeText, reducedMotion]);

  const quickLinks = [
    {
      title: "Apply now",
      description: "Start your journey with easy-to-follow admissions guidance.",
      href: "/register",
      icon: School,
    },
    {
      title: "Student support",
      description: "Get help with disability support, counselling, and learning accommodations.",
      href: "/login",
      icon: HeartHandshake,
    },
    {
      title: "Accessibility tools",
      description: "Use screen-reader-ready navigation and comfort settings on every page.",
      href: "#accessibility",
      icon: Accessibility,
    },
  ];

  const services = [
    "Screen-reader friendly navigation and clear headings",
    "Keyboard-only access for menus, forms, and actions",
    "Captioned announcements and plain-language content",
    "Mobility support, quiet spaces, and accessible transport guidance",
    "Sign language interpretation and speech-to-text support on request",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to main content
      </a>

      <header className="border-b border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">NUST Access Hub</p>
              <p className="text-sm text-muted-foreground">Inclusive learning for every student</p>
            </div>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium transition-colors hover:text-primary">
              Services
            </a>
            <a href="#accessibility" className="text-sm font-medium transition-colors hover:text-primary">
              Accessibility
            </a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </a>
            <Link to="/login" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              Student login
            </Link>
          </nav>

          <Button variant="outline" className="md:hidden" aria-label="Open navigation menu">
            <Menu className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-medical-accent/20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Designed for equitable access, clarity, and dignity
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                A NUST campus experience that works for every ability.
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                From admission to graduation, this website is built to be easy to use with keyboards, screen readers, magnification, and assistive technology. Every section uses plain language and clear actions.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#accessibility">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View accessibility tools
                  </Button>
                </a>
              </div>
            </div>

            <Card className="border-primary/20 bg-card/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Accessibility features at a glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="font-semibold">Keyboard-friendly navigation</p>
                  <p className="text-sm text-muted-foreground">Every action can be reached without a mouse.</p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="font-semibold">High contrast and large text</p>
                  <p className="text-sm text-muted-foreground">Adjust comfort settings instantly from the toolbar.</p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="font-semibold">Inclusive support services</p>
                  <p className="text-sm text-muted-foreground">Support is available for visual, hearing, motor, and cognitive access needs.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="quick-links-title">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Start here</p>
            <h2 id="quick-links-title" className="mt-2 text-3xl font-semibold sm:text-4xl">
              Helpful next steps for students and visitors
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="h-full border-border/70">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <a href={item.href} className="mt-4 inline-flex items-center gap-2 font-medium text-primary hover:underline">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="services" className="border-y border-border/70 bg-muted/20 py-16" aria-labelledby="services-title">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Inclusive services</p>
              <h2 id="services-title" className="mt-2 text-3xl font-semibold sm:text-4xl">
                Support built around real student needs
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The campus experience should never depend on how a person communicates, moves, or processes information. We make access part of the design.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: MonitorSmartphone, title: "Digital accessibility", text: "Responsive layouts, readable contrast, and easy-to-scan content." },
                { icon: Accessibility, title: "Physical access", text: "Accessible routes, ramps, seating, and campus wayfinding support." },
                { icon: Headphones, title: "Hearing support", text: "Audio alternatives, captioned events, and assistive listening guidance." },
                { icon: BookOpen, title: "Learning support", text: "Accessible course materials and flexible support for study success." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-border bg-background p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="accessibility" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="accessibility-title">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Custom comfort settings</p>
                <h2 id="accessibility-title" className="mt-2 text-3xl font-semibold sm:text-4xl">
                  Make the site easier to read and use
                </h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  Switch on high contrast, larger text, or reduced motion whenever you need a calmer, clearer experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={highContrast ? "default" : "outline"}
                  aria-pressed={highContrast}
                  onClick={() => setHighContrast((value) => !value)}
                >
                  {highContrast ? "High contrast on" : "High contrast"}
                </Button>
                <Button
                  type="button"
                  variant={largeText ? "default" : "outline"}
                  aria-pressed={largeText}
                  onClick={() => setLargeText((value) => !value)}
                >
                  {largeText ? "Large text on" : "Large text"}
                </Button>
                <Button
                  type="button"
                  variant={reducedMotion ? "default" : "outline"}
                  aria-pressed={reducedMotion}
                  onClick={() => setReducedMotion((value) => !value)}
                >
                  {reducedMotion ? "Reduced motion on" : "Reduced motion"}
                </Button>
              </div>
            </div>

            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <li key={service} className="flex gap-3 rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border/70 bg-card/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            NUST Accessibility Office • access@nuxt.example • +27 11 234 5678
          </p>
          <p>We welcome feedback and accommodation requests at any time.</p>
        </div>
      </footer>
    </div>
  );
};

export default NUSTAccessible;
