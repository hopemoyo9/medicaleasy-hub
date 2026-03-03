import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TabStopPosition,
  TabStopType,
} from "npm:docx@8.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true })],
  });
}

function createBody(text: string, bold = false) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, bold, size: 24 })],
  });
}

function createBullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 24 })],
  });
}

function createTableFromData(headers: string[], rows: string[][]) {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "999999",
  };
  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          borders,
          shading: { type: ShadingType.SOLID, color: "2B6CB0", fill: "2B6CB0" },
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF" })],
            }),
          ],
        })
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              borders,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell, size: 20 })],
                }),
              ],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function createCodeBlock(lines: string[]) {
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0 },
        shading: { type: ShadingType.SOLID, color: "F0F0F0", fill: "F0F0F0" },
        children: [new TextRun({ text: line || " ", font: "Courier New", size: 18 })],
      })
  );
}

function buildDocument() {
  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "CHAPTER 4: SYSTEM ANALYSIS AND DESIGN", bold: true, size: 36 })],
    })
  );

  // 4.0 Introduction
  children.push(createHeading("4.0 Introduction", HeadingLevel.HEADING_1));
  children.push(
    createBody(
      "System analysis and design deal with planning the development of information systems by understanding and specifying in detail what a system should do and how its components should be implemented and work together. This chapter presents the comprehensive analysis and design of MedicalEasy, a distributed healthcare management system built for the Zimbabwean context, detailing the functional decomposition, use case modeling, system architecture, user interface design, and database design."
    )
  );

  // 4.1 Systems Analysis
  children.push(createHeading("4.1 Systems Analysis", HeadingLevel.HEADING_1));
  children.push(
    createBody(
      "Systems analysis is the process of collecting and interpreting facts, identifying problems, and decomposing a system into its components. The analysis of MedicalEasy was conducted to identify the system's objectives and ensure all components work efficiently to accomplish their purpose."
    )
  );

  // 4.1.1 Functional Requirements
  children.push(createHeading("4.1.1 Functional Requirements Analysis", HeadingLevel.HEADING_2));
  children.push(
    createBody(
      "The following core functional requirements were identified through stakeholder interviews, observation of existing manual workflows in Zimbabwean healthcare facilities, and review of existing literature:"
    )
  );
  children.push(
    createTableFromData(
      ["Req. ID", "Requirement", "Priority", "Description"],
      [
        ["FR-01", "User Authentication & Authorization", "High", "Multi-role login system supporting Admin, Doctor, Nurse, and Pharmacist roles with RBAC"],
        ["FR-02", "Patient Management", "High", "CRUD operations for patient records including demographics, medical history, blood group, emergency contacts"],
        ["FR-03", "Appointment Scheduling", "High", "Calendar-based scheduling with time slot management, status tracking"],
        ["FR-04", "Prescription Management", "High", "Create, track, and manage prescriptions with pharmacist workflow for medication availability and substitution"],
        ["FR-05", "Blood Donation Registry", "Medium", "Record and manage blood donations with donor information, blood group tracking, and donation status workflow"],
        ["FR-06", "Medical History Tracking", "High", "Longitudinal recording of patient conditions, diagnoses, and clinical notes"],
        ["FR-07", "Role Management", "High", "Administrative interface for assigning and managing user roles across the system"],
        ["FR-08", "Global Search", "Medium", "Cross-module search functionality for quick access to patients, prescriptions, and appointments"],
        ["FR-09", "Dashboard Analytics", "Medium", "Real-time statistical overview of patients, prescriptions, appointments, and donations"],
      ]
    )
  );

  // 4.1.2 Non-Functional Requirements
  children.push(createHeading("4.1.2 Non-Functional Requirements", HeadingLevel.HEADING_2));
  children.push(
    createTableFromData(
      ["NFR ID", "Requirement", "Description"],
      [
        ["NFR-01", "Security", "Row-Level Security (RLS) policies on all database tables; encrypted authentication; role-based data access"],
        ["NFR-02", "Performance", "Sub-second response times for CRUD operations; optimized queries with indexing"],
        ["NFR-03", "Scalability", "Cloud-based architecture supporting horizontal scaling"],
        ["NFR-04", "Usability", "Responsive design; intuitive navigation; role-specific interfaces"],
        ["NFR-05", "Reliability", "Automatic session management; graceful error handling with user feedback"],
      ]
    )
  );

  // 4.1.3 Use Case Modeling
  children.push(createHeading("4.1.3 Use Case Modeling", HeadingLevel.HEADING_2));
  children.push(createBody("The following use case descriptions illustrate the primary actors and their interactions with MedicalEasy:"));

  // Actors table
  children.push(createHeading("Actors", HeadingLevel.HEADING_3));
  children.push(
    createTableFromData(
      ["Actor", "Description"],
      [
        ["Admin", "Full system access: manages users, roles, patients, appointments, prescriptions, donations, and settings"],
        ["Doctor", "Manages patients, creates/views prescriptions, schedules/manages appointments"],
        ["Nurse", "Views patients (with appointments), manages appointments, records blood donations"],
        ["Pharmacist", "Views prescriptions, updates medication availability, substitutes medications, adds pharmacist notes"],
      ]
    )
  );

  // Use Cases
  const useCases = [
    {
      title: "Use Case 1: User Authentication",
      rows: [
        ["Use Case ID", "UC-01"],
        ["Name", "User Authentication"],
        ["Primary Actor", "All Users (Admin, Doctor, Nurse, Pharmacist)"],
        ["Precondition", "User has a registered account with verified email"],
        ["Main Flow", "1. User navigates to login page. 2. User enters email and password. 3. System validates credentials. 4. System fetches user role from user_roles table. 5. System redirects user to role-appropriate dashboard."],
        ["Alternative Flow", "3a. Invalid credentials → System displays error message. 5a. No role assigned → User sees limited dashboard with message to contact admin."],
        ["Postcondition", "User is authenticated with a valid session and role-based navigation is rendered."],
      ],
    },
    {
      title: "Use Case 2: Patient Management",
      rows: [
        ["Use Case ID", "UC-02"],
        ["Name", "Manage Patient Records"],
        ["Primary Actor", "Admin, Doctor, Nurse"],
        ["Precondition", "User is authenticated with appropriate role"],
        ["Main Flow", "1. User navigates to Patients module. 2. System displays searchable patient directory. 3. User can add a new patient. 4. User can view detailed patient profile with medical history. 5. User can update patient information."],
        ["Postcondition", "Patient record is created/updated in the patients table with created_by tracking."],
      ],
    },
    {
      title: "Use Case 3: Prescription Workflow",
      rows: [
        ["Use Case ID", "UC-03"],
        ["Name", "Prescription Management"],
        ["Primary Actor", "Doctor (create), Pharmacist (fulfill)"],
        ["Precondition", "Patient exists in the system"],
        ["Main Flow", "1. Doctor creates prescription. 2. System stores prescription with prescribed_by reference. 3. Pharmacist views pending prescriptions. 4. Pharmacist checks medication availability. 5. If unavailable, pharmacist can substitute medication. 6. Pharmacist updates prescription status."],
        ["Postcondition", "Prescription is tracked with complete audit trail including pharmacist actions."],
      ],
    },
    {
      title: "Use Case 4: Appointment Scheduling",
      rows: [
        ["Use Case ID", "UC-04"],
        ["Name", "Schedule Appointment"],
        ["Primary Actor", "Admin, Doctor, Nurse"],
        ["Precondition", "Patient exists; time slot is available"],
        ["Main Flow", "1. User selects date from calendar. 2. System displays available time slots. 3. User selects patient and time slot. 4. User enters appointment reason and notes. 5. System creates appointment with status 'scheduled'."],
        ["Postcondition", "Appointment is recorded with patient, doctor, date, duration, and status."],
      ],
    },
    {
      title: "Use Case 5: Blood Donation Management",
      rows: [
        ["Use Case ID", "UC-05"],
        ["Name", "Record Blood Donation"],
        ["Primary Actor", "Admin, Nurse"],
        ["Precondition", "User is authenticated with admin or nurse role"],
        ["Main Flow", "1. User opens donation form. 2. User enters donor details (name, phone, email, blood group, units, date). 3. System creates donation record with 'pending' status. 4. Admin can update status to approved/completed/rejected."],
        ["Postcondition", "Donation record is stored with complete donor information and status tracking."],
      ],
    },
  ];

  for (const uc of useCases) {
    children.push(createHeading(uc.title, HeadingLevel.HEADING_3));
    children.push(createTableFromData(["Field", "Description"], uc.rows));
  }

  // 4.1.4 Data Flow Analysis
  children.push(createHeading("4.1.4 Data Flow Analysis", HeadingLevel.HEADING_2));
  children.push(createBody("Level 0 – Context Diagram", true));
  children.push(createBody("The MedicalEasy system interacts with four primary external entities:"));
  children.push(createBullet("Healthcare Staff (Doctors, Nurses, Admins) → Provide patient data, appointments, prescriptions"));
  children.push(createBullet("Pharmacists → Receive prescription orders, update medication availability"));
  children.push(createBullet("Donors → Provide blood donation information"));
  children.push(createBullet("Cloud Backend → Stores and retrieves all data with real-time synchronization"));

  children.push(createBody("Level 1 – Major Processes", true));
  children.push(createBullet("Authentication Process – Validates user credentials, manages sessions, enforces RBAC"));
  children.push(createBullet("Patient Management Process – Handles patient CRUD operations and medical history"));
  children.push(createBullet("Appointment Process – Manages scheduling, time slots, and appointment statuses"));
  children.push(createBullet("Prescription Process – Handles prescription creation, pharmacist review, and fulfillment"));
  children.push(createBullet("Donation Process – Records and tracks blood donation lifecycle"));
  children.push(createBullet("Reporting Process – Aggregates data for dashboard statistics"));

  // 4.2 System Design
  children.push(createHeading("4.2 System Design", HeadingLevel.HEADING_1));
  children.push(
    createBody(
      "System design focuses on how to accomplish the objectives identified during analysis. This section details the software architecture, user interface design, and database design of MedicalEasy."
    )
  );

  // 4.2.1 Software Design
  children.push(createHeading("4.2.1 Software Design", HeadingLevel.HEADING_2));
  children.push(createHeading("System Architecture", HeadingLevel.HEADING_3));
  children.push(
    createBody(
      "MedicalEasy follows a modern three-tier client-server architecture deployed as a Single Page Application (SPA) with a Backend-as-a-Service (BaaS):"
    )
  );

  // Architecture diagram as code block
  children.push(
    ...createCodeBlock([
      "┌─────────────────────────────────────────────────────┐",
      "│              PRESENTATION TIER                       │",
      "│          (React + TypeScript + Vite)                 │",
      "│  Dashboard │ Patients │ Prescriptions │ Appointments │",
      "│  Donations │ Settings │ Role Management              │",
      "├─────────────────────────────────────────────────────┤",
      "│              APPLICATION TIER                        │",
      "│          (Supabase Client SDK + RLS)                 │",
      "│  Auth Context │ React Query │ Protected Routes       │",
      "├─────────────────────────────────────────────────────┤",
      "│                DATA TIER                             │",
      "│           (Supabase / PostgreSQL)                    │",
      "│  patients │ appointments │ prescriptions │ donations │",
      "│  profiles │ user_roles │ medical_history             │",
      "│          + Row-Level Security Policies               │",
      "└─────────────────────────────────────────────────────┘",
    ])
  );

  // Technology Stack
  children.push(createHeading("Technology Stack", HeadingLevel.HEADING_3));
  children.push(
    createTableFromData(
      ["Layer", "Technology", "Justification"],
      [
        ["Frontend Framework", "React 18 + TypeScript", "Component-based architecture, type safety, large ecosystem"],
        ["Build Tool", "Vite", "Fast HMR, optimized production builds"],
        ["Styling", "Tailwind CSS + shadcn/ui", "Utility-first CSS with accessible, customizable component library"],
        ["State Management", "TanStack React Query", "Server state management with caching, background refetching"],
        ["Routing", "React Router v6", "Declarative, nested routing with protected route support"],
        ["Backend", "Supabase (PostgreSQL)", "Open-source BaaS with auth, RLS, real-time subscriptions"],
        ["Authentication", "Supabase Auth", "JWT-based, supports email/password, session management"],
        ["Charts", "Recharts", "React-native charting for dashboard analytics"],
      ]
    )
  );

  // Component Architecture
  children.push(createHeading("Component Architecture", HeadingLevel.HEADING_3));
  children.push(createBody("The application follows a modular component architecture:"));
  children.push(
    ...createCodeBlock([
      "src/",
      "├── components/",
      "│   ├── ui/                    # Reusable UI primitives (shadcn/ui)",
      "│   ├── AppSidebar.tsx         # Role-aware navigation sidebar",
      "│   ├── DashboardLayout.tsx    # Authenticated layout wrapper",
      "│   ├── ProtectedRoute.tsx     # Auth guard component",
      "│   ├── GlobalSearch.tsx       # Cross-module search",
      "│   ├── AddPatientDialog.tsx   # Patient creation form",
      "│   ├── AddPrescriptionDialog.tsx # Prescription creation form",
      "│   └── NavLink.tsx            # Active-state navigation link",
      "├── contexts/",
      "│   └── AuthContext.tsx         # Global authentication state",
      "├── hooks/",
      "│   ├── useUserRole.tsx        # Role fetching hook",
      "│   ├── use-mobile.tsx         # Responsive breakpoint detection",
      "│   └── use-toast.ts           # Toast notification hook",
      "├── pages/                     # Route-level page components",
      "├── integrations/",
      "│   └── supabase/              # Client & auto-generated types",
      "└── App.tsx                    # Root component with routing",
    ])
  );

  // RBAC Design
  children.push(createHeading("Role-Based Access Control (RBAC) Design", HeadingLevel.HEADING_3));
  children.push(createBody("The system implements a security-first RBAC model with the following role-permission matrix:"));
  children.push(
    createTableFromData(
      ["Module", "Admin", "Doctor", "Nurse", "Pharmacist"],
      [
        ["Dashboard", "✅ Full", "✅ Full", "✅ Full", "❌ Own Home"],
        ["Patients", "✅ CRUD", "✅ CRUD", "✅ View (with appts)", "✅ View (with Rx)"],
        ["Appointments", "✅ Full", "✅ Own + Unassigned", "✅ View, Create, Update", "❌ No Access"],
        ["Prescriptions", "✅ Full", "✅ Create, View, Update", "❌ No Access", "✅ View, Update"],
        ["Donations", "✅ Full", "❌ No Access", "✅ View, Create", "❌ No Access"],
        ["Role Management", "✅ Full", "❌ No Access", "❌ No Access", "❌ No Access"],
        ["Medical History", "✅ Full", "✅ CRUD", "❌ No Access", "❌ No Access"],
        ["Settings", "✅ Full", "✅ Own Profile", "✅ Own Profile", "✅ Own Profile"],
      ]
    )
  );

  // 4.2.2 User Interface Design
  children.push(createHeading("4.2.2 User Interface Design", HeadingLevel.HEADING_2));
  children.push(
    createBody(
      "The MedicalEasy user interface follows a sidebar-driven dashboard layout pattern, designed for healthcare professionals who need quick, role-specific access to patient data."
    )
  );

  children.push(createHeading("Design Principles", HeadingLevel.HEADING_3));
  children.push(createBullet("Role-Adaptive Navigation: The sidebar dynamically renders menu items based on the authenticated user's role."));
  children.push(createBullet("Card-Based Information Architecture: All data modules use card containers with clear headers, descriptions, and action areas."));
  children.push(createBullet("Medical-Grade Color System: A custom HSL-based color palette with semantic tokens ensures visual consistency and accessibility."));
  children.push(createBullet("Responsive Design: All interfaces adapt from mobile (320px) to desktop (1920px) using Tailwind CSS responsive utilities."));

  children.push(createHeading("Key Interface Screens", HeadingLevel.HEADING_3));
  const screens = [
    ["1. Login Screen", "Centered card layout with branded logo, email/password form with input validation, loading states during authentication, links to registration."],
    ["2. Dashboard", "Four stat cards showing totals with trend indicators, recent activity feed, quick action buttons for common tasks."],
    ["3. Patient Directory", "Searchable table with patient details, row-click navigation, dropdown actions per patient, add patient dialog."],
    ["4. Prescription Management", "Card-based prescription list with medication details, search functionality, color-coded status indicators, pharmacist-specific view."],
    ["5. Appointment Scheduling", "Interactive calendar for date selection, grid of available time slots, today's appointments sidebar, one-click booking."],
    ["6. Blood Donation Registry", "Table view with donor details, color-coded status badges, add donation dialog with blood group selector."],
    ["7. Role Management (Admin Only)", "User listing with current role assignments, role assignment/update interface, restricted via both UI and RLS policies."],
  ];
  for (const [title, desc] of screens) {
    children.push(createBody(title, true));
    children.push(createBody(desc));
  }

  // Navigation Architecture
  children.push(createHeading("Navigation Architecture", HeadingLevel.HEADING_3));
  children.push(
    ...createCodeBlock([
      "Landing Page (/)",
      "├── Login (/login)",
      "├── Register (/register)",
      "└── Authenticated Routes (ProtectedRoute wrapper)",
      "    ├── Dashboard (/dashboard)",
      "    ├── Patients (/patients)",
      "    │   └── Patient Details (/patients/:id)",
      "    ├── Appointments (/appointments)",
      "    ├── Prescriptions (/prescriptions)",
      "    ├── Donations (/donations)",
      "    ├── Settings (/settings)",
      "    ├── Role Management (/role-management)      [Admin only]",
      "    ├── Pharmacist Home (/pharmacist)            [Pharmacist only]",
      "    └── Pharmacist Prescriptions                 [Pharmacist only]",
    ])
  );

  // 4.2.3 Database Design
  children.push(createHeading("4.2.3 Database Design", HeadingLevel.HEADING_2));
  children.push(createHeading("Entity-Relationship Diagram (ERD)", HeadingLevel.HEADING_3));
  children.push(
    ...createCodeBlock([
      "┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐",
      "│  auth.users   │       │    profiles       │       │   user_roles     │",
      "│──────────────│       │──────────────────│       │──────────────────│",
      "│ id (PK)      │◄──┐   │ id (PK, FK→auth) │       │ id (PK)          │",
      "│ email        │   │   │ full_name        │       │ user_id (FK→auth)│",
      "│ ...          │   │   │ email            │       │ role (app_role)  │",
      "└──────────────┘   │   │ phone            │       │ created_at       │",
      "                   │   │ avatar_url       │       └──────────────────┘",
      "                   │   └──────────────────┘",
      "    ┌──────────────┴───────────────────────────────────┐",
      "    ▼                                                   ▼",
      "┌──────────────────┐                         ┌──────────────────┐",
      "│    patients       │                         │   prescriptions   │",
      "│──────────────────│                         │──────────────────│",
      "│ id (PK, UUID)    │◄────────────────┐       │ id (PK, UUID)    │",
      "│ full_name        │                 │       │ patient_id (FK)  │",
      "│ date_of_birth    │                 │       │ medication_name  │",
      "│ gender (enum)    │                 │       │ dosage           │",
      "│ blood_group      │                 │       │ frequency        │",
      "│ ...              │                 │       │ status (enum)    │",
      "└──────────────────┘                 │       │ ...              │",
      "         │                           │       └──────────────────┘",
      "         ▼                           │",
      "┌──────────────────┐                 │       ┌──────────────────┐",
      "│ medical_history   │                 │       │  appointments    │",
      "│──────────────────│                 │       │──────────────────│",
      "│ id (PK, UUID)    │                 ├───────│ patient_id (FK)  │",
      "│ patient_id (FK)  │─────────────────┘       │ doctor_id        │",
      "│ condition        │                         │ appointment_date │",
      "│ ...              │                         │ status (enum)    │",
      "└──────────────────┘                         └──────────────────┘",
      "",
      "┌──────────────────┐",
      "│   donations       │",
      "│──────────────────│",
      "│ id (PK, UUID)    │",
      "│ donor_name       │",
      "│ blood_group      │",
      "│ ...              │",
      "└──────────────────┘",
    ])
  );

  // Database Table Specifications
  children.push(createHeading("Database Table Specifications", HeadingLevel.HEADING_3));

  // Table 1: patients
  children.push(createBody("Table 1: patients", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique patient identifier"],
        ["full_name", "TEXT", "NOT NULL", "Patient's full name"],
        ["date_of_birth", "DATE", "NOT NULL", "Date of birth"],
        ["gender", "ENUM", "NOT NULL", "Gender (male, female, other)"],
        ["blood_group", "ENUM", "NULLABLE", "Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)"],
        ["phone", "TEXT", "NULLABLE", "Contact number"],
        ["email", "TEXT", "NULLABLE", "Email address"],
        ["address", "TEXT", "NULLABLE", "Physical address"],
        ["emergency_contact", "TEXT", "NULLABLE", "Emergency contact name"],
        ["emergency_phone", "TEXT", "NULLABLE", "Emergency contact number"],
        ["medical_notes", "TEXT", "NULLABLE", "General medical notes"],
        ["created_by", "UUID", "NULLABLE", "Staff who created the record"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Record creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 2: appointments
  children.push(createBody("Table 2: appointments", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique appointment ID"],
        ["patient_id", "UUID", "FK → patients(id), NOT NULL", "Associated patient"],
        ["doctor_id", "UUID", "NULLABLE", "Assigned doctor"],
        ["appointment_date", "TIMESTAMPTZ", "NOT NULL", "Scheduled date and time"],
        ["duration_minutes", "INTEGER", "NOT NULL, DEFAULT 30", "Duration in minutes"],
        ["status", "ENUM", "NOT NULL, DEFAULT 'scheduled'", "Current status"],
        ["reason", "TEXT", "NULLABLE", "Reason for visit"],
        ["notes", "TEXT", "NULLABLE", "Additional notes"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 3: prescriptions
  children.push(createBody("Table 3: prescriptions", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique prescription ID"],
        ["patient_id", "UUID", "FK → patients(id), NOT NULL", "Associated patient"],
        ["medication_name", "TEXT", "NOT NULL", "Name of medication"],
        ["dosage", "TEXT", "NOT NULL", "Dosage instructions"],
        ["frequency", "TEXT", "NOT NULL", "Administration frequency"],
        ["duration", "TEXT", "NOT NULL", "Treatment duration"],
        ["status", "ENUM", "NOT NULL, DEFAULT 'active'", "Prescription status"],
        ["prescribed_by", "UUID", "NULLABLE", "Prescribing doctor"],
        ["pharmacist_id", "UUID", "NULLABLE", "Fulfilling pharmacist"],
        ["medication_available", "BOOLEAN", "NULLABLE", "Medication in stock"],
        ["medication_substituted", "BOOLEAN", "NULLABLE", "Whether substituted"],
        ["substituted_medication", "TEXT", "NULLABLE", "Substitute medication name"],
        ["pharmacist_notes", "TEXT", "NULLABLE", "Pharmacist annotations"],
        ["pharmacist_updated_at", "TIMESTAMPTZ", "NULLABLE", "Pharmacist action timestamp"],
        ["notes", "TEXT", "NULLABLE", "Doctor's notes"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 4: donations
  children.push(createBody("Table 4: donations", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique donation ID"],
        ["donor_name", "TEXT", "NOT NULL", "Donor's full name"],
        ["blood_group", "ENUM", "NOT NULL", "Blood type"],
        ["units", "NUMERIC", "NOT NULL", "Units donated"],
        ["phone", "TEXT", "NOT NULL", "Donor phone"],
        ["email", "TEXT", "NULLABLE", "Donor email"],
        ["donation_date", "DATE", "NOT NULL", "Date of donation"],
        ["status", "ENUM", "NOT NULL, DEFAULT 'pending'", "Donation status"],
        ["notes", "TEXT", "NULLABLE", "Additional notes"],
        ["created_by", "UUID", "NULLABLE", "Staff who recorded"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 5: medical_history
  children.push(createBody("Table 5: medical_history", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique record ID"],
        ["patient_id", "UUID", "FK → patients(id), NOT NULL", "Associated patient"],
        ["condition", "TEXT", "NOT NULL", "Medical condition"],
        ["diagnosed_date", "DATE", "NULLABLE", "Date of diagnosis"],
        ["notes", "TEXT", "NULLABLE", "Clinical notes"],
        ["created_by", "UUID", "NULLABLE", "Recording clinician"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 6: profiles
  children.push(createBody("Table 6: profiles", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, FK → auth.users(id)", "Links to auth user"],
        ["full_name", "TEXT", "NOT NULL", "Display name"],
        ["email", "TEXT", "NOT NULL", "User email"],
        ["phone", "TEXT", "NULLABLE", "Phone number"],
        ["avatar_url", "TEXT", "NULLABLE", "Profile image URL"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Creation timestamp"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Last update timestamp"],
      ]
    )
  );

  // Table 7: user_roles
  children.push(createBody("Table 7: user_roles", true));
  children.push(
    createTableFromData(
      ["Column", "Data Type", "Constraints", "Description"],
      [
        ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Unique record ID"],
        ["user_id", "UUID", "FK → auth.users(id), NOT NULL, UNIQUE with role", "Associated user"],
        ["role", "ENUM", "NOT NULL", "Assigned role (admin, doctor, nurse, pharmacist)"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL, DEFAULT now()", "Assignment timestamp"],
      ]
    )
  );

  // Enumerated Types
  children.push(createHeading("Enumerated Types", HeadingLevel.HEADING_3));
  children.push(
    ...createCodeBlock([
      "CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'pharmacist');",
      "CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');",
      "CREATE TYPE public.blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');",
      "CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');",
      "CREATE TYPE public.prescription_status AS ENUM ('active', 'completed', 'cancelled');",
      "CREATE TYPE public.donation_status AS ENUM ('pending', 'approved', 'completed', 'rejected');",
    ])
  );

  // Security Function
  children.push(createHeading("Security Function", HeadingLevel.HEADING_3));
  children.push(
    ...createCodeBlock([
      "-- SECURITY DEFINER function to check user roles without RLS recursion",
      "CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)",
      "RETURNS BOOLEAN",
      "LANGUAGE SQL",
      "STABLE",
      "SECURITY DEFINER",
      "SET search_path = public",
      "AS $$",
      "  SELECT EXISTS (",
      "    SELECT 1",
      "    FROM public.user_roles",
      "    WHERE user_id = _user_id",
      "      AND role = _role",
      "  )",
      "$$;",
    ])
  );

  // RLS Policy Summary
  children.push(createHeading("Row-Level Security (RLS) Policy Summary", HeadingLevel.HEADING_3));
  children.push(
    createTableFromData(
      ["Table", "Policy", "Roles", "Operations"],
      [
        ["patients", "Admin full access", "admin", "SELECT, INSERT, UPDATE"],
        ["patients", "Doctor full access", "doctor", "SELECT, INSERT, UPDATE"],
        ["patients", "Nurse conditional view", "nurse", "SELECT (with appointments), INSERT, UPDATE"],
        ["patients", "Pharmacist conditional view", "pharmacist", "SELECT (with prescriptions)"],
        ["appointments", "Admin full access", "admin", "ALL"],
        ["appointments", "Doctor own appointments", "doctor", "ALL (own + unassigned)"],
        ["appointments", "Nurse access", "nurse", "SELECT, INSERT, UPDATE"],
        ["prescriptions", "Admin full access", "admin", "ALL"],
        ["prescriptions", "Doctor create & view", "doctor", "INSERT, SELECT, UPDATE (own)"],
        ["prescriptions", "Pharmacist access", "pharmacist", "SELECT, UPDATE"],
        ["donations", "Admin full access", "admin", "SELECT, INSERT, UPDATE"],
        ["donations", "Nurse access", "nurse", "SELECT, INSERT"],
        ["medical_history", "Admin full access", "admin", "SELECT, INSERT, UPDATE"],
        ["medical_history", "Doctor full access", "doctor", "SELECT, INSERT, UPDATE"],
        ["profiles", "Own profile access", "all authenticated", "SELECT, UPDATE (own only)"],
        ["user_roles", "Admin management", "admin", "ALL, SELECT"],
      ]
    )
  );

  // Normalization
  children.push(createHeading("Normalization", HeadingLevel.HEADING_3));
  children.push(createBody("All tables in MedicalEasy are designed in Third Normal Form (3NF):"));
  children.push(createBullet("1NF: All columns contain atomic values; no repeating groups exist."));
  children.push(createBullet("2NF: All non-key attributes are fully dependent on the primary key (UUID)."));
  children.push(
    createBullet(
      "3NF: No transitive dependencies exist. Reference data (blood groups, statuses, roles) are stored as PostgreSQL ENUM types rather than separate lookup tables, which is appropriate for small, stable value sets and improves query performance."
    )
  );

  // 4.3 Summary
  children.push(createHeading("4.3 Summary", HeadingLevel.HEADING_1));
  children.push(
    createBody(
      "This chapter presented a comprehensive analysis and design of the MedicalEasy healthcare management system. The systems analysis identified nine core functional requirements and five non-functional requirements, modeled through five detailed use cases covering authentication, patient management, prescriptions, appointments, and blood donations. The system design detailed a three-tier architecture using React/TypeScript on the frontend and Supabase/PostgreSQL on the backend, with a robust RBAC model enforced through database-level Row-Level Security policies. The database design comprises seven normalized tables with six enumerated types, ensuring data integrity and role-appropriate access control across all system modules."
    )
  );

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24,
          },
        },
        heading1: {
          run: { font: "Times New Roman", size: 32, bold: true, color: "1A365D" },
          paragraph: { spacing: { before: 360, after: 200 } },
        },
        heading2: {
          run: { font: "Times New Roman", size: 28, bold: true, color: "2B6CB0" },
          paragraph: { spacing: { before: 280, after: 160 } },
        },
        heading3: {
          run: { font: "Times New Roman", size: 26, bold: true, color: "2C5282" },
          paragraph: { spacing: { before: 200, after: 120 } },
        },
        title: {
          run: { font: "Times New Roman", size: 36, bold: true, color: "1A365D" },
          paragraph: { spacing: { before: 0, after: 400 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const doc = buildDocument();
    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Chapter4_System_Analysis_and_Design.docx"',
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
