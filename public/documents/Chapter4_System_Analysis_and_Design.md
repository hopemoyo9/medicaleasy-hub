# CHAPTER 4: SYSTEM ANALYSIS AND DESIGN

## 4.0 Introduction

System analysis and design deal with planning the development of information systems by understanding and specifying in detail what a system should do and how its components should be implemented and work together. This chapter presents the comprehensive analysis and design of MedicalEasy, a distributed healthcare management system built for the Zimbabwean context, detailing the functional decomposition, use case modeling, system architecture, user interface design, and database design.

---

## 4.1 Systems Analysis

Systems analysis is the process of collecting and interpreting facts, identifying problems, and decomposing a system into its components. The analysis of MedicalEasy was conducted to identify the system's objectives and ensure all components work efficiently to accomplish their purpose.

### 4.1.1 Functional Requirements Analysis

The following core functional requirements were identified through stakeholder interviews, observation of existing manual workflows in Zimbabwean healthcare facilities, and review of existing literature:

| Req. ID | Requirement | Priority | Description |
|---------|-------------|----------|-------------|
| FR-01 | User Authentication & Authorization | High | Multi-role login system supporting Admin, Doctor, Nurse, and Pharmacist roles with role-based access control (RBAC) |
| FR-02 | Patient Management | High | CRUD operations for patient records including demographics, medical history, blood group, emergency contacts |
| FR-03 | Appointment Scheduling | High | Calendar-based scheduling with time slot management, status tracking (scheduled, completed, cancelled, no-show) |
| FR-04 | Prescription Management | High | Create, track, and manage prescriptions with pharmacist workflow for medication availability and substitution |
| FR-05 | Blood Donation Registry | Medium | Record and manage blood donations with donor information, blood group tracking, and donation status workflow |
| FR-06 | Medical History Tracking | High | Longitudinal recording of patient conditions, diagnoses, and clinical notes |
| FR-07 | Role Management | High | Administrative interface for assigning and managing user roles across the system |
| FR-08 | Global Search | Medium | Cross-module search functionality for quick access to patients, prescriptions, and appointments |
| FR-09 | Dashboard Analytics | Medium | Real-time statistical overview of patients, prescriptions, appointments, and donations |

### 4.1.2 Non-Functional Requirements

| NFR ID | Requirement | Description |
|--------|-------------|-------------|
| NFR-01 | Security | Row-Level Security (RLS) policies on all database tables; encrypted authentication; role-based data access |
| NFR-02 | Performance | Sub-second response times for CRUD operations; optimized queries with indexing |
| NFR-03 | Scalability | Cloud-based architecture supporting horizontal scaling |
| NFR-04 | Usability | Responsive design; intuitive navigation; role-specific interfaces |
| NFR-05 | Reliability | Automatic session management; graceful error handling with user feedback |

### 4.1.3 Use Case Modeling

The following use case diagram illustrates the primary actors and their interactions with MedicalEasy:

#### Actors

| Actor | Description |
|-------|-------------|
| **Admin** | Full system access: manages users, roles, patients, appointments, prescriptions, donations, and settings |
| **Doctor** | Manages patients, creates/views prescriptions, schedules/manages appointments |
| **Nurse** | Views patients (with appointments), manages appointments, records blood donations |
| **Pharmacist** | Views prescriptions, updates medication availability, substitutes medications, adds pharmacist notes |

#### Use Case Descriptions

**Use Case 1: User Authentication**

| Field | Description |
|-------|-------------|
| Use Case ID | UC-01 |
| Name | User Authentication |
| Primary Actor | All Users (Admin, Doctor, Nurse, Pharmacist) |
| Precondition | User has a registered account with verified email |
| Main Flow | 1. User navigates to login page. 2. User enters email and password. 3. System validates credentials via Supabase Auth. 4. System fetches user role from `user_roles` table. 5. System redirects user to role-appropriate dashboard. |
| Alternative Flow | 3a. Invalid credentials → System displays error message. 5a. No role assigned → User sees limited dashboard with message to contact admin. |
| Postcondition | User is authenticated with a valid session and role-based navigation is rendered. |

**Use Case 2: Patient Management**

