"use client";

import {
  User,
  ParticipantProfile,
  Registration,
  Payment,
  Ticket,
  AttendanceRecord,
  CoordinatorInfo,
  EventResource,
  Team,
  ProjectSubmission,
  SupportTicket,
  Announcement,
  Certificate,
  EventConfig,
  CoordinatorPermission,
} from "./types";
import {
  initialEventConfig,
  generateSeedParticipants,
  initialCoordinators,
  initialResources,
  initialTeams,
  initialSubmissions,
  initialSupportTickets,
  initialAnnouncements,
  initialCertificates,
} from "./data/mockStore";

const STORAGE_KEY = "p2p_platform_store_v1";

interface StoreState {
  eventConfig: EventConfig;
  users: User[];
  profiles: ParticipantProfile[];
  registrations: Registration[];
  payments: Payment[];
  tickets: Ticket[];
  attendance: AttendanceRecord[];
  coordinators: CoordinatorInfo[];
  resources: EventResource[];
  teams: Team[];
  submissions: ProjectSubmission[];
  supportTickets: SupportTicket[];
  announcements: Announcement[];
  certificates: Certificate[];
}

function getInitialState(): StoreState {
  const seed = generateSeedParticipants();
  return {
    eventConfig: initialEventConfig,
    users: seed.users,
    profiles: seed.profiles,
    registrations: seed.registrations,
    payments: seed.payments,
    tickets: seed.tickets,
    attendance: seed.attendance,
    coordinators: initialCoordinators,
    resources: initialResources,
    teams: initialTeams,
    submissions: initialSubmissions,
    supportTickets: initialSupportTickets,
    announcements: initialAnnouncements,
    certificates: initialCertificates,
  };
}

export function loadStore(): StoreState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialState();
      saveStore(init);
      return init;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load store, fallback to initial", e);
    return getInitialState();
  }
}

export function saveStore(state: StoreState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("store_updated"));
  } catch (e) {
    console.error("Failed to save store", e);
  }
}

export function resetStore(): StoreState {
  const init = getInitialState();
  saveStore(init);
  return init;
}

// ---------------- Helper Actions ---------------- //

export function getStoreData() {
  return loadStore();
}

/**
 * Register a new participant and return their registration details
 */
