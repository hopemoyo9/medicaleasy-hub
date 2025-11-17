import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Prescriptions = () => {
  const prescriptions = [
    { id: "RX001", patient: "Sarah Johnson", medication: "Lisinopril 10mg", date: "2024-01-15", status: "Filled" },
    { id: "RX002", patient: "Michael Chen", medication: "Metformin 500mg", date: "2024-01-18", status: "Pending" },
    { id: "RX003", patient: "Emily Davis", medication: "Ibuprofen 400mg", date: "2024-01-10", status: "Filled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Prescriptions</CardTitle>
          <CardDescription>Find prescriptions by patient or ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search prescriptions..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{rx.medication}</h3>
                    <p className="text-sm text-muted-foreground">Patient: {rx.patient}</p>
                    <p className="text-sm text-muted-foreground">ID: {rx.id}</p>
                    <p className="text-sm text-muted-foreground mt-1">Date: {rx.date}</p>
                  </div>
                </div>
                <Badge className={rx.status === "Filled" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                  {rx.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
