import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarClock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { exportToCsv } from "@/lib/exportCsv";

const Theatre = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openRoom, setOpenRoom] = useState(false);
  const [openBook, setOpenBook] = useState(false);
  const [room, setRoom] = useState({ name: "", description: "" });
  const [booking, setBooking] = useState({ room_id: "", patient_id: "", procedure: "", starts_at: "", ends_at: "", notes: "" });

  const { data: rooms = [] } = useQuery({
    queryKey: ["theatre-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("theatre_rooms").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["theatre-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theatre_bookings")
        .select("*, theatre_rooms(name), patients(full_name)")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["theatre-patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const { data: me } = await supabase.from("profiles").select("institute_id").eq("id", user!.id).maybeSingle();
      const { error } = await supabase.from("theatre_rooms").insert({ ...room, institute_id: me!.institute_id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Room added" });
      setOpenRoom(false);
      setRoom({ name: "", description: "" });
      qc.invalidateQueries({ queryKey: ["theatre-rooms"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      const { data: me } = await supabase.from("profiles").select("institute_id").eq("id", user!.id).maybeSingle();
      const { error } = await supabase.from("theatre_bookings").insert({
        room_id: booking.room_id,
        patient_id: booking.patient_id || null,
        procedure: booking.procedure,
        starts_at: new Date(booking.starts_at).toISOString(),
        ends_at: new Date(booking.ends_at).toISOString(),
        notes: booking.notes || null,
        surgeon_id: user!.id,
        created_by: user!.id,
        institute_id: me!.institute_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Surgery scheduled" });
      setOpenBook(false);
      setBooking({ room_id: "", patient_id: "", procedure: "", starts_at: "", ends_at: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["theatre-bookings"] });
    },
    onError: (e: any) => toast({ title: "Conflict or error", description: e.message, variant: "destructive" }),
  });

  const exportCsv = () =>
    exportToCsv(
      "theatre_bookings.csv",
      (bookings as any[]).map((b) => ({
        room: b.theatre_rooms?.name,
        patient: b.patients?.full_name,
        procedure: b.procedure,
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        status: b.status,
      })),
    );

  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarClock className="h-7 w-7 text-primary" /> Surgical Theatre</h1>
          <p className="text-muted-foreground">Schedule procedures and manage rooms.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          {isAdmin && (
            <Dialog open={openRoom} onOpenChange={setOpenRoom}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Room</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Theatre Room</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={room.name} onChange={(e) => setRoom({ ...room, name: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea value={room.description} onChange={(e) => setRoom({ ...room, description: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={() => createRoom.mutate()} disabled={!room.name}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={openBook} onOpenChange={setOpenBook}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Schedule Surgery</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Surgery</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Room</Label>
                  <Select value={booking.room_id} onValueChange={(v) => setBooking({ ...booking, room_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                    <SelectContent>
                      {(rooms as any[]).map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient</Label>
                  <Select value={booking.patient_id} onValueChange={(v) => setBooking({ ...booking, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {(patients as any[]).map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Procedure</Label><Input value={booking.procedure} onChange={(e) => setBooking({ ...booking, procedure: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Starts</Label><Input type="datetime-local" value={booking.starts_at} onChange={(e) => setBooking({ ...booking, starts_at: e.target.value })} /></div>
                  <div><Label>Ends</Label><Input type="datetime-local" value={booking.ends_at} onChange={(e) => setBooking({ ...booking, ends_at: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button onClick={() => createBooking.mutate()} disabled={!booking.room_id || !booking.procedure || !booking.starts_at || !booking.ends_at}>
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming & Recent Bookings</CardTitle><CardDescription>{bookings.length} bookings</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead><TableHead>Patient</TableHead><TableHead>Procedure</TableHead>
                <TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings as any[]).map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.theatre_rooms?.name}</TableCell>
                  <TableCell>{b.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{b.procedure}</TableCell>
                  <TableCell className="text-xs">{format(new Date(b.starts_at), "PPp")}</TableCell>
                  <TableCell className="text-xs">{format(new Date(b.ends_at), "PPp")}</TableCell>
                  <TableCell><Badge variant={b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge></TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bookings yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Theatre;