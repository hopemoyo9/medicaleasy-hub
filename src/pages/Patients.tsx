import { useState } from "react";
import { Search, User, Mail, Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const patients = [
    { id: "P001", name: "Sarah Johnson", age: 45, gender: "Female", condition: "Hypertension", lastVisit: "2024-01-15", status: "Active" },
    { id: "P002", name: "Michael Chen", age: 32, gender: "Male", condition: "Diabetes", lastVisit: "2024-01-18", status: "Active" },
    { id: "P003", name: "Emily Davis", age: 58, gender: "Female", condition: "Arthritis", lastVisit: "2024-01-10", status: "Active" },
    { id: "P004", name: "David Wilson", age: 67, gender: "Male", condition: "Heart Disease", lastVisit: "2024-01-20", status: "Critical" },
    { id: "P005", name: "Lisa Anderson", age: 29, gender: "Female", condition: "Asthma", lastVisit: "2024-01-12", status: "Stable" },
    { id: "P006", name: "James Brown", age: 41, gender: "Male", condition: "Migraine", lastVisit: "2024-01-19", status: "Active" },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success/10 text-success hover:bg-success/20";
      case "Critical": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      case "Stable": return "bg-primary/10 text-primary hover:bg-primary/20";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Patients</h1>
          <p className="text-muted-foreground">Manage and view patient records</p>
        </div>
        <AddPatientDialog />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>Search and filter patient records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or patient ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.condition}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Record</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Create Prescription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
