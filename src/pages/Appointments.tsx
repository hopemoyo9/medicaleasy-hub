import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const timeSlots = [
    { time: "09:00 AM", available: true },
    { time: "09:30 AM", available: true },
    { time: "10:00 AM", available: false },
    { time: "10:30 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "11:30 AM", available: false },
    { time: "12:00 PM", available: true },
    { time: "02:00 PM", available: true },
    { time: "02:30 PM", available: true },
    { time: "03:00 PM", available: false },
    { time: "03:30 PM", available: true },
    { time: "04:00 PM", available: true },
  ];

  const upcomingAppointments = [
    { id: 1, patient: "Sarah Johnson", time: "10:00 AM", type: "Consultation", doctor: "Dr. Smith" },
    { id: 2, patient: "Michael Chen", time: "11:30 AM", type: "Surgery", doctor: "Dr. Williams" },
    { id: 3, patient: "Emily Davis", time: "03:00 PM", type: "Follow-up", doctor: "Dr. Brown" },
  ];

  const handleBookSlot = (time: string) => {
    if (selectedDate) {
      toast.success(`Appointment booked for ${format(selectedDate, "PPP")} at ${time}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Book consultations and surgeries</p>
        </div>
        <Button variant="medical">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-medical-primary" />
              Select Date
            </CardTitle>
            <CardDescription>Choose a date to view available time slots</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm"
            />
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-medical-primary" />
              Today's Appointments
            </CardTitle>
            <CardDescription>{format(new Date(), "PPP")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-lg bg-gradient-to-br from-medical-primary/5 to-medical-secondary/5 border border-medical-primary/20 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-medical-primary" />
                    <span className="font-medium text-sm">{apt.patient}</span>
                  </div>
                  <Badge className="bg-medical-primary/10 text-medical-primary border-medical-primary/20">
                    {apt.time}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                <p className="text-xs text-muted-foreground">{apt.type}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <CardDescription>
              {format(selectedDate, "PPPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot, idx) => (
                <Button
                  key={idx}
                  variant={slot.available ? "outline" : "ghost"}
                  disabled={!slot.available}
                  onClick={() => handleBookSlot(slot.time)}
                  className={`h-auto py-4 flex flex-col items-center gap-2 ${
                    slot.available
                      ? "border-medical-primary/30 hover:bg-medical-primary hover:text-white hover:border-medical-primary"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{slot.time}</span>
                  {!slot.available && (
                    <Badge variant="destructive" className="text-xs">Booked</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments;
