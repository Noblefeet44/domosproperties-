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
    id: "agent-ehis",
    name: "Ehis Real Estate & Management Consult",
    email: "ehis@domosproperties.com",
    whatsapp: "08012345678",
    officeAddress: "No. 12 AAU Main Gate Expressway, Ekpoma, Edo State",
    cacNumber: "RC: 3948120",
    profileImage: "/images/treasure_hostel.png",
    status: "approved",
    role: "agent",
    createdAt: "July 10, 2026",
  }
];