export function registerParticipant(data: {
  name: string;
  email: string;
  mobile: string;
  rollNumber: string;
  year: ParticipantProfile["year"];
  branch: ParticipantProfile["branch"];
  section: ParticipantProfile["section"];
  isteMember: boolean;
  isteSmNumber?: string;
  hasLaptop: boolean;
  linkedinPortfolio?: string;
  fee: number;
  password?: string;
}): { registration: Registration; profile: ParticipantProfile; user: User } {
  const store = loadStore();

  const idSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const regNum = `P2P-2026-${idSuffix}`;
  const userId = `user-${Date.now()}`;
  const profileId = `profile-${Date.now()}`;
  const regId = `reg-${Date.now()}`;

  const newUser: User = {
    id: userId,
    auth_id: `auth-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.mobile,
    role: "user",
    status: "active",
    password: data.password || "password123",
    created_at: new Date().toISOString(),
  };

  const newProfile: ParticipantProfile = {
    id: profileId,
    user_id: userId,
    certificate_name: data.name,
    mobile: data.mobile,
    roll_number: data.rollNumber,
    year: data.year,
    branch: data.branch,
    section: data.section,
    iste_member: data.isteMember,
    iste_sm_number: data.isteSmNumber,
    has_laptop: data.hasLaptop,
    linkedin_portfolio: data.linkedinPortfolio,
    created_at: new Date().toISOString(),
  };

  const newRegistration: Registration = {
    id: regId,
    registration_number: regNum,
    participant_id: profileId,
    event_id: "p2p-2026",
    registration_type: data.isteMember ? "iste" : "non-iste",
    fee: data.fee,
    payment_status: "pending",
    registration_status: "reserved",
    created_at: new Date().toISOString(),
  };

  store.users.unshift(newUser);
  store.profiles.unshift(newProfile);
  store.registrations.unshift(newRegistration);

  saveStore(store);

  return { registration: newRegistration, profile: newProfile, user: newUser };
}

/**
 * Updates a registered user's account password
 */
export function updateUserPassword(emailOrUserId: string, password: string): boolean {
  const store = loadStore();
  const clean = emailOrUserId.trim().toLowerCase();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === clean || u.id === emailOrUserId
  );
  if (user) {
    user.password = password;
    saveStore(store);
    return true;
  }
  return false;
}

/**
 * Complete Payment and issue ticket
 */
export function completePaymentAndIssueTicket(
  registrationId: string,
  paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    paymentMethod: string;
  }
): { payment: Payment; ticket: Ticket } {
  const store = loadStore();

  const regIndex = store.registrations.findIndex((r) => r.id === registrationId);
  if (regIndex === -1) {
    throw new Error("Registration not found");
  }

  const reg = store.registrations[regIndex];
  reg.payment_status = "success";
  reg.registration_status = "confirmed";

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    registration_id: reg.id,
    razorpay_order_id: paymentDetails.razorpayOrderId,
    razorpay_payment_id: paymentDetails.razorpayPaymentId,
    razorpay_signature: paymentDetails.razorpaySignature,
    amount: paymentDetails.amount,
    status: "success",
    payment_method: paymentDetails.paymentMethod,
    created_at: new Date().toISOString(),
  };

  const newTicket: Ticket = {
    id: `ticket-${Date.now()}`,
    registration_id: reg.id,
    ticket_number: reg.registration_number,
    qr_token: `ticket_id=${reg.registration_number}`,
    wallet_pass_url: `/api/wallet/${reg.registration_number}`,
    status: "active",
    created_at: new Date().toISOString(),
  };

  store.payments.unshift(newPayment);
  store.tickets.unshift(newTicket);

  saveStore(store);

  return { payment: newPayment, ticket: newTicket };
}

/**
 * Check-in verification logic matching Section 36 & 37:
 * - Successful check-in: return details + check in time
 * - Already checked in: return first check-in time
 * - Invalid ticket: error
 */
export function processCheckIn(
  query: string,
  coordinatorName: string
): {
  success: boolean;
  status: "verified" | "already_checked_in" | "invalid";
  message: string;
  participant?: {
    name: string;
    registrationNumber: string;
    rollNumber: string;
    branch: string;
    year: string;
    section: string;
    isteMember: boolean;
    checkInTime: string;
    firstCheckInTime?: string;
  };
} {
  const store = loadStore();
  const cleanQuery = query.replace(/^ticket_id=/, "").trim().toUpperCase();

  // Find ticket or registration
  const ticket = store.tickets.find(
    (t) => t.ticket_number.toUpperCase() === cleanQuery || t.qr_token.toUpperCase().includes(cleanQuery)
  );

  const registration = store.registrations.find(
    (r) =>
      r.registration_number.toUpperCase() === cleanQuery ||
      (ticket && r.id === ticket.registration_id)
  );

  if (!registration) {
    return {
      success: false,
      status: "invalid",
      message: "✕ INVALID TICKET. Ticket record not found. Please contact the event coordinator desk.",
    };
  }

  const profile = store.profiles.find((p) => p.id === registration.participant_id);
  const user = store.users.find((u) => u.id === profile?.user_id);
  const participantName = profile?.certificate_name || user?.name || "Participant";

  // Check if already checked in
  const existingAtt = store.attendance.find(
    (a) => a.registration_number.toUpperCase() === registration.registration_number.toUpperCase()
  );

  if (existingAtt) {
    return {
      success: false,
      status: "already_checked_in",
      message: `⚠ ALREADY CHECKED IN. First check-in recorded at ${existingAtt.check_in_time} by ${existingAtt.checked_in_by}.`,
      participant: {
        name: participantName,
        registrationNumber: registration.registration_number,
        rollNumber: profile?.roll_number || "N/A",
        branch: profile?.branch || "N/A",
        year: profile?.year || "N/A",
        section: profile?.section || "N/A",
        isteMember: profile?.iste_member || false,
        checkInTime: existingAtt.check_in_time,
        firstCheckInTime: existingAtt.check_in_time,
      },
    };
  }

  // Record successful check-in
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  const newAttendance: AttendanceRecord = {
    id: `att-${Date.now()}`,
    ticket_id: ticket?.id || `ticket-${Date.now()}`,
    registration_number: registration.registration_number,
    participant_name: participantName,
    roll_number: profile?.roll_number || "N/A",
    branch: profile?.branch || "N/A",
    year: profile?.year || "N/A",
    section: profile?.section || "N/A",
    iste_member: profile?.iste_member || false,
    checked_in_by: coordinatorName,
    check_in_time: timeStr,
    status: "checked_in",
  };

  store.attendance.unshift(newAttendance);
  saveStore(store);

  return {
    success: true,
    status: "verified",
    message: "✓ CHECK-IN VERIFIED. Attendance successfully recorded.",
    participant: {
      name: participantName,
      registrationNumber: registration.registration_number,
      rollNumber: profile?.roll_number || "N/A",
      branch: profile?.branch || "N/A",
      year: profile?.year || "N/A",
      section: profile?.section || "N/A",
      isteMember: profile?.iste_member || false,
      checkInTime: timeStr,
    },
  };
}

/**
 * Coordinator permission management
 */
export function toggleCoordinatorPermission(
  coordinatorId: string,
  permission: CoordinatorPermission
) {
  const store = loadStore();
  const coord = store.coordinators.find((c) => c.id === coordinatorId);
  if (!coord) return;

  if (coord.permissions.includes(permission)) {
    coord.permissions = coord.permissions.filter((p) => p !== permission);
  } else {
    coord.permissions.push(permission);
  }
  saveStore(store);
}

/**
 * Team Management: Create Team
 */
export function createTeam(teamName: string, leaderProfileId: string): Team {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.id === leaderProfileId);
  const codeSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const inviteCode = `P2P-${codeSuffix}`;

  const newTeam: Team = {
    id: `team-${Date.now()}`,
    event_id: "p2p-2026",
    name: teamName,
    invite_code: inviteCode,
    leader_id: leaderProfileId,
    leader_name: profile?.certificate_name || "Team Leader",
    created_at: new Date().toISOString(),
    members: [
      {
        id: `tm-${Date.now()}`,
        team_id: `team-${Date.now()}`,
        participant_id: leaderProfileId,
        name: profile?.certificate_name || "Leader",
        roll_number: profile?.roll_number || "N/A",
        branch: profile?.branch || "N/A",
        is_leader: true,
        joined_at: new Date().toISOString(),
      },
    ],
  };

  store.teams.unshift(newTeam);
  saveStore(store);
  return newTeam;
}

/**
 * Join Team with Invite Code
 */
export function joinTeam(inviteCode: string, participantProfileId: string): Team {
  const store = loadStore();
  const team = store.teams.find((t) => t.invite_code.toUpperCase() === inviteCode.trim().toUpperCase());
  if (!team) {
    throw new Error("Invalid team code");
  }

  if (team.members.length >= store.eventConfig.max_team_size) {
    throw new Error(`Team is full (Max ${store.eventConfig.max_team_size} members)`);
  }

  const profile = store.profiles.find((p) => p.id === participantProfileId);
  const alreadyIn = team.members.some((m) => m.participant_id === participantProfileId);
  if (alreadyIn) {
    throw new Error("You are already a member of this team");
  }

  team.members.push({
    id: `tm-${Date.now()}`,
    team_id: team.id,
    participant_id: participantProfileId,
    name: profile?.certificate_name || "Member",
    roll_number: profile?.roll_number || "N/A",
    branch: profile?.branch || "N/A",
    is_leader: false,
    joined_at: new Date().toISOString(),
  });

  saveStore(store);
  return team;
}

/**
 * Submit or update project submission
 */
export function saveProjectSubmission(data: {
  teamId: string;
  projectName: string;
  problemStatement: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  presentationUrl?: string;
  fileUrl?: string;
  status: ProjectSubmission["status"];
}): ProjectSubmission {
  const store = loadStore();
  const team = store.teams.find((t) => t.id === data.teamId);
  const existingIndex = store.submissions.findIndex((s) => s.team_id === data.teamId);

  const submission: ProjectSubmission = {
    id: existingIndex >= 0 ? store.submissions[existingIndex].id : `sub-${Date.now()}`,
    team_id: data.teamId,
    team_name: team?.name || "Team Project",
    project_name: data.projectName,
    problem_statement: data.problemStatement,
    description: data.description,
    technologies: data.technologies,
    github_url: data.githubUrl,
    demo_url: data.demoUrl,
    presentation_url: data.presentationUrl,
    file_url: data.fileUrl,
    status: data.status,
    scores: existingIndex >= 0 ? store.submissions[existingIndex].scores : undefined,
    submitted_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    store.submissions[existingIndex] = submission;
  } else {
    store.submissions.unshift(submission);
  }

  saveStore(store);
  return submission;
}

/**
 * Score a project submission (Judging console)
 */
export function scoreSubmission(
  submissionId: string,
  scores: {
    innovation: number;
    ai_prompting: number;
    tech_execution: number;
    presentation: number;
    feedback?: string;
  }
) {
  const store = loadStore();
  const sub = store.submissions.find((s) => s.id === submissionId);
  if (!sub) return;

  const total = scores.innovation + scores.ai_prompting + scores.tech_execution + scores.presentation;
  sub.scores = {
    ...scores,
    total,
  };
  sub.status = "evaluated";
  saveStore(store);
}

/**
 * Support Ticket: Create
 */
export function createSupportTicket(ticket: {
  userId: string;
  userName: string;
  registrationId?: string;
  category: SupportTicket["category"];
  subject: string;
  message: string;
  attachmentUrl?: string;
}): SupportTicket {
  const store = loadStore();
  const codeNum = String(store.supportTickets.length + 1).padStart(3, "0");

  const newTicket: SupportTicket = {
    id: `sup-${Date.now()}`,
    ticket_code: `SUP-2026-${codeNum}`,
    user_id: ticket.userId,
    user_name: ticket.userName,
    registration_id: ticket.registrationId,
    category: ticket.category,
    subject: ticket.subject,
    message: ticket.message,
    attachment_url: ticket.attachmentUrl,
    status: "open",
    responses: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.supportTickets.unshift(newTicket);
  saveStore(store);
  return newTicket;
}

/**
 * Support Ticket: Reply
 */
export function replySupportTicket(
  ticketId: string,
  reply: {
    senderName: string;
    senderRole: User["role"];
    message: string;
  }
) {
  const store = loadStore();
  const ticket = store.supportTickets.find((t) => t.id === ticketId);
  if (!ticket) return;

  ticket.responses.push({
    id: `msg-${Date.now()}`,
    sender_name: reply.senderName,
    sender_role: reply.senderRole,
    message: reply.message,
    created_at: new Date().toISOString(),
  });
  ticket.status = "in_progress";
  ticket.updated_at = new Date().toISOString();

  saveStore(store);
}

/**
 * Export data to CSV
 */
export function generateCsvData(type: "participants" | "attendance" | "payments" | "submissions"): string {
  const store = loadStore();

  if (type === "participants") {
    const headers = [
      "Registration Number",
      "Full Name",
      "Roll Number",
      "Email",
      "Phone",
      "Year",
      "Branch",
      "Section",
      "ISTE Member",
      "ISTE SM Number",
      "Has Laptop",
      "Payment Status",
      "Fee (INR)",
    ];
    const rows = store.registrations.map((reg) => {
      const profile = store.profiles.find((p) => p.id === reg.participant_id);
      const user = store.users.find((u) => u.id === profile?.user_id);
      return [
        reg.registration_number,
        `"${profile?.certificate_name || user?.name || ""}"`,
        profile?.roll_number || "",
        user?.email || "",
        profile?.mobile || "",
        profile?.year || "",
        profile?.branch || "",
        profile?.section || "",
        profile?.iste_member ? "Yes" : "No",
        profile?.iste_sm_number || "N/A",
        profile?.has_laptop ? "Yes" : "No",
        reg.payment_status.toUpperCase(),
        reg.fee,
      ].join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }

  if (type === "attendance") {
    const headers = [
      "Registration Number",
      "Participant Name",
      "Roll Number",
      "Branch",
      "Year",
      "Section",
      "ISTE Member",
      "Checked In By",
      "Check In Time",
      "Status",
    ];
    const rows = store.attendance.map((att) =>
      [
        att.registration_number,
        `"${att.participant_name}"`,
        att.roll_number,
        att.branch,
        att.year,
        att.section,
        att.iste_member ? "Yes" : "No",
        `"${att.checked_in_by}"`,
        att.check_in_time,
        att.status.toUpperCase(),
      ].join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  if (type === "payments") {
    const headers = [
      "Payment ID",
      "Registration Number",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Amount (INR)",
      "Payment Method",
      "Status",
      "Date",
    ];
    const rows = store.payments.map((p) => {
      const reg = store.registrations.find((r) => r.id === p.registration_id);
      return [
        p.id,
        reg?.registration_number || "N/A",
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.amount,
        `"${p.payment_method || "Online"}"`,
        p.status.toUpperCase(),
        p.created_at,
      ].join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }

  if (type === "submissions") {
    const headers = [
      "Team Name",
      "Project Name",
      "Technologies",
      "Status",
      "Innovation (25)",
      "AI Prompting (25)",
      "Tech Execution (25)",
      "Presentation (25)",
      "Total Score (100)",
      "GitHub Repo",
      "Demo URL",
    ];
    const rows = store.submissions.map((sub) =>
      [
        `"${sub.team_name}"`,
        `"${sub.project_name}"`,
        `"${sub.technologies.join("; ")}"`,
        sub.status.toUpperCase(),
        sub.scores?.innovation ?? "-",
        sub.scores?.ai_prompting ?? "-",
        sub.scores?.tech_execution ?? "-",
        sub.scores?.presentation ?? "-",
        sub.scores?.total ?? "-",
        sub.github_url || "",
        sub.demo_url || "",
      ].join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  return "";
}

export function triggerDownload(content: string, filename: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
