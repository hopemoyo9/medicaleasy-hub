import { Link, useNavigate } from "react-router-dom";
import { Heart, Users, FileText, Calendar, Shield, Activity, ArrowRight, Clock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records and medical history tracking"
    },
    {
      icon: FileText,
      title: "E-Prescriptions",
      description: "Digital prescription management with pharmacy integration"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Efficient scheduling system for surgeries and consultations"
    },
    {
      icon: Heart,
      title: "Blood Donations",
      description: "Track and manage blood donation requests and inventory"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant data security and privacy protection"
    },
    {
      icon: Activity,
      title: "Real-time Updates",
      description: "Live notifications and instant communication between departments"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-medical-secondary bg-clip-text text-transparent">
              MedicalEasy
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/login" className="text-foreground hover:text-primary transition-colors">Login</Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground mb-6 animate-fade-in">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Trusted by Healthcare Professionals</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-primary to-medical-secondary bg-clip-text text-transparent">
              Management System
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connecting hospitals, clinics, and pharmacies with a unified national medical database. 
            Streamline patient care, prescriptions, and medical records.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Everything You Need</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete healthcare management solution designed for modern medical facilities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 via-medical-secondary/10 to-medical-accent/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare Facility?</h3>
              <p className="text-muted-foreground mb-8">
                Join hundreds of hospitals and clinics using MedicalEasy to improve patient care
              </p>
              <Link to="/register">
                <Button size="lg" className="shadow-lg">
                  Get Started Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MedicalEasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
