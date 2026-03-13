import { FileText, Search, Calendar, User, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddPrescriptionDialog } from "@/components/AddPrescriptionDialog";

const Prescriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, patients(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const patientName = (rx as any).patients?.full_name || "";
    return (
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "completed": return "bg-primary/10 text-primary";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted";
    }
  };

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
          <CardDescription>Find prescriptions by patient name, ID, or medication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-medical-secondary" />
            <Input placeholder="Search prescriptions..." className="pl-12 h-12 text-base border-2 focus:border-medical-secondary" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {isLoading ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">Loading prescriptions...</CardContent></Card>
        ) : filteredPrescriptions.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No prescriptions found</CardContent></Card>
        ) : (
          filteredPrescriptions.map((rx) => (
            <Card key={rx.id} className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-medical-secondary">
              <CardContent className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex gap-5 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-medical-secondary to-medical-accent flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl">{rx.medication_name}</h3>
                        <Badge className={getStatusBadge(rx.status)}>{rx.status}</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground"><span className="font-semibold text-foreground">Patient:</span> {(rx as any).patients?.full_name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-medical-accent" />
                          <span className="text-muted-foreground"><span className="font-semibold text-foreground">Dosage:</span> {rx.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground"><span className="font-semibold text-foreground">Duration:</span> {rx.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-medical-secondary" />
                          <span className="text-muted-foreground"><span className="font-semibold text-foreground">Frequency:</span> {rx.frequency}</span>
                        </div>
                      </div>
                      {rx.notes && <p className="text-sm text-muted-foreground">Notes: {rx.notes}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