| Field | Description |
|-------|-------------|
| Use Case ID | UC-02 |
| Name | Manage Patient Records |
| Primary Actor | Admin, Doctor, Nurse |
| Precondition | User is authenticated with appropriate role |
| Main Flow | 1. User navigates to Patients module. 2. System displays searchable patient directory. 3. User can add a new patient (full name, DOB, gender, blood group, contact info, emergency contact, medical notes). 4. User can view detailed patient profile with medical history. 5. User can update patient information. |
| Postcondition | Patient record is created/updated in the `patients` table with `created_by` tracking. |

**Use Case 3: Prescription Workflow**

| Field | Description |
|-------|-------------|
| Use Case ID | UC-03 |
| Name | Prescription Management |
| Primary Actor | Doctor (create), Pharmacist (fulfill) |
| Precondition | Patient exists in the system |
| Main Flow | 1. Doctor creates prescription (medication name, dosage, frequency, duration, notes). 2. System stores prescription with `prescribed_by` reference. 3. Pharmacist views pending prescriptions. 4. Pharmacist checks medication availability. 5. If unavailable, pharmacist can substitute medication and add notes. 6. Pharmacist updates prescription status. |
| Postcondition | Prescription is tracked with complete audit trail including pharmacist actions. |

**Use Case 4: Appointment Scheduling**

| Field | Description |
|-------|-------------|
| Use Case ID | UC-04 |
| Name | Schedule Appointment |
| Primary Actor | Admin, Doctor, Nurse |
| Precondition | Patient exists; time slot is available |
| Main Flow | 1. User selects date from calendar. 2. System displays available time slots. 3. User selects patient and time slot. 4. User enters appointment reason and notes. 5. System creates appointment with status "scheduled". |
| Postcondition | Appointment is recorded with patient, doctor, date, duration, and status. |

**Use Case 5: Blood Donation Management**

| Field | Description |
|-------|-------------|
| Use Case ID | UC-05 |
| Name | Record Blood Donation |
| Primary Actor | Admin, Nurse |
| Precondition | User is authenticated with admin or nurse role |
| Main Flow | 1. User opens donation form. 2. User enters donor details (name, phone, email, blood group, units, date). 3. System creates donation record with "pending" status. 4. Admin can update status to approved/completed/rejected. |
| Postcondition | Donation record is stored with complete donor information and status tracking. |

### 4.1.4 Data Flow Analysis

**Level 0 – Context Diagram**

The MedicalEasy system interacts with four primary external entities:

- **Healthcare Staff** (Doctors, Nurses, Admins) → Provide patient data, appointments, prescriptions
- **Pharmacists** → Receive prescription orders, update medication availability
- **Donors** → Provide blood donation information
- **Supabase Cloud Backend** → Stores and retrieves all data with real-time synchronization

**Level 1 – Major Processes**

1. **Authentication Process** – Validates user credentials, manages sessions, enforces RBAC
2. **Patient Management Process** – Handles patient CRUD operations and medical history
3. **Appointment Process** – Manages scheduling, time slots, and appointment statuses
4. **Prescription Process** – Handles prescription creation, pharmacist review, and fulfillment
5. **Donation Process** – Records and tracks blood donation lifecycle
6. **Reporting Process** – Aggregates data for dashboard statistics

---

## 4.2 System Design

System design focuses on how to accomplish the objectives identified during analysis. This section details the software architecture, user interface design, and database design of MedicalEasy.

### 4.2.1 Software Design

#### System Architecture

