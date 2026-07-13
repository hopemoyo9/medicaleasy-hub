import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const { role, isPharmacyInstitute } = useUserRole();
  const navigate = useNavigate();
  const isPharmacistView = role === "pharmacist" || isPharmacyInstitute;

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 gap-4">
            <SidebarTrigger />
            {!isPharmacistView && <GlobalSearch />}
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {!isPharmacistView && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} title="Messages">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <NotificationsBell />
                </>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {role && (
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">
                    {role.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
