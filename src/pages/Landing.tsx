import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart, Users, FileText, Calendar, Shield, Activity,
  ArrowRight, Clock, Stethoscope, CheckCircle2, X,
  ClipboardList, Pill, CalendarCheck, Droplets, Lock, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-medical-bg.jpg";

interface FeatureDetail {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  color: string;
  detailIcon: React.ElementType;
  highlights: string[];
  longDescription: string;
}

const Landing = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features: FeatureDetail[] = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records and medical history tracking",
      link: "/patients",
      color: "from-medical-primary to-medical-secondary",
      detailIcon: ClipboardList,
      highlights: [
        "Full demographics & contact info",
        "Medical history timeline",
        "Blood group & emergency contacts",
        "Search & filter patients instantly"
      ],
      longDescription: "Centralize all patient data in one secure location. Track demographics, medical history, allergies, and emergency contacts with a powerful search and filtering system."
    },
    {
      icon: FileText,
      title: "E-Prescriptions",
      description: "Digital prescription management with pharmacy integration",
      link: "/prescriptions",
      color: "from-primary to-warning",
      detailIcon: Pill,
      highlights: [
        "Digital prescription creation",
        "Pharmacist review workflow",
        "Medication substitution tracking",
        "Status tracking (active/completed)"
      ],
      longDescription: "Eliminate paper prescriptions with a seamless digital workflow. Doctors prescribe, pharmacists review and dispense, with full audit trails and medication availability checks."
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Efficient scheduling system for surgeries and consultations",
      link: "/appointments",
      color: "from-medical-secondary to-medical-accent",
      detailIcon: CalendarCheck,
      highlights: [
        "Date & time slot booking",
        "Doctor assignment",
        "Status management & reminders",
        "Surgery & consultation types"
      ],
      longDescription: "Smart scheduling that prevents double-bookings and optimizes doctor availability. Manage consultations, follow-ups, and surgeries with automated status tracking."
    },
    {
      icon: Heart,
      title: "Blood Donations",
      description: "Track and manage blood donation requests and inventory",
      link: "/donations",
      color: "from-destructive to-primary",
      detailIcon: Droplets,
      highlights: [
        "Donor registration & tracking",
        "Blood group inventory management",
        "Donation status workflow",
        "Contact & follow-up management"
      ],
      longDescription: "Life-saving blood donation management. Register donors, track blood group inventory levels, manage donation requests through approval workflows, and ensure supply meets demand."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant data security and privacy protection",
      link: "/settings",
      color: "from-success to-medical-accent",
      detailIcon: Lock,
      highlights: [
        "Role-based access control (RBAC)",
        "Row-level security policies",
        "Encrypted data transmission",
        "Audit trails & activity logs"
      ],
      longDescription: "Enterprise-grade security with role-based access for Admins, Doctors, Nurses, and Pharmacists. Every data access is governed by row-level security policies ensuring complete HIPAA compliance."
    },
    {
      icon: Activity,
      title: "Real-time Updates",
      description: "Live notifications and instant communication between departments",
      link: "/dashboard",
      color: "from-medical-primary to-primary",
      detailIcon: Bell,
      highlights: [
        "Live dashboard statistics",
        "Cross-department notifications",
        "Instant prescription updates",
        "Real-time appointment changes"
      ],
      longDescription: "Stay connected across every department. Real-time data synchronization ensures that prescription updates, appointment changes, and patient admissions are instantly visible to all authorized staff."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Patients Managed" },
    { value: "50+", label: "Hospitals Connected" },
    { value: "99.9%", label: "Uptime Guaranteed" },
    { value: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-medical-secondary bg-clip-text text-transparent">
              MedicalEasy
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#stats" className="text-foreground hover:text-primary transition-colors">About</a>
            <Link to="/login" className="text-foreground hover:text-primary transition-colors">Login</Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden flex gap-2">
            <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
            <Link to="/register"><Button size="sm">Register</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/20 text-foreground mb-6 animate-fade-in">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Trusted by Healthcare Professionals</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-primary via-medical-secondary to-medical-accent bg-clip-text text-transparent">
              Management System
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Connecting hospitals, clinics, and pharmacies with a unified national medical database. 
            Streamline patient care, prescriptions, and medical records.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Floating Stats Bar */}
          <div id="stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section id="features" className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-4xl font-bold mb-4">Everything You Need</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Click any feature to explore what MedicalEasy can do for your facility
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-border/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                  expandedFeature === index ? "ring-2 ring-primary shadow-xl" : ""
                }`}
                onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md`}>
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <ArrowRight className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                      expandedFeature === index ? "rotate-90" : "group-hover:translate-x-1"
                    }`} />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                  
                  {/* Expanded Detail Panel */}
                  <div className={`overflow-hidden transition-all duration-500 ${
                    expandedFeature === index ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}>
                    <div className="border-t border-border pt-4 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">{feature.longDescription}</p>
                      <ul className="space-y-2">
                        {feature.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-muted-foreground">{h}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(feature.link);
                        }}
                      >
                        Explore {feature.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h3 className="text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Register your facility and invite your medical staff with role-based access.", icon: Users },
              { step: "02", title: "Add Patients", desc: "Import or add patient records with complete medical history and demographics.", icon: ClipboardList },
              { step: "03", title: "Start Managing", desc: "Schedule appointments, create prescriptions, and manage donations seamlessly.", icon: Stethoscope }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-medical-secondary/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>
                <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-medical-secondary/10 to-medical-accent/10" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-2xl">
            <CardContent className="p-12 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Join the Future of Healthcare</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-primary to-medical-secondary bg-clip-text text-transparent">
                  Healthcare Facility?
                </span>
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of hospitals and clinics using MedicalEasy to improve patient care, 
                streamline operations, and save lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="shadow-xl hover:shadow-2xl transition-all text-lg px-10 py-6">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-card/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MedicalEasy</span>
          </div>
          <p>&copy; 2024 MedicalEasy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