MedicalEasy follows a **modern three-tier client-server architecture** deployed as a Single Page Application (SPA) with a Backend-as-a-Service (BaaS):

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                      │
│              (React + TypeScript + Vite)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Dashboard │ │ Patients │ │Prescrip. │ │Appointments│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Donations│ │ Settings │ │ Role Mgmt│               │
│  └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION TIER                       │
│              (Supabase Client SDK + RLS)                 │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ │
│  │ Auth Context  │ │ React Query │ │ Protected Routes │ │
│  └──────────────┘ └─────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                     DATA TIER                            │
│               (Supabase / PostgreSQL)                    │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐ │
│  │ patients │ │ appoint.│ │prescrip. │ │ donations  │ │
│  └──────────┘ └─────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐               │
│  │ profiles │ │user_role│ │med_hist. │               │
│  └──────────┘ └─────────┘ └──────────┘               │
│              + Row-Level Security Policies              │
└─────────────────────────────────────────────────────────┘
```

#### Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend Framework | React 18 + TypeScript | Component-based architecture, type safety, large ecosystem |
| Build Tool | Vite | Fast HMR, optimized production builds |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible, customizable component library |
| State Management | TanStack React Query | Server state management with caching, background refetching |
| Routing | React Router v6 | Declarative, nested routing with protected route support |
| Backend | Supabase (PostgreSQL) | Open-source BaaS with auth, RLS, real-time subscriptions |
| Authentication | Supabase Auth | JWT-based, supports email/password, session management |
| Charts | Recharts | React-native charting for dashboard analytics |

#### Component Architecture

The application follows a modular component architecture:

```
src/
├── components/
│   ├── ui/                    # Reusable UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ... (50+ components)
│   ├── AppSidebar.tsx         # Role-aware navigation sidebar
│   ├── DashboardLayout.tsx    # Authenticated layout wrapper
│   ├── ProtectedRoute.tsx     # Auth guard component
│   ├── GlobalSearch.tsx       # Cross-module search
│   ├── AddPatientDialog.tsx   # Patient creation form
│   ├── AddPrescriptionDialog.tsx # Prescription creation form
│   └── NavLink.tsx            # Active-state navigation link
├── contexts/
│   └── AuthContext.tsx         # Global authentication state
├── hooks/
│   ├── useUserRole.tsx        # Role fetching hook
│   ├── use-mobile.tsx         # Responsive breakpoint detection
│   └── use-toast.ts           # Toast notification hook
├── pages/
│   ├── Landing.tsx            # Public landing page
│   ├── Login.tsx              # Authentication page
│   ├── Register.tsx           # User registration
│   ├── Dashboard.tsx          # Statistics overview
│   ├── Patients.tsx           # Patient directory
│   ├── PatientDetails.tsx     # Individual patient view
│   ├── Prescriptions.tsx      # Prescription management
│   ├── Appointments.tsx       # Scheduling interface
│   ├── Donations.tsx          # Blood donation registry
│   ├── Settings.tsx           # User settings
│   ├── RoleManagement.tsx     # Admin role assignment
│   ├── PharmacistHome.tsx     # Pharmacist dashboard
│   └── PharmacistPrescriptions.tsx # Pharmacist workflow
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client instance
│       └── types.ts           # Auto-generated database types
└── App.tsx                    # Root component with routing
```

#### Role-Based Access Control (RBAC) Design

The system implements a security-first RBAC model:

```
┌────────────────────┐
│    auth.users       │  (Supabase managed)
└────────┬───────────┘
         │ user_id
         ▼
┌────────────────────┐     ┌─────────────────┐
│    user_roles       │────▶│   app_role enum  │
│  - user_id (FK)     │     │  - admin         │
│  - role             │     │  - doctor        │
└────────────────────┘     │  - nurse         │
                           │  - pharmacist    │
                           └─────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│    has_role() SECURITY DEFINER         │
