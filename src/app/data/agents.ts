export interface AgentProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  whatsapp: string;
  officeAddress: string;
  cacNumber: string; // e.g. RC: 7482910
  profileImage?: string;
  status: 'pending' | 'approved' | 'banned';
  role: 'agent' | 'super_admin';
  telegramChatId?: string;
  createdAt?: string;
}

export const INITIAL_AGENTS: AgentProfile[] = [
  {
    id: "agent-main",
    name: "DOMOS PROPERTY GLOBAL LIMITED (Headquarters)",
    email: "domospropertygloballimited@gmail.com",
    whatsapp: "07073537007",
    officeAddress: "Suit 4, DOMOS Plaza, University Road, Ekpoma, Edo State",
    cacNumber: "RC: 7482910",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "super_admin",
    createdAt: "July 1, 2026",
  },
  {
    id: "agent-qw06zmm",
    name: "miah homes",
    email: "jere74516@gmail.com",
    whatsapp: "9158944028",
    officeAddress: "Ekpoma, Edo State",
    cacNumber: "RC: Pending",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "August 3, 2026",
  },
  {
    id: "agent-svep1l7",
    name: "Ekpoma Housing Agent",
    email: "gideonodine19@gmail.com",
    whatsapp: "09049810476",
    officeAddress: "Ekpoma, Edo State",
    cacNumber: "RC: Pending",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "August 3, 2026",
  },
  {
    id: "agent-a2i1zif",
    name: "Ehis",
    email: "bt907690@gmail.com",
    whatsapp: "07073537007",
    officeAddress: "Ekpoma, Edo State",
    cacNumber: "RC: Pending",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "August 2, 2026",
  },
  {
    id: "agent-8t57tzd",
    name: "Chukwu",
    email: "clementchima9@gmail.com",
    whatsapp: "07045636039",
    officeAddress: "Ekpoma, Edo State",
    cacNumber: "RC: Pending",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "August 2, 2026",
  },
  {
    id: "agent-xbt1ng9",
    name: "JIm Ovia",
    email: "activesender@outlook.com",
    whatsapp: "09063101599",
    officeAddress: "Ekpoma, Edo State",
    cacNumber: "RC: Pending",
    profileImage: "/images/ehis_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "August 2, 2026",
  },
];

