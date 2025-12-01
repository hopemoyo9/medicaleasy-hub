import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Calendar, Pill, Droplet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search patients by ID
      const { data: patients } = await supabase
        .from("patients")
        .select("id, full_name")
        .ilike("id", `%${searchQuery}%`)
        .limit(5);

      patients?.forEach((patient) => {
        searchResults.push({
          id: patient.id,
          type: "patient",
          title: patient.full_name,
          subtitle: `ID: ${patient.id.slice(0, 8)}...`,
        });
      });

      // Search appointments by ID
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, reason, appointment_date, patient_id")
        .ilike("id", `%${searchQuery}%`)
        .limit(5);

      appointments?.forEach((apt) => {
        searchResults.push({
          id: apt.id,
          type: "appointment",
          title: apt.reason || "Appointment",
          subtitle: `ID: ${apt.id.slice(0, 8)}... | ${new Date(apt.appointment_date).toLocaleDateString()}`,
        });
      });

      // Search prescriptions by ID
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("id, medication_name, patient_id")
        .ilike("id", `%${searchQuery}%`)
        .limit(5);

      prescriptions?.forEach((rx) => {
        searchResults.push({
          id: rx.id,
          type: "prescription",
          title: rx.medication_name,
          subtitle: `ID: ${rx.id.slice(0, 8)}...`,
        });
      });

      // Search donations by ID
      const { data: donations } = await supabase
        .from("donations")
        .select("id, donor_name, blood_group")
        .ilike("id", `%${searchQuery}%`)
        .limit(5);

      donations?.forEach((donation) => {
        searchResults.push({
          id: donation.id,
          type: "donation",
          title: donation.donor_name,
          subtitle: `ID: ${donation.id.slice(0, 8)}... | ${donation.blood_group}`,
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);

    switch (result.type) {
      case "patient":
        navigate(`/patients/${result.id}`);
        break;
      case "appointment":
        navigate("/appointments");
        break;
      case "prescription":
        navigate("/prescriptions");
        break;
      case "donation":
        navigate("/donations");
        break;
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return <User className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "prescription":
        return <Pill className="h-4 w-4" />;
      case "donation":
        return <Droplet className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return "default";
      case "appointment":
        return "secondary";
      case "prescription":
        return "outline";
      case "donation":
        return "destructive";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-sm justify-start text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4" />
          Search by ID...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Enter ID to search..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CommandList>
            {isSearching && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!isSearching && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <Badge variant={getBadgeVariant(result.type)} className="capitalize">
                        {result.type}
                      </Badge>
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