│    Function (prevents RLS recursion)   │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│    Row-Level Security Policies          │
│    (Applied per table, per role)       │
└────────────────────────────────────────┘
```

**Role-Permission Matrix:**

| Module | Admin | Doctor | Nurse | Pharmacist |
|--------|-------|--------|-------|------------|
| Dashboard | ✅ Full | ✅ Full | ✅ Full | ❌ Own Home |
| Patients | ✅ CRUD | ✅ CRUD | ✅ View (with appointments) | ✅ View (with prescriptions) |
| Appointments | ✅ Full | ✅ Own + Unassigned | ✅ View, Create, Update | ❌ No Access |
| Prescriptions | ✅ Full | ✅ Create, View, Update Own | ❌ No Access | ✅ View, Update |
| Donations | ✅ Full | ❌ No Access | ✅ View, Create | ❌ No Access |
| Role Management | ✅ Full | ❌ No Access | ❌ No Access | ❌ No Access |
| Medical History | ✅ Full | ✅ CRUD | ❌ No Access | ❌ No Access |
| Settings | ✅ Full | ✅ Own Profile | ✅ Own Profile | ✅ Own Profile |

### 4.2.2 User Interface Design

The MedicalEasy user interface follows a **sidebar-driven dashboard layout** pattern, designed for healthcare professionals who need quick, role-specific access to patient data.

#### Design Principles

1. **Role-Adaptive Navigation**: The sidebar dynamically renders menu items based on the authenticated user's role, preventing UI clutter and enforcing least-privilege access.
2. **Card-Based Information Architecture**: All data modules use card containers with clear headers, descriptions, and action areas.
3. **Medical-Grade Color System**: A custom HSL-based color palette with semantic tokens (`medical-primary`, `medical-secondary`, `medical-accent`) ensures visual consistency and accessibility.
4. **Responsive Design**: All interfaces adapt from mobile (320px) to desktop (1920px) using Tailwind CSS responsive utilities.

#### Key Interface Screens

**1. Login Screen**
- Centered card layout with branded logo
- Email/password form with input validation
- Loading states during authentication
- Links to registration and password recovery

**2. Dashboard (Admin/Doctor/Nurse)**
- Four stat cards showing total patients, prescriptions, appointments, and donations with trend indicators
- Recent activity feed showing latest patient interactions
- Quick action buttons for common tasks (Add Patient, Create Prescription, Schedule Appointment)

**3. Patient Directory**
- Searchable table with columns: Patient ID, Name, Age, Gender, Medical Notes, Last Updated, Blood Group
- Row-click navigation to detailed patient view
- Dropdown actions per patient (View Details, Schedule Appointment, Create Prescription)
- Add Patient dialog with comprehensive form

**4. Prescription Management**
- Card-based prescription list with medication details, dosage, and status badges
- Search functionality across patient name, prescription ID, and medication
- Color-coded status indicators (Filled = green, Pending = amber)
- Pharmacist-specific view with medication availability and substitution fields

**5. Appointment Scheduling**
- Interactive calendar for date selection
- Grid of available time slots with booked/available indicators
- Today's appointments sidebar showing upcoming patient visits
- One-click booking with toast confirmation

**6. Blood Donation Registry**
- Table view with donor name, blood group, units, phone, date, and status
- Color-coded status badges (pending, approved, completed, rejected)
- Add Donation dialog with blood group selector and unit tracking

**7. Role Management (Admin Only)**
- User listing with current role assignments
- Role assignment/update interface
- Restricted to admin role via both UI rendering and RLS policies

#### Navigation Architecture

```
Landing Page (/)
├── Login (/login)
├── Register (/register)
└── Authenticated Routes (ProtectedRoute wrapper)
    ├── Dashboard (/dashboard)
    ├── Patients (/patients)
    │   └── Patient Details (/patients/:id)
    ├── Appointments (/appointments)
    ├── Prescriptions (/prescriptions)
    ├── Donations (/donations)
    ├── Settings (/settings)
    ├── Role Management (/role-management)      [Admin only]
    ├── Pharmacist Home (/pharmacist)            [Pharmacist only]
    └── Pharmacist Prescriptions (/pharmacist-prescriptions) [Pharmacist only]
```

### 4.2.3 Database Design

#### Entity-Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  auth.users   │       │    profiles       │       │   user_roles     │
│──────────────│       │──────────────────│       │──────────────────│
│ id (PK)      │◄──┐   │ id (PK, FK→auth) │       │ id (PK)          │
│ email        │   │   │ full_name        │       │ user_id (FK→auth)│
│ ...          │   │   │ email            │       │ role (app_role)  │
└──────────────┘   │   │ phone            │       │ created_at       │
                   │   │ avatar_url       │       └──────────────────┘
                   │   │ created_at       │
                   │   │ updated_at       │
                   │   └──────────────────┘
                   │
    ┌──────────────┴───────────────────────────────────┐
    │                                                   │
    ▼                                                   ▼
┌──────────────────┐                         ┌──────────────────┐
│    patients       │                         │   prescriptions   │
│──────────────────│                         │──────────────────│
│ id (PK, UUID)    │◄────────────────┐       │ id (PK, UUID)    │
│ full_name        │                 │       │ patient_id (FK)  │──┐
│ date_of_birth    │                 │       │ medication_name  │  │
│ gender (enum)    │                 │       │ dosage           │  │
│ blood_group(enum)│                 │       │ frequency        │  │
│ phone            │                 │       │ duration         │  │
│ email            │                 │       │ status (enum)    │  │
│ address          │                 │       │ prescribed_by    │  │
│ emergency_contact│                 │       │ pharmacist_id    │  │
│ emergency_phone  │                 │       │ medication_avail │  │
│ medical_notes    │                 │       │ med_substituted  │  │
│ created_by       │                 │       │ substituted_med  │  │
│ created_at       │                 │       │ pharmacist_notes │  │
│ updated_at       │                 │       │ notes            │  │
└──────────────────┘                 │       │ created_at       │  │
         │                           │       │ updated_at       │  │
         │                           │       └──────────────────┘  │
         ▼                           │                              │
┌──────────────────┐                 │       ┌──────────────────┐  │
│ medical_history   │                 │       │  appointments    │  │
│──────────────────│                 │       │──────────────────│  │
│ id (PK, UUID)    │                 ├───────│ patient_id (FK)  │  │
│ patient_id (FK)  │─────────────────┘       │ id (PK, UUID)    │  │
│ condition        │                         │ doctor_id        │  │
│ diagnosed_date   │                         │ appointment_date │  │
│ notes            │                         │ duration_minutes │  │
│ created_by       │                         │ status (enum)    │  │
│ created_at       │                         │ reason           │  │
│ updated_at       │                         │ notes            │  │
└──────────────────┘                         │ created_at       │  │
                                             │ updated_at       │  │
┌──────────────────┐                         └──────────────────┘  │
│   donations       │                                               │
│──────────────────│                                               │
│ id (PK, UUID)    │                                               │
│ donor_name       │                                               │
│ blood_group(enum)│                                               │
│ units            │                                               │
│ phone            │                                               │
│ email            │                                               │
│ donation_date    │                                               │
│ status (enum)    │                                               │
│ notes            │                                               │
│ created_by       │                                               │
│ created_at       │                                               │
│ updated_at       │                                               │
└──────────────────┘                                               │
```

#### Database Table Specifications

**Table 1: patients**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique patient identifier |
| full_name | TEXT | NOT NULL | Patient's full name |
| date_of_birth | DATE | NOT NULL | Date of birth |
| gender | ENUM (male, female, other) | NOT NULL | Gender |
| blood_group | ENUM (A+, A-, B+, B-, AB+, AB-, O+, O-) | NULLABLE | Blood type |
| phone | TEXT | NULLABLE | Contact number |
| email | TEXT | NULLABLE | Email address |
| address | TEXT | NULLABLE | Physical address |
| emergency_contact | TEXT | NULLABLE | Emergency contact name |
| emergency_phone | TEXT | NULLABLE | Emergency contact number |
| medical_notes | TEXT | NULLABLE | General medical notes |
| created_by | UUID | NULLABLE | Staff who created the record |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 2: appointments**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique appointment ID |
| patient_id | UUID | FK → patients(id), NOT NULL | Associated patient |
| doctor_id | UUID | NULLABLE | Assigned doctor |
| appointment_date | TIMESTAMPTZ | NOT NULL | Scheduled date and time |
| duration_minutes | INTEGER | NOT NULL, DEFAULT 30 | Duration in minutes |
| status | ENUM (scheduled, completed, cancelled, no_show) | NOT NULL, DEFAULT 'scheduled' | Current status |
| reason | TEXT | NULLABLE | Reason for visit |
| notes | TEXT | NULLABLE | Additional notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 3: prescriptions**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique prescription ID |
| patient_id | UUID | FK → patients(id), NOT NULL | Associated patient |
| medication_name | TEXT | NOT NULL | Name of medication |
| dosage | TEXT | NOT NULL | Dosage instructions |
| frequency | TEXT | NOT NULL | Administration frequency |
| duration | TEXT | NOT NULL | Treatment duration |
| status | ENUM (active, completed, cancelled) | NOT NULL, DEFAULT 'active' | Prescription status |
| prescribed_by | UUID | NULLABLE | Prescribing doctor |
| pharmacist_id | UUID | NULLABLE | Fulfilling pharmacist |
| medication_available | BOOLEAN | NULLABLE, DEFAULT true | Medication in stock |
| medication_substituted | BOOLEAN | NULLABLE, DEFAULT false | Whether substituted |
| substituted_medication | TEXT | NULLABLE | Substitute medication name |
| pharmacist_notes | TEXT | NULLABLE | Pharmacist annotations |
| pharmacist_updated_at | TIMESTAMPTZ | NULLABLE | Pharmacist action timestamp |
| notes | TEXT | NULLABLE | Doctor's notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 4: donations**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique donation ID |
| donor_name | TEXT | NOT NULL | Donor's full name |
| blood_group | ENUM (A+, A-, B+, B-, AB+, AB-, O+, O-) | NOT NULL | Blood type |
| units | NUMERIC | NOT NULL | Units donated |
| phone | TEXT | NOT NULL | Donor phone |
| email | TEXT | NULLABLE | Donor email |
| donation_date | DATE | NOT NULL | Date of donation |
| status | ENUM (pending, approved, completed, rejected) | NOT NULL, DEFAULT 'pending' | Donation status |
| notes | TEXT | NULLABLE | Additional notes |
| created_by | UUID | NULLABLE | Staff who recorded |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 5: medical_history**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique record ID |
| patient_id | UUID | FK → patients(id), NOT NULL | Associated patient |
| condition | TEXT | NOT NULL | Medical condition |
| diagnosed_date | DATE | NULLABLE | Date of diagnosis |
| notes | TEXT | NULLABLE | Clinical notes |
| created_by | UUID | NULLABLE | Recording clinician |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 6: profiles**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) | Links to auth user |
| full_name | TEXT | NOT NULL | Display name |
| email | TEXT | NOT NULL | User email |
| phone | TEXT | NULLABLE | Phone number |
| avatar_url | TEXT | NULLABLE | Profile image URL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Table 7: user_roles**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique record ID |
| user_id | UUID | FK → auth.users(id), NOT NULL, UNIQUE with role | Associated user |
| role | ENUM (admin, doctor, nurse, pharmacist) | NOT NULL | Assigned role |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Assignment timestamp |

