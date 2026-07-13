import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, Package, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/lib/exportCsv";

const PharmacyInventory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ medication_name: "", sku: "", unit: "tablet", quantity: 0, reorder_level: 10, expiry_date: "" });

  const { data: items = [] } = useQuery({
    queryKey: ["pharmacy-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pharmacy_inventory").select("*").order("medication_name");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const { data: me } = await supabase.from("profiles").select("institute_id").eq("id", user!.id).maybeSingle();
      if (!me?.institute_id) throw new Error("No institute on profile");
      const { error } = await supabase.from("pharmacy_inventory").insert({
        ...form,
        institute_id: me.institute_id,
        expiry_date: form.expiry_date || null,
        updated_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Item added" });
      setOpen(false);
      setForm({ medication_name: "", sku: "", unit: "tablet", quantity: 0, reorder_level: 10, expiry_date: "" });
      qc.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const adjust = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const row = items.find((i: any) => i.id === id);
      if (!row) return;
      const { error } = await supabase
        .from("pharmacy_inventory")
        .update({ quantity: Math.max(0, (row as any).quantity + delta), updated_by: user!.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pharmacy-inventory"] }),
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const exportCsv = () => exportToCsv("pharmacy_inventory.csv", items as any[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-7 w-7 text-primary" /> Pharmacy Inventory</h1>
          <p className="text-muted-foreground">Track medication stock for your institute.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Medication name</Label><Input value={form.medication_name} onChange={(e) => setForm({ ...form, medication_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                  <div><Label>Reorder level</Label><Input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button onClick={() => upsert.mutate()} disabled={!form.medication_name || upsert.isPending}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Stock</CardTitle><CardDescription>{items.length} items</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead><TableHead>SKU</TableHead><TableHead>Unit</TableHead>
                <TableHead>Quantity</TableHead><TableHead>Reorder at</TableHead><TableHead>Expiry</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i: any) => {
                const low = i.quantity <= i.reorder_level;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.medication_name}</TableCell>
                    <TableCell className="text-xs">{i.sku || "—"}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell>
                      <Badge variant={low ? "destructive" : "secondary"}>
                        {low && <AlertTriangle className="h-3 w-3 mr-1" />} {i.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{i.reorder_level}</TableCell>
                    <TableCell>{i.expiry_date || "—"}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="outline" onClick={() => adjust.mutate({ id: i.id, delta: -1 })}><Minus className="h-3 w-3" /></Button>
                      <Button size="icon" variant="outline" onClick={() => adjust.mutate({ id: i.id, delta: 1 })}><Plus className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No items yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyInventory;