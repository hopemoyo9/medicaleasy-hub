import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DownloadChapter4 = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chapter4-docx`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to generate document");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Chapter4_System_Analysis_and_Design.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      toast({ title: "Download started", description: "Your .docx file is ready." });
    } catch (error: any) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Chapter 4</CardTitle>
          <CardDescription>System Analysis and Design — MedicalEasy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Format:</strong> Microsoft Word (.docx)</p>
            <p><strong className="text-foreground">Contents:</strong> Functional requirements, use cases, system architecture, UI design, database design (ERD, 7 tables), RLS policies</p>
            <p><strong className="text-foreground">Formatting:</strong> Times New Roman, styled headings, formatted tables, code blocks</p>
          </div>
          <Button onClick={handleDownload} disabled={downloading} className="w-full" size="lg">
            {downloading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
            ) : downloaded ? (
              <><CheckCircle className="mr-2 h-5 w-5" /> Download Again</>
            ) : (
              <><Download className="mr-2 h-5 w-5" /> Download .docx</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadChapter4;
