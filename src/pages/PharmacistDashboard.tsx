import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, AlertTriangle, Pill, ListChecks, RefreshCw, Pencil } from "lucide-react";

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["pharmacist-dashboard-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_inventory")
        .select("*")
        .order("medication_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const outOfStock = inventory.filter((i: any) => i.quantity <= 0);
  const lowStock = inventory.filter((i: any) => i.quantity > 0 && i.quantity <= i.reorder_level);

  const filtered = inventory.filter((i: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      i.medication_name?.toLowerCase().includes(q) ||
      i.sku?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Pill className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>
            <p className="text-emerald-100">Prescriptions, inventory and stock alerts</p>
          </div>
        </div>
      </div>

      {/* Primary action buttons */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          size="lg"
          className="h-24 text-base justify-start gap-3 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate("/pharmacist-prescriptions")}
        >
          <Search className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">Search Prescription</div>
            <div className="text-xs opacity-90">Find & process active prescriptions</div>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-24 text-base justify-start gap-3 border-2"
          onClick={() => navigate("/pharmacy-inventory")}
        >
          <ListChecks className="h-6 w-6 text-emerald-600" />
          <div className="text-left">
            <div className="font-semibold">Inventory Listing</div>
            <div className="text-xs text-muted-foreground">View all stocked medications</div>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-24 text-base justify-start gap-3 border-2"
          onClick={() => navigate("/pharmacy-inventory")}
        >
          <Pencil className="h-6 w-6 text-emerald-600" />
          <div className="text-left">
            <div className="font-semibold">Inventory Update</div>
            <div className="text-xs text-muted-foreground">Add, adjust or restock items</div>
          </div>
        </Button>
      </div>

      {/* Search facility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-emerald-600" />
            Search Facility
          </CardTitle>
          <CardDescription>Search inventory by medication name or SKU</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type a medication name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {search && (
            <div className="mt-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No matching items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.slice(0, 10).map((i: any) => {
                      const out = i.quantity <= 0;
                      const low = !out && i.quantity <= i.reorder_level;
                      return (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">{i.medication_name}</TableCell>
                          <TableCell className="text-xs">{i.sku || "—"}</TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell>
                            {out ? (
                              <Badge variant="destructive">Out of stock</Badge>
                            ) : low ? (
                              <Badge className="bg-amber-500 hover:bg-amber-500">Low</Badge>
                            ) : (
                              <Badge variant="secondary">OK</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Out-of-stock alerts */}
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Out of Stock Alerts
            </CardTitle>
            <CardDescription>
              {outOfStock.length} out of stock · {lowStock.length} low stock
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/pharmacy-inventory")}>
            <RefreshCw className="h-4 w-4 mr-2" /> Restock
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : outOfStock.length === 0 && lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" /> All medications are sufficiently stocked.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder at</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...outOfStock, ...lowStock].map((i: any) => {
                  const out = i.quantity <= 0;
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.medication_name}</TableCell>
                      <TableCell className="text-xs">{i.sku || "—"}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell>{i.reorder_level}</TableCell>
                      <TableCell>
                        {out ? (
                          <Badge variant="destructive">Out of stock</Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-500">Low</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacistDashboard;