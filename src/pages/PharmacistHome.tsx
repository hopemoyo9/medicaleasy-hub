import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Pill, Phone, Mail, User, Building2, Calendar,
  Stethoscope, MessageSquare, Save, AlertCircle, FileText, Clock,
} from "lucide-react";
import { format } from "date-fns";

const PharmacistHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState("");

  // Search patients by name or ID
  const { data: patients = [], isFetching } = useQuery({
    queryKey: ["pharmacist-patient-search", searched],
    enabled: !!searched.trim(),
    queryFn: async () => {
      const term = searched.trim();
      const isUuidLike = /^[0-9a-f-]{8,}$/i.test(term);
      const q = supabase.from("patients").select("id, full_name, phone, email, date_of_birth");
      const { data, error } = isUuidLike
        ? await q.or(`full_name.ilike.%${term}%,id.eq.${term}`)
        : await q.ilike("full_name", `%${term}%`);
      if (error) throw error;
      return data || [];
    },
  });

  // Prescriptions for selected patient
  const { data: prescriptions = [] } = useQuery({
    queryKey: ["pharmacist-patient-rx", selected?.id],
    enabled: !!selected?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", selected.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Doctor profiles lookup
  const doctorIds = Array.from(new Set(prescriptions.map((p: any) => p.prescribed_by).filter(Boolean)));
  const { data: doctors = [] } = useQuery({
    queryKey: ["pharmacist-doctors", doctorIds.join(",")],
    enabled: doctorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", doctorIds);
      if (error) throw error;
      return data || [];
    },
  });
  const doctorById = (id: string) => doctors.find((d: any) => d.id === id);

  const [activeRx, setActiveRx] = useState<any>(null);

  const saveNotes = useMutation({
    mutationFn: async () => {
      if (!activeRx || !notes.trim()) throw new Error("Add a note before saving");

      // 1. Update prescription with pharmacist note
      const { error: rxErr } = await supabase
        .from("prescriptions")
        .update({
          pharmacist_notes: notes,
          pharmacist_id: user?.id,
          pharmacist_updated_at: new Date().toISOString(),
        })
        .eq("id", activeRx.id);
      if (rxErr) throw rxErr;

      // 2. Append entry to patient's medical history
      const { error: mhErr } = await supabase.from("medical_history").insert({
        patient_id: activeRx.patient_id,
        condition: `Pharmacist note — ${activeRx.medication_name}`,
        notes,
        diagnosed_date: new Date().toISOString().slice(0, 10),
        created_by: user?.id,
      });
      if (mhErr) throw mhErr;
    },
    onSuccess: () => {
      toast({ title: "Note saved", description: "Added to prescription and patient medical history." });
      setNotes("");
      qc.invalidateQueries({ queryKey: ["pharmacist-patient-rx"] });
    },
    onError: (e: any) => toast({ title: "Could not save note", description: e.message, variant: "destructive" }),
  });

  const handleSearch = () => {
    setSelected(null);
    setActiveRx(null);
    setSearched(query);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl"><Pill className="h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Portal</h1>
            <p className="text-emerald-100">Look up a patient and process their prescriptions</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Search className="h-5 w-5" /> Search Patient Prescription
          </CardTitle>
          <CardDescription>Search by patient name or National / Patient ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g. John Doe  or  patient ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12 text-base"
            />
            <Button onClick={handleSearch} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
              <Search className="h-5 w-5 mr-2" /> Search
            </Button>
          </div>

          {searched && (
            <div className="mt-4 space-y-2">
              {isFetching ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
              ) : patients.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> No patient found for “{searched}”.
                </div>
              ) : (
                patients.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setActiveRx(null); }}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selected?.id === p.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                        : "hover:border-emerald-300 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                      </div>
                      {p.phone && <span className="text-xs text-muted-foreground">{p.phone}</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient + Prescriptions */}
      {selected && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prescription list */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-emerald-600" />
                Prescriptions for {selected.full_name}
              </CardTitle>
              <CardDescription>{prescriptions.length} record(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No prescriptions on file.</p>
              ) : prescriptions.map((rx: any) => (
                <button
                  key={rx.id}
                  onClick={() => { setActiveRx(rx); setNotes(rx.pharmacist_notes || ""); }}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeRx?.id === rx.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "hover:border-emerald-300 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{rx.medication_name}</p>
                      <p className="text-xs text-muted-foreground">{rx.dosage} · {rx.frequency}</p>
                    </div>
                    <Badge variant={rx.status === "active" ? "default" : "secondary"}>{rx.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(rx.created_at), "MMM d, yyyy")}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Detail */}
          <div className="lg:col-span-2 space-y-6">
            {!activeRx ? (
              <Card className="shadow-md">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  Select a prescription to view details
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-md border-t-4 border-t-emerald-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-emerald-600" /> Prescription Details
                      </CardTitle>
                      <Badge variant="outline" className="font-mono">{activeRx.id.slice(0, 8)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label className="text-xs text-muted-foreground">Medication</Label><p className="font-medium">{activeRx.medication_name}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Dosage</Label><p className="font-medium">{activeRx.dosage}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Frequency</Label><p className="font-medium">{activeRx.frequency}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Duration</Label><p className="font-medium">{activeRx.duration}</p></div>
                    </div>

                    {activeRx.notes && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <Label className="text-xs text-muted-foreground">Doctor's Notes</Label>
                        <p className="text-sm mt-1">{activeRx.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Prescribed on {format(new Date(activeRx.created_at), "PPP 'at' p")}
                    </div>

                    <Separator />

                    {/* Doctor contact */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-emerald-600" /> Prescribing Doctor
                      </h3>
                      {(() => {
                        const doc = activeRx.prescribed_by ? doctorById(activeRx.prescribed_by) : null;
                        if (!doc) return <p className="text-sm text-muted-foreground">Doctor information unavailable.</p>;
                        return (
                          <div className="p-4 rounded-lg border bg-card space-y-2">
                            <p className="font-medium">Dr. {doc.full_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" /> {doc.email}
                            </div>
                            {doc.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" /> {doc.phone}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="shadow-md border-t-4 border-t-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-600" /> Pharmacist Notes
                    </CardTitle>
                    <CardDescription>
                      Document any changes to the original prescription. Saved entries are appended to the patient's medical history.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeRx.pharmacist_notes && (
                      <div className="p-3 bg-muted/40 rounded-lg text-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          Last updated {activeRx.pharmacist_updated_at ? format(new Date(activeRx.pharmacist_updated_at), "PPP p") : "—"}
                        </div>
                        <p className="whitespace-pre-wrap">{activeRx.pharmacist_notes}</p>
                      </div>
                    )}
                    <Textarea
                      placeholder="e.g. Substituted Ibuprofen 400mg with Paracetamol 500mg due to stock — patient informed."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      Entry will be stamped with your pharmacist account and the current time.
                    </div>
                    <Button
                      onClick={() => saveNotes.mutate()}
                      disabled={!notes.trim() || saveNotes.isPending}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveNotes.isPending ? "Saving…" : "Save Note to Medical History"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistHome;