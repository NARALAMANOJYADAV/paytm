-- ============================================================================
-- PROMPT TO PRODUCTION - PAYTM AI WORKSHOP
-- N.B.K.R. INSTITUTE OF SCIENCE & TECHNOLOGY (DEPARTMENT OF IT & AI&DS WITH ISTE)
-- PostgreSQL / Supabase Complete Database Schema & Row Level Security (RLS)
-- ============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('user', 'coordinator', 'admin');
CREATE TYPE registration_type AS ENUM ('iste', 'non-iste');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE registration_status AS ENUM ('reserved', 'confirmed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('pending', 'checked_in', 'absent');
CREATE TYPE submission_status AS ENUM ('not_started', 'draft', 'submitted', 'under_review', 'evaluated');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE coordinator_permission_type AS ENUM (
    'CHECKIN_VIEW',
    'CHECKIN_MANAGE',
    'PARTICIPANT_VIEW',
    'REGISTRATION_VERIFY',
    'SUPPORT_VIEW',
    'SUPPORT_REPLY'
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- linked to supabase auth.users
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Participant Profiles Table (Personal & Academic Info)
CREATE TABLE participant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(30) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    iste_member BOOLEAN NOT NULL DEFAULT FALSE,
    iste_sm_number VARCHAR(100),
    has_laptop BOOLEAN NOT NULL DEFAULT TRUE,
    linkedin_portfolio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. P2P-2026-A8F92X
    participant_id UUID NOT NULL REFERENCES participant_profiles(id) ON DELETE CASCADE,
    event_id VARCHAR(100) NOT NULL DEFAULT 'p2p-2026',
    registration_type registration_type NOT NULL DEFAULT 'non-iste',
    fee NUMERIC(10, 2) NOT NULL DEFAULT 100.00, -- 50 for ISTE, 100 for non-ISTE
    payment_status payment_status NOT NULL DEFAULT 'pending',
    registration_status registration_status NOT NULL DEFAULT 'reserved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Payments Table (Razorpay Records)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'success',
    payment_method VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tickets Table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    qr_token TEXT NOT NULL,
    wallet_pass_url TEXT,
    status ticket_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Attendance Table (Gate Check-in Logs)
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    iste_member BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_by VARCHAR(255) NOT NULL,
    check_in_time VARCHAR(50) NOT NULL,
    status attendance_status NOT NULL DEFAULT 'checked_in',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Coordinators Table
CREATE TABLE coordinators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_or_student_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Coordinator Permissions Table
CREATE TABLE coordinator_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordinator_id UUID NOT NULL REFERENCES coordinators(id) ON DELETE CASCADE,
    permission coordinator_permission_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (coordinator_id, permission)
);

-- 10. Event Resources Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- presentation, guide, code, pdf, link
    file_url TEXT NOT NULL,
    file_size VARCHAR(50),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) NOT NULL DEFAULT 'p2p-2026',
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. P2P-AI42
    leader_id UUID NOT NULL REFERENCES participant_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Team Members Table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participant_profiles(id) ON DELETE CASCADE,
    is_leader BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, participant_id)
);

-- 13. Submissions Table (Build Challenge Hackathon)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    problem_statement TEXT NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    demo_url TEXT,
    presentation_url TEXT,
    file_url TEXT,
    status submission_status NOT NULL DEFAULT 'submitted',
    score_innovation NUMERIC(5, 2) DEFAULT 0,
    score_ai_prompting NUMERIC(5, 2) DEFAULT 0,
    score_tech_execution NUMERIC(5, 2) DEFAULT 0,
    score_presentation NUMERIC(5, 2) DEFAULT 0,
    score_total NUMERIC(5, 2) DEFAULT 0,
    jury_feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Support Tickets Table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. SUP-2026-001
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_id VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    status support_status NOT NULL DEFAULT 'open',
    assigned_to VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Support Messages Table
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    support_ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role user_role NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Announcements Table (Live Ticker Broadcast)
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- normal, urgent
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Certificates Table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(100) UNIQUE NOT NULL, -- e.g. CERT-P2P-2026-081
    registration_id VARCHAR(100) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    college_name VARCHAR(255) NOT NULL DEFAULT 'N.B.K.R. Institute of Science & Technology',
    type VARCHAR(50) NOT NULL DEFAULT 'participation', -- participation, winner, runner_up, merit
    rank VARCHAR(100),
    issue_date VARCHAR(100) NOT NULL DEFAULT '30 September 2026',
    verification_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'issued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for high performance lookup
CREATE INDEX idx_registrations_number ON registrations(registration_number);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
CREATE INDEX idx_attendance_reg_num ON attendance(registration_number);
CREATE INDEX idx_certificates_id ON certificates(certificate_id);
CREATE INDEX idx_teams_code ON teams(invite_code);

-- ============================================================================
-- Section 49: Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Public can view published resources
CREATE POLICY "Public can view published resources"
    ON resources FOR SELECT
    USING (published = true);

-- Participants can only view their own registrations
CREATE POLICY "Users can view own registration"
    ON registrations FOR SELECT
    USING (auth.uid() IN (
        SELECT u.auth_id FROM users u
        JOIN participant_profiles p ON p.user_id = u.id
        WHERE p.id = registrations.participant_id
    ));

-- Admins have unrestricted access
CREATE POLICY "Admins have full access on registrations"
    ON registrations FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'));

-- Coordinators can view registrations with REGISTRATION_VERIFY permission
CREATE POLICY "Coordinators with permission can view registrations"
    ON registrations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users u
        JOIN coordinators c ON c.user_id = u.id
        JOIN coordinator_permissions cp ON cp.coordinator_id = c.id
        WHERE u.auth_id = auth.uid()
        AND cp.permission = 'REGISTRATION_VERIFY'
        AND cp.enabled = true
    ));
