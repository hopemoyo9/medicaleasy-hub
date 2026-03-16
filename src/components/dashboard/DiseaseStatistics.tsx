import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DiseaseCount = {
  condition: string;
  count: number;
};

const DiseaseStatistics = () => {
  const { data: diseases = [], isLoading } = useQuery({
    queryKey: ["disease-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_history")
        .select("condition");

      if (error) throw error;

      // Aggregate counts by condition
      const countMap = new Map<string, number>();
      (data ?? []).forEach((row) => {
        const key = row.condition.trim().toLowerCase();
        const displayName = row.condition.trim();
        const existing = countMap.get(key) ?? 0;
        countMap.set(key, existing + 1);
        // Store display name
        if (!countMap.has(`_display_${key}`)) {
          countMap.set(`_display_${key}`, 0);
        }
      });

      // Build sorted array
      const nameMap = new Map<string, string>();
      (data ?? []).forEach((row) => {
        const key = row.condition.trim().toLowerCase();
        if (!nameMap.has(key)) nameMap.set(key, row.condition.trim());
      });

      const result: DiseaseCount[] = [];
      countMap.forEach((count, key) => {
        if (!key.startsWith("_display_")) {
          result.push({ condition: nameMap.get(key) ?? key, count });
        }
      });

      return result.sort((a, b) => b.count - a.count);
    },
  });

  const totalPatients = diseases.reduce((sum, d) => sum + d.count, 0);
  const topDiseases = diseases.slice(0, 8);
  const maxCount = topDiseases[0]?.count ?? 1;

  return (
    <Card className="border-t-4 border-t-destructive shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-destructive" />
          Disease Statistics
        </CardTitle>
        <CardDescription>
          Conditions handled across {totalPatients} recorded case{totalPatients !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading statistics...</p>
        ) : diseases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No medical history recorded yet</p>
            <p className="text-xs">Disease statistics will appear here as conditions are logged</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topDiseases.map((disease, index) => {
              const percentage = Math.round((disease.count / maxCount) * 100);
              return (
                <div key={disease.condition} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate flex-1">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {disease.condition}
                    </span>
                    <span className="text-muted-foreground ml-2 font-semibold">
                      {disease.count} patient{disease.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            {diseases.length > 8 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                + {diseases.length - 8} more conditions recorded
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiseaseStatistics;
