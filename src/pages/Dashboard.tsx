import { Users, FileText, Calendar, Heart, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: "Total Patients",
      value: "1,284",
      change: "+12.5%",
      icon: Users,
      color: "text-primary",
      route: "/patients"
    },
    {
      title: "Prescriptions",
      value: "856",
      change: "+8.2%",
      icon: FileText,
      color: "text-medical-secondary",
      route: "/prescriptions"
    },
    {
      title: "Appointments",
      value: "142",
      change: "+23.1%",
      icon: Calendar,
      color: "text-medical-accent",
      route: "/appointments"
    },
    {
      title: "Blood Donations",
      value: "48",
      change: "+5.4%",
      icon: Heart,
      color: "text-destructive",
      route: "/donations"
    }
  ];

  const recentActivity = [
    { patient: "Sarah Johnson", action: "New appointment scheduled", time: "5 min ago" },
    { patient: "Michael Chen", action: "Prescription issued", time: "15 min ago" },
    { patient: "Emily Davis", action: "Lab results uploaded", time: "32 min ago" },
    { patient: "David Wilson", action: "Surgery scheduled", time: "1 hour ago" },
    { patient: "Lisa Anderson", action: "Follow-up completed", time: "2 hours ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border-l-4 border-l-medical-primary bg-gradient-to-br from-card to-accent/5 cursor-pointer" onClick={() => navigate(stat.route)}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-medical-primary/10 to-medical-secondary/10 flex items-center justify-center">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm text-success font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-t-4 border-t-medical-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest patient interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 hover:bg-accent/50 p-2 rounded-lg transition-colors">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-medical-primary/20 to-medical-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-medical-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-medical-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start hover:border-medical-primary hover:bg-medical-primary/5"
                onClick={() => navigate('/patients')}
              >
                <Users className="h-6 w-6 text-medical-primary mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-base">Add New Patient</p>
                  <p className="text-xs text-muted-foreground">Register a new patient record</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-medical-primary" />
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start hover:border-medical-secondary hover:bg-medical-secondary/5"
                onClick={() => navigate('/prescriptions')}
              >
                <FileText className="h-6 w-6 text-medical-secondary mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-base">Create Prescription</p>
                  <p className="text-xs text-muted-foreground">Issue a new prescription</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-medical-secondary" />
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start hover:border-medical-accent hover:bg-medical-accent/5"
                onClick={() => navigate('/appointments')}
              >
                <Calendar className="h-6 w-6 text-medical-accent mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-base">Schedule Appointment</p>
                  <p className="text-xs text-muted-foreground">Book patient appointment</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-medical-accent" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