#### Enumerated Types

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'pharmacist');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');
CREATE TYPE public.blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.donation_status AS ENUM ('pending', 'approved', 'completed', 'rejected');
```

#### Security Function

```sql
-- SECURITY DEFINER function to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

#### Row-Level Security (RLS) Policy Summary

| Table | Policy | Roles | Operations |
|-------|--------|-------|------------|
| patients | Admin full access | admin | SELECT, INSERT, UPDATE |
| patients | Doctor full access | doctor | SELECT, INSERT, UPDATE |
| patients | Nurse conditional view | nurse | SELECT (patients with appointments only), INSERT, UPDATE |
| patients | Pharmacist conditional view | pharmacist | SELECT (patients with prescriptions only) |
| appointments | Admin full access | admin | ALL |
| appointments | Doctor own appointments | doctor | ALL (own + unassigned) |
| appointments | Nurse access | nurse | SELECT, INSERT, UPDATE |
| prescriptions | Admin full access | admin | ALL |
| prescriptions | Doctor create & view | doctor | INSERT, SELECT, UPDATE (own) |
| prescriptions | Pharmacist access | pharmacist | SELECT, UPDATE |
| donations | Admin full access | admin | SELECT, INSERT, UPDATE |
| donations | Nurse access | nurse | SELECT, INSERT |
| medical_history | Admin full access | admin | SELECT, INSERT, UPDATE |
| medical_history | Doctor full access | doctor | SELECT, INSERT, UPDATE |
| profiles | Own profile access | all authenticated | SELECT, UPDATE (own only) |
| user_roles | Admin management | admin | ALL, SELECT |

#### Normalization

All tables in MedicalEasy are designed in **Third Normal Form (3NF)**:

- **1NF**: All columns contain atomic values; no repeating groups exist.
- **2NF**: All non-key attributes are fully dependent on the primary key (UUID).
- **3NF**: No transitive dependencies exist. Reference data (blood groups, statuses, roles) are stored as PostgreSQL ENUM types rather than separate lookup tables, which is appropriate for small, stable value sets and improves query performance.

---

## 4.3 Summary

This chapter presented a comprehensive analysis and design of the MedicalEasy healthcare management system. The systems analysis identified nine core functional requirements and five non-functional requirements, modeled through five detailed use cases covering authentication, patient management, prescriptions, appointments, and blood donations. The system design detailed a three-tier architecture using React/TypeScript on the frontend and Supabase/PostgreSQL on the backend, with a robust RBAC model enforced through database-level Row-Level Security policies. The database design comprises seven normalized tables with six enumerated types, ensuring data integrity and role-appropriate access control across all system modules.
