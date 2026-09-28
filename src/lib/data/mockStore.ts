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
} from "../types";

export const initialEventConfig: EventConfig = {
  name: "Prompt to Production",
  subtitle: "Paytm AI Workshop",
  organized_by: "Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology",
  associated_with: "ISTE (Indian Society for Technical Education)",
  date: "2026-09-30",
  date_formatted: "30 September 2026",
  time: "9:00 AM – 4:00 PM",
  venue: "Seminar Hall, New CSE Block",
  capacity: 100,
  registration_open: true,
  iste_fee: 50,
  non_iste_fee: 100,
  max_team_size: 4,
  description:
    "An intensive full-day hands-on workshop and build challenge bridging cutting-edge Generative AI and production engineering, featuring virtual masterclasses by tech leaders from Paytm and Microsoft.",
};

// Seed 100 realistic participants
export function generateSeedParticipants(): {
  users: User[];
  profiles: ParticipantProfile[];
  registrations: Registration[];
  payments: Payment[];
  tickets: Ticket[];
  attendance: AttendanceRecord[];
} {
  const users: User[] = [
    {
      id: "user-1",
      auth_id: "auth-1",
      name: "Manoj N",
      email: "student@nbkrist.org",
      phone: "+91 98765 43210",
      role: "user",
      status: "active",
      created_at: "2026-09-15T10:00:00Z",
    },
    {
      id: "user-2",
      auth_id: "auth-2",
      name: "Pooja Reddy",
      email: "pooja.reddy@nbkrist.org",
      phone: "+91 98765 43211",
      role: "user",
      status: "active",
      created_at: "2026-09-15T10:15:00Z",
    },
    {
      id: "user-3",
      auth_id: "auth-3",
      name: "Sai Teja K",
      email: "saiteja.k@nbkrist.org",
      phone: "+91 98765 43212",
      role: "user",
      status: "active",
      created_at: "2026-09-15T10:30:00Z",
    },
  ];

  const profiles: ParticipantProfile[] = [
    {
      id: "profile-1",
      user_id: "user-1",
      certificate_name: "Manoj N",
      mobile: "+91 98765 43210",
      roll_number: "22011A3142",
      year: "4th Year",
      branch: "AI & DS",
      section: "A",
      iste_member: true,
      iste_sm_number: "ISTE-STU-2023-8942",
      has_laptop: true,
      linkedin_portfolio: "https://linkedin.com/in/manoj-nbkrist",
      created_at: "2026-09-15T10:00:00Z",
    },
    {
      id: "profile-2",
      user_id: "user-2",
      certificate_name: "Pooja Reddy",
      mobile: "+91 98765 43211",
      roll_number: "22011A1205",
      year: "4th Year",
      branch: "IT",
      section: "B",
      iste_member: false,
      has_laptop: true,
      linkedin_portfolio: "https://linkedin.com/in/pooja-reddy",
      created_at: "2026-09-15T10:15:00Z",
    },
    {
      id: "profile-3",
      user_id: "user-3",
      certificate_name: "Sai Teja K",
      mobile: "+91 98765 43212",
      roll_number: "23011A3118",
      year: "3rd Year",
      branch: "AI & DS",
      section: "A",
      iste_member: true,
      iste_sm_number: "ISTE-STU-2024-5102",
      has_laptop: true,
      linkedin_portfolio: "https://github.com/saiteja-k",
      created_at: "2026-09-15T10:30:00Z",
    },
  ];

  const registrations: Registration[] = [
    {
      id: "reg-1",
      registration_number: "P2P-2026-A8F92X",
      participant_id: "profile-1",
      event_id: "p2p-2026",
      registration_type: "iste",
      fee: 50,
      payment_status: "success",
      registration_status: "confirmed",
      created_at: "2026-09-15T10:05:00Z",
    },
    {
      id: "reg-2",
      registration_number: "P2P-2026-B4C77Y",
      participant_id: "profile-2",
      event_id: "p2p-2026",
      registration_type: "non-iste",
      fee: 100,
      payment_status: "success",
      registration_status: "confirmed",
      created_at: "2026-09-15T10:20:00Z",
    },
    {
      id: "reg-3",
      registration_number: "P2P-2026-K9E14Z",
      participant_id: "profile-3",
      event_id: "p2p-2026",
      registration_type: "iste",
      fee: 50,
      payment_status: "success",
      registration_status: "confirmed",
      created_at: "2026-09-15T10:35:00Z",
    },
  ];

  const payments: Payment[] = [
    {
      id: "pay-1",
      registration_id: "reg-1",
      razorpay_order_id: "order_Qz849hK1092jA",
      razorpay_payment_id: "pay_K938j28s7a1",
      razorpay_signature: "sig_83bfe19284fae9b3",
      amount: 50,
      status: "success",
      payment_method: "UPI (Google Pay)",
      created_at: "2026-09-15T10:06:00Z",
    },
    {
      id: "pay-2",
      registration_id: "reg-2",
      razorpay_order_id: "order_M2984kLk910A",
      razorpay_payment_id: "pay_Z8301kLm92A",
      razorpay_signature: "sig_1904aef783bca9",
      amount: 100,
      status: "success",
      payment_method: "Debit Card (HDFC)",
      created_at: "2026-09-15T10:21:00Z",
    },
    {
      id: "pay-3",
      registration_id: "reg-3",
      razorpay_order_id: "order_T9182kLa771B",
      razorpay_payment_id: "pay_L8192aMm19B",
      razorpay_signature: "sig_72fae9102bca19",
      amount: 50,
      status: "success",
      payment_method: "UPI (Paytm)",
      created_at: "2026-09-15T10:36:00Z",
    },
  ];

  const tickets: Ticket[] = [
    {
      id: "ticket-1",
      registration_id: "reg-1",
      ticket_number: "P2P-2026-A8F92X",
      qr_token: "ticket_id=P2P-2026-A8F92X",
      wallet_pass_url: "/api/wallet/P2P-2026-A8F92X",
      status: "active",
      created_at: "2026-09-15T10:08:00Z",
    },
    {
      id: "ticket-2",
      registration_id: "reg-2",
      ticket_number: "P2P-2026-B4C77Y",
      qr_token: "ticket_id=P2P-2026-B4C77Y",
      wallet_pass_url: "/api/wallet/P2P-2026-B4C77Y",
      status: "active",
      created_at: "2026-09-15T10:23:00Z",
    },
    {
      id: "ticket-3",
      registration_id: "reg-3",
      ticket_number: "P2P-2026-K9E14Z",
      qr_token: "ticket_id=P2P-2026-K9E14Z",
      wallet_pass_url: "/api/wallet/P2P-2026-K9E14Z",
      status: "active",
      created_at: "2026-09-15T10:38:00Z",
    },
  ];

  const attendance: AttendanceRecord[] = [
    // Pre-populate checked-in records
    {
      id: "att-2",
      ticket_id: "ticket-2",
      registration_number: "P2P-2026-B4C77Y",
      participant_name: "Pooja Reddy",
      roll_number: "22011A1205",
      branch: "IT",
      year: "4th Year",
      section: "B",
      iste_member: false,
      checked_in_by: "K. V. Chaitanya",
      check_in_time: "8:52 AM",
      status: "checked_in",
    },
  ];

  // Generate 97 more to make a full cohort of 100 participants
  const branches: Array<ParticipantProfile['branch']> = ['AI & DS', 'IT', 'CSE', 'ECE'];
  const years: Array<ParticipantProfile['year']> = ['2nd Year', '3rd Year', '4th Year'];
  const sections: Array<ParticipantProfile['section']> = ['A', 'B', 'C'];
  const names = [
    "Ananya Rao", "Venkatesh Murthy", "Divya Sri", "Rohit Varma", "Swathi Naidu",
    "Ganesh Kumar", "Harika P", "Karthik Raja", "Bhavana S", "Praneeth V",
    "Sneha Reddy", "Akhil Babu", "Tejaswini M", "Naveen Chowdary", "Deepika K",
    "Surya Prakash", "Sandhya R", "Mahesh Babu", "Lavanya C", "Kiran Mai",
    "Vamsi Krishna", "Sravani G", "Chaitanya Sai", "Bindu Madhavi", "Tarun Kumar",
    "Pallavi V", "Jagadeesh B", "Sushmitha N", "Abhinav Reddy", "Kavya Sree",
    "Mohan Krishna", "Keerthi Priya", "Srikanth M", "Meghana R", "Rajesh V",
    "Yamini K", "Phani Kumar", "Archana P", "Lokesh N", "Mounika S",
    "Gowtham Raju", "Hima Bindu", "Ashok Varma", "Anusha Devi", "Sudheer Babu",
    "Pavithra T", "Dinesh Kumar", "Madhuri B", "Nagaraju P", "Sireesha K"
  ];

  for (let i = 4; i <= 100; i++) {
    const name = `${names[(i - 4) % names.length]} ${String.fromCharCode(65 + (i % 26))}`;
    const branch = branches[i % branches.length];
    const year = years[i % years.length];
    const section = sections[i % sections.length];
    const isIste = i % 3 !== 0; // ~67% ISTE
    const isCheckedIn = i <= 82; // 82 checked in
    const rollNo = `2${year.startsWith('4') ? '2' : year.startsWith('3') ? '3' : '4'}011A${branch === 'AI & DS' ? '31' : branch === 'IT' ? '12' : branch === 'CSE' ? '05' : '04'}${String(i).padStart(2, '0')}`;
    const regCode = `P2P-2026-${String.fromCharCode(65 + (i % 26))}${i % 10}${String.fromCharCode(70 + (i % 15))}${String(i * 7).padStart(2, '0').slice(-2)}X`;

    const uId = `user-${i}`;
    const pId = `profile-${i}`;
    const rId = `reg-${i}`;
    const tId = `ticket-${i}`;

    users.push({
      id: uId,
      auth_id: `auth-${i}`,
      name: name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i}@nbkrist.org`,
      phone: `+91 9${String(100000000 + i * 8321).slice(0, 9)}`,
      role: 'user',
      status: 'active',
      created_at: '2026-09-16T11:00:00Z',
    });

    profiles.push({
      id: pId,
      user_id: uId,
      certificate_name: name,
      mobile: `+91 9${String(100000000 + i * 8321).slice(0, 9)}`,
      roll_number: rollNo,
      year: year,
      branch: branch,
      section: section,
      iste_member: isIste,
      iste_sm_number: isIste ? `ISTE-STU-2024-${8000 + i}` : undefined,
      has_laptop: i % 5 !== 0,
      linkedin_portfolio: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
      created_at: '2026-09-16T11:00:00Z',
    });

    registrations.push({
      id: rId,
      registration_number: regCode,
      participant_id: pId,
      event_id: 'p2p-2026',
      registration_type: isIste ? 'iste' : 'non-iste',
      fee: isIste ? 50 : 100,
      payment_status: 'success',
      registration_status: 'confirmed',
      created_at: '2026-09-16T11:05:00Z',
    });

    payments.push({
      id: `pay-${i}`,
      registration_id: rId,
      razorpay_order_id: `order_sim_${i}_nbkr`,
      razorpay_payment_id: `pay_sim_${i}_${Date.now()}`,
      razorpay_signature: `sig_verified_${i}`,
      amount: isIste ? 50 : 100,
      status: 'success',
      payment_method: i % 2 === 0 ? 'UPI' : 'Card',
      created_at: '2026-09-16T11:06:00Z',
    });

    tickets.push({
      id: tId,
      registration_id: rId,
      ticket_number: regCode,
      qr_token: `ticket_id=${regCode}`,
      wallet_pass_url: `/api/wallet/${regCode}`,
      status: 'active',
      created_at: '2026-09-16T11:07:00Z',
    });

    if (isCheckedIn) {
      const minutes = 45 + (i % 25);
      const hour = minutes >= 60 ? 9 : 8;
      const displayMin = minutes >= 60 ? minutes - 60 : minutes;
      attendance.push({
        id: `att-${i}`,
        ticket_id: tId,
        registration_number: regCode,
        participant_name: name,
        roll_number: rollNo,
        branch: branch,
        year: year,
        section: section,
        iste_member: isIste,
        checked_in_by: "K. V. Chaitanya",
        check_in_time: `${hour}:${String(displayMin).padStart(2, '0')} AM`,
        status: 'checked_in',
      });
    }
  }

  return { users, profiles, registrations, payments, tickets, attendance };
}

export const initialCoordinators: CoordinatorInfo[] = [
  {
    id: "coord-1",
    user_id: "user-coord-1",
    name: "K. V. Chaitanya",
    email: "coordinator@nbkrist.org",
    employee_or_student_id: "NBKR-COORD-104",
    status: "active",
    permissions: [
      "CHECKIN_VIEW",
      "CHECKIN_MANAGE",
      "PARTICIPANT_VIEW",
      "REGISTRATION_VERIFY",
      "SUPPORT_VIEW",
      "SUPPORT_REPLY",
    ],
    created_at: "2026-09-10T09:00:00Z",
  },
  {
    id: "coord-2",
    user_id: "user-coord-2",
    name: "M. Hariprasad",
    email: "hariprasad@nbkrist.org",
    employee_or_student_id: "NBKR-COORD-108",
    status: "active",
    permissions: [
      "CHECKIN_VIEW",
      "CHECKIN_MANAGE",
      "PARTICIPANT_VIEW",
    ],
    created_at: "2026-09-11T10:00:00Z",
  },
];

export const initialResources: EventResource[] = [
  {
    id: "res-1",
    title: "Masterclass: Generative AI in Production (Paytm)",
    description: "Official deck presented by Mr. Suman Mandal, Program Lead at Paytm. Covers production LLM pipelines, prompt evaluation, and real-time inference.",
    resource_type: "presentation",
    file_url: "#",
    file_size: "14.2 MB",
    published: true,
    created_by: "Admin",
    created_at: "2026-09-28T10:00:00Z",
  },
  {
    id: "res-2",
    title: "Building Scalable AI-Assisted Architectures (Microsoft)",
    description: "Slide deck & architecture diagrams by Mr. Shivam Behl, SDE-II at Microsoft, demonstrating agentic workflows and developer tooling.",
    resource_type: "presentation",
    file_url: "#",
    file_size: "18.5 MB",
    published: true,
    created_by: "Admin",
    created_at: "2026-09-28T11:00:00Z",
  },
  {
    id: "res-3",
    title: "Prompt Engineering Playbook for Rapid Prototyping",
    description: "Practical cheat sheet covering Few-Shot Prompting, Chain of Thought, ReAct frameworks, and structured JSON outputs.",
    resource_type: "guide",
    file_url: "#",
    file_size: "3.4 MB",
    published: true,
    created_by: "Coordinator",
    created_at: "2026-09-25T14:00:00Z",
  },
  {
    id: "res-4",
    title: "Workshop AI Starter Template (GitHub)",
    description: "Pre-configured Next.js 16 + AI SDK + Tailwind CSS starter project with ready-to-use LLM streaming hooks.",
    resource_type: "code",
    file_url: "https://github.com/nbkrist-it/prompt2production-starter",
    published: true,
    created_by: "Admin",
    created_at: "2026-09-26T08:00:00Z",
  },
  {
    id: "res-5",
    title: "Build Challenge Guidelines & Rubric Matrix",
    description: "Comprehensive rulebook, scoring criteria (Innovation, AI Integration, Tech Execution, Presentation) and submission instructions.",
    resource_type: "pdf",
    file_url: "#",
    file_size: "1.8 MB",
    published: true,
    created_by: "Admin",
    created_at: "2026-09-27T09:30:00Z",
  },
  {
    id: "res-6",
    title: "Free AI Sandbox Endpoints & Workshop API Keys",
    description: "API endpoints and sandbox keys provided courtesy of Paytm and sponsor credits for workshop participants.",
    resource_type: "link",
    file_url: "#",
    published: true,
    created_by: "Admin",
    created_at: "2026-09-28T07:00:00Z",
  },
];

export const initialTeams: Team[] = [
  {
    id: "team-1",
    event_id: "p2p-2026",
    name: "NeuralNinjas",
    invite_code: "P2P-NN01",
    leader_id: "profile-10",
    leader_name: "Sneha Reddy",
    created_at: "2026-09-20T14:00:00Z",
    members: [
      { id: "tm-1", team_id: "team-1", participant_id: "profile-10", name: "Sneha Reddy", roll_number: "22011A3110", branch: "AI & DS", is_leader: true, joined_at: "2026-09-20T14:00:00Z" },
      { id: "tm-2", team_id: "team-1", participant_id: "profile-11", name: "Akhil Babu", roll_number: "22011A3111", branch: "AI & DS", is_leader: false, joined_at: "2026-09-20T14:15:00Z" },
      { id: "tm-3", team_id: "team-1", participant_id: "profile-12", name: "Tejaswini M", roll_number: "22011A1212", branch: "IT", is_leader: false, joined_at: "2026-09-20T14:20:00Z" },
      { id: "tm-4", team_id: "team-1", participant_id: "profile-13", name: "Naveen Chowdary", roll_number: "22011A0513", branch: "CSE", is_leader: false, joined_at: "2026-09-20T14:30:00Z" },
    ],
  },
  {
    id: "team-2",
    event_id: "p2p-2026",
    name: "PromptCrafters",
    invite_code: "P2P-AI42",
    leader_id: "profile-1",
    leader_name: "Manoj N",
    created_at: "2026-09-20T15:00:00Z",
    members: [
      { id: "tm-5", team_id: "team-2", participant_id: "profile-1", name: "Manoj N", roll_number: "22011A3142", branch: "AI & DS", is_leader: true, joined_at: "2026-09-20T15:00:00Z" },
      { id: "tm-6", team_id: "team-2", participant_id: "profile-3", name: "Sai Teja K", roll_number: "23011A3118", branch: "AI & DS", is_leader: false, joined_at: "2026-09-20T15:10:00Z" },
      { id: "tm-7", team_id: "team-2", participant_id: "profile-14", name: "Deepika K", roll_number: "22011A1214", branch: "IT", is_leader: false, joined_at: "2026-09-20T15:20:00Z" },
    ],
  },
  {
    id: "team-3",
    event_id: "p2p-2026",
    name: "CodeCatalysts",
    invite_code: "P2P-CC03",
    leader_id: "profile-20",
    leader_name: "Vamsi Krishna",
    created_at: "2026-09-21T10:00:00Z",
    members: [
      { id: "tm-8", team_id: "team-3", participant_id: "profile-20", name: "Vamsi Krishna", roll_number: "22011A0520", branch: "CSE", is_leader: true, joined_at: "2026-09-21T10:00:00Z" },
      { id: "tm-9", team_id: "team-3", participant_id: "profile-21", name: "Sravani G", roll_number: "22011A0521", branch: "CSE", is_leader: false, joined_at: "2026-09-21T10:05:00Z" },
    ],
  },
];

export const initialSubmissions: ProjectSubmission[] = [
  {
    id: "sub-1",
    team_id: "team-1",
    team_name: "NeuralNinjas",
    project_name: "PaySmart Voice Agent",
    problem_statement: "Empowering rural merchants with a multilingual voice-controlled generative AI ledger and fraud assistant.",
    description: "Built using Whisper + Llama 3 on edge + FastAPI to parse vernacular Telugu/Hindi audio into structured transactions and detect anomalous payment attempts.",
    technologies: ["Next.js", "Whisper AI", "Llama-3", "FastAPI", "Tailwind CSS"],
    github_url: "https://github.com/sneha-reddy/paysmart-voice-ai",
    demo_url: "https://paysmart-ai.demo.vercel.app",
    presentation_url: "https://slides.com/neuralninjas/paysmart",
    status: "evaluated",
    scores: {
      innovation: 24,
      ai_prompting: 25,
      tech_execution: 24,
      presentation: 23,
      total: 96,
      feedback: "Exceptional concept, live voice latency under 300ms, outstanding business application for Paytm ecosystem.",
    },
    submitted_at: "2026-09-30T15:10:00Z",
  },
  {
    id: "sub-2",
    team_id: "team-2",
    team_name: "PromptCrafters",
    project_name: "HealthGen AI Triage",
    problem_statement: "Automated preliminary rural clinic triage and patient summary generator using specialized clinical prompts.",
    description: "A secure web portal using structured JSON function calling with Gemini to generate triage priority flags and doctor briefing reports.",
    technologies: ["React", "Next.js", "Gemini 1.5 Pro", "Tailwind CSS", "PostgreSQL"],
    github_url: "https://github.com/manoj-nbkrist/healthgen-ai",
    demo_url: "https://healthgen-triage.vercel.app",
    presentation_url: "https://slides.com/promptcrafters/healthgen",
    status: "submitted",
    scores: {
      innovation: 23,
      ai_prompting: 24,
      tech_execution: 23,
      presentation: 22,
      total: 92,
      feedback: "Great UI, robust guardrails against medical hallucinations, slick presentation.",
    },
    submitted_at: "2026-09-30T15:15:00Z",
  },
  {
    id: "sub-3",
    team_id: "team-3",
    team_name: "CodeCatalysts",
    project_name: "EduPrompt AutoTutor",
    problem_statement: "Personalized AI coding mentor providing interactive Socratic debugging clues rather than plain answers.",
    description: "Uses Chain of Thought prompting and AST parsing to inspect Python/JS errors and guide engineering students interactively.",
    technologies: ["Next.js", "TypeScript", "OpenAI API", "Monaco Editor"],
    github_url: "https://github.com/vamsi-krishna/eduprompt",
    status: "evaluated",
    scores: {
      innovation: 22,
      ai_prompting: 23,
      tech_execution: 22,
      presentation: 21,
      total: 88,
      feedback: "Very practical tool for academic labs, clean Socratic prompting loops.",
    },
    submitted_at: "2026-09-30T15:18:00Z",
  },
];

export const initialSupportTickets: SupportTicket[] = [
  {
    id: "sup-1",
    ticket_code: "SUP-2026-001",
    user_id: "user-2",
    user_name: "Pooja Reddy",
    registration_id: "P2P-2026-B4C77Y",
    category: "Payment",
    subject: "Payment debited but receipt confirmation email delay",
    message: "Amount of ₹100 was debited via HDFC debit card, transaction ID pay_Z8301kLm92A. Want to confirm if my ticket is generated.",
    status: "resolved",
    assigned_to: "K. V. Chaitanya",
    responses: [
      {
        id: "msg-1",
        sender_name: "K. V. Chaitanya",
        sender_role: "coordinator",
        message: "Hi Pooja, your payment of ₹100 has been verified on the server. Your ticket P2P-2026-B4C77Y is active in your dashboard.",
        created_at: "2026-09-28T11:20:00Z",
      },
    ],
    created_at: "2026-09-28T10:45:00Z",
    updated_at: "2026-09-28T11:20:00Z",
  },
  {
    id: "sup-2",
    ticket_code: "SUP-2026-002",
    user_id: "user-3",
    user_name: "Sai Teja K",
    registration_id: "P2P-2026-K9E14Z",
    category: "Team",
    subject: "Want to switch team member assignment",
    message: "I created team with invite code but my friend had a typo in roll number. Need guidance on updating team roster.",
    status: "open",
    assigned_to: "K. V. Chaitanya",
    responses: [],
    created_at: "2026-09-28T14:10:00Z",
    updated_at: "2026-09-28T14:10:00Z",
  },
  {
    id: "sup-3",
    ticket_code: "SUP-2026-003",
    user_id: "user-1",
    user_name: "Manoj N",
    registration_id: "P2P-2026-A8F92X",
    category: "Ticket",
    subject: "Google Wallet pass format query",
    message: "Can I show the downloaded PDF badge directly at the registration desk instead of phone pass?",
    status: "resolved",
    assigned_to: "Admin",
    responses: [
      {
        id: "msg-2",
        sender_name: "Admin Team",
        sender_role: "admin",
        message: "Yes Manoj! You can show either the live digital QR on your phone, Apple/Google wallet, or a printed badge. All are accepted by our scanners.",
        created_at: "2026-09-28T16:00:00Z",
      },
    ],
    created_at: "2026-09-28T15:30:00Z",
    updated_at: "2026-09-28T16:00:00Z",
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Official Workshop Kickoff at 9:00 AM Sharp!",
    content: "Welcome to Prompt to Production! Registration & check-in desks open at 8:45 AM in the Seminar Hall lobby, New CSE Block. Bring your laptops fully charged.",
    priority: "urgent",
    category: "schedule",
    published: true,
    created_at: "2026-09-28T09:00:00Z",
  },
  {
    id: "ann-2",
    title: "Keynote 1: Mr. Suman Mandal (Paytm) Live Virtual Session",
    content: "The first session commences at 9:35 AM with interactive Q&A. Submit your questions via the live dashboard portal.",
    priority: "normal",
    category: "general",
    published: true,
    created_at: "2026-09-28T09:30:00Z",
  },
  {
    id: "ann-3",
    title: "Build Challenge Rules Released - Surprise Cash Prizes!",
    content: "Hands-on AI build begins at 1:45 PM. Top 3 teams will receive cash awards and certificates of merit from Paytm & NBKRIST.",
    priority: "urgent",
    category: "challenge",
    published: true,
    created_at: "2026-09-28T12:00:00Z",
  },
  {
    id: "ann-4",
    title: "High-Speed Campus Wi-Fi Credentials",
    content: "Connect to SSID 'NBKR_P2P_AI' using password 'Prompt2026@Paytm'. Designated tech desk in Room 204 for setup help.",
    priority: "normal",
    category: "wifi",
    published: true,
    created_at: "2026-09-28T08:30:00Z",
  },
];

export const initialCertificates: Certificate[] = [
  {
    id: "cert-1",
    certificate_id: "CERT-P2P-2026-081",
    registration_id: "P2P-2026-A8F92X",
    participant_name: "Manoj N",
    roll_number: "22011A3142",
    branch: "AI & DS",
    college_name: "N.B.K.R. Institute of Science & Technology",
    type: "runner_up",
    rank: "2nd Place - AI Build Challenge",
    issue_date: "30 September 2026",
    verification_url: "/verify/CERT-P2P-2026-081",
    status: "issued",
  },
  {
    id: "cert-2",
    certificate_id: "CERT-P2P-2026-010",
    registration_id: "P2P-2026-NN010X",
    participant_name: "Sneha Reddy",
    roll_number: "22011A3110",
    branch: "AI & DS",
    college_name: "N.B.K.R. Institute of Science & Technology",
    type: "winner",
    rank: "1st Place - Winner AI Build Challenge",
    issue_date: "30 September 2026",
    verification_url: "/verify/CERT-P2P-2026-010",
    status: "issued",
  },
];
