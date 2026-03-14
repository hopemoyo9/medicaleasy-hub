import { Home, Users, FileText, Calendar, Heart, Settings, LogOut, Activity, CalendarClock, Shield, Pill, Building2, Database as DatabaseIcon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { role, loading } = useUserRole();
  const { signOut } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: Home },
    ];

    if (role === 'super_admin') {
      return [
        ...baseItems,
        { title: "Institute Approval", url: "/institute-approval", icon: Building2 },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseItems,
        { title: "Role Management", url: "/role-management", icon: Shield },
        { title: "Patients", url: "/patients", icon: Users },
        { title: "Appointments", url: "/appointments", icon: CalendarClock },
        { title: "Prescriptions", url: "/prescriptions", icon: Pill },
        { title: "Donations", url: "/donations", icon: Heart },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (role === 'pharmacist') {
      return [
        { title: "Home", url: "/pharmacist", icon: Home },
        { title: "Prescriptions", url: "/pharmacist-prescriptions", icon: Pill },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (role === 'doctor') {
      return [
        ...baseItems,
        { title: "Patients", url: "/patients", icon: Users },
        { title: "Appointments", url: "/appointments", icon: CalendarClock },
        { title: "Prescriptions", url: "/prescriptions", icon: Pill },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (role === 'nurse') {
      return [
        ...baseItems,
        { title: "Patients", url: "/patients", icon: Users },
        { title: "Appointments", url: "/appointments", icon: CalendarClock },
        { title: "Donations", url: "/donations", icon: Heart },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isCollapsed = state === "collapsed";

  if (loading) {
    return <Sidebar collapsible="icon"><SidebarContent /></Sidebar>;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="font-bold bg-gradient-to-r from-primary to-medical-secondary bg-clip-text text-transparent">
              MedicalEasy
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="hover:bg-muted/50 transition-colors" 
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
