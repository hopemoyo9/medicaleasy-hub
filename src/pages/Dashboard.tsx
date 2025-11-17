import { Users, FileText, Calendar, Heart, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Patients",
      value: "1,284",
      change: "+12.5%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Prescriptions",
      value: "856",
      change: "+8.2%",
      icon: FileText,
      color: "text-medical-secondary"
    },
    {
      title: "Appointments",
      value: "142",
      change: "+23.1%",
      icon: Calendar,
      color: "text-medical-accent"
    },
    {
      title: "Blood Donations",
      value: "48",
      change: "+5.4%",
      icon: Heart,
      color: "text-destructive"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Add New Patient</p>
                  <p className="text-xs text-muted-foreground">Register a new patient record</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Create Prescription</p>
                  <p className="text-xs text-muted-foreground">Issue a new prescription</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Schedule Appointment</p>
                  <p className="text-xs text-muted-foreground">Book patient appointment</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
