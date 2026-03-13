import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Calendar, Pill, Droplet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: "patient" | "appointment" | "prescription" | "donation";
  title: string;
  subtitle: string;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) { setResults([]); return; }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search patients by name or ID
      const { data: patients } = await supabase
        .from("patients").select("id, full_name")
        .or(`full_name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(5);

      patients?.forEach((p) => searchResults.push({
        id: p.id, type: "patient", title: p.full_name, subtitle: `ID: ${p.id.slice(0, 8)}...`,
      }));

      // Search prescriptions by medication name or ID
      const { data: prescriptions } = await supabase
        .from("prescriptions").select("id, medication_name, patients(full_name)")
        .or(`medication_name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(5);

      prescriptions?.forEach((rx) => searchResults.push({
        id: rx.id, type: "prescription", title: rx.medication_name,
        subtitle: `Patient: ${(rx as any).patients?.full_name || "Unknown"}`,
      }));

      // Search appointments by reason or ID
      const { data: appointments } = await supabase
        .from("appointments").select("id, reason, appointment_date, patients(full_name)")
        .or(`reason.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(5);

      appointments?.forEach((apt) => searchResults.push({
        id: apt.id, type: "appointment", title: (apt as any).patients?.full_name || apt.reason || "Appointment",
        subtitle: `${new Date(apt.appointment_date).toLocaleDateString()} · ${apt.reason || "No reason"}`,
      }));

      // Search donations by donor name or ID
      const { data: donations } = await supabase
        .from("donations").select("id, donor_name, blood_group")
        .or(`donor_name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(5);

      donations?.forEach((d) => searchResults.push({
        id: d.id, type: "donation", title: d.donor_name, subtitle: `Blood Group: ${d.blood_group}`,
      }));

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false); setQuery(""); setResults([]);
    switch (result.type) {
      case "patient": navigate(`/patients/${result.id}`); break;
      case "appointment": navigate("/appointments"); break;
      case "prescription": navigate("/prescriptions"); break;
      case "donation": navigate("/donations"); break;
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    const icons = { patient: User, appointment: Calendar, prescription: Pill, donation: Droplet };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getBadgeVariant = (type: SearchResult["type"]) => {
    const variants = { patient: "default", appointment: "secondary", prescription: "outline", donation: "destructive" } as const;
    return variants[type];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full max-w-sm justify-start text-muted-foreground">
          <Search className="mr-2 h-4 w-4" />
          Search patients, prescriptions...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input placeholder="Search by name, medication, ID..." value={query} onChange={(e) => handleSearch(e.target.value)} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
            {query && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setQuery(""); setResults([]); }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CommandList>
            {isSearching && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}
            {!isSearching && query.length >= 2 && results.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((result) => (
                  <CommandItem key={`${result.type}-${result.id}`} onSelect={() => handleSelect(result)} className="cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <Badge variant={getBadgeVariant(result.type)} className="capitalize">{result.type}</Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
