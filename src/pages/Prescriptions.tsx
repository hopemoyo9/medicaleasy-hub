import { FileText, Plus, Search, Calendar, User, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddPrescriptionDialog } from "@/components/AddPrescriptionDialog";

const Prescriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const prescriptions = [
    { id: "RX001", patient: "Sarah Johnson", medication: "Lisinopril 10mg", dosage: "Once daily", date: "2024-01-15", status: "Filled", doctor: "Dr. Smith" },
    { id: "RX002", patient: "Michael Chen", medication: "Metformin 500mg", dosage: "Twice daily", date: "2024-01-18", status: "Pending", doctor: "Dr. Johnson" },
    { id: "RX003", patient: "Emily Davis", medication: "Ibuprofen 400mg", dosage: "As needed", date: "2024-01-10", status: "Filled", doctor: "Dr. Williams" },
  ];

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.medication.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-medical-secondary to-medical-accent bg-clip-text text-transparent">Prescriptions</h1>
          <p className="text-muted-foreground text-lg">Manage and track patient prescriptions</p>
        </div>
        <AddPrescriptionDialog />
      </div>

      <Card className="shadow-lg border-t-4 border-t-medical-secondary">
        <CardHeader>
          <CardTitle className="text-xl">Search Prescriptions</CardTitle>
          <CardDescription>Find prescriptions by patient, ID, or medication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-medical-secondary" />
            <Input 
              placeholder="Search prescriptions..." 
              className="pl-12 h-12 text-base border-2 focus:border-medical-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredPrescriptions.map((rx) => (
          <Card key={rx.id} className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-medical-secondary">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex gap-5 flex-1">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-medical-secondary to-medical-accent flex items-center justify-center flex-shrink-0 shadow-md">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl">{rx.medication}</h3>
                      <Badge className={rx.status === "Filled" ? "bg-success text-white" : "bg-warning text-white"}>
                        {rx.status}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-medical-primary" />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">Patient:</span> {rx.patient}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-medical-secondary" />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">ID:</span> {rx.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-medical-accent" />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">Dosage:</span> {rx.dosage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-medical-primary" />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">Date:</span> {rx.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Prescribed by: <span className="font-semibold text-foreground">{rx.doctor}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-medical-secondary hover:text-white hover:border-medical-secondary">
                    View Details
                  </Button>
                  <Button variant="medical" size="sm">
                    {rx.status === "Pending" ? "Fulfill" : "Refill"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
