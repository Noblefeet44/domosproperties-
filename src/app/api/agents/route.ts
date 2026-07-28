import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_AGENTS, AgentProfile } from "../../data/agents";

// Memory fallback store for agent profiles across devices
const globalForAgents = globalThis as unknown as {
  serverAgentsStore: AgentProfile[];
};

if (!globalForAgents.serverAgentsStore) {
  globalForAgents.serverAgentsStore = [...INITIAL_AGENTS];
}

const getMemoryAgents = (): AgentProfile[] => {
  return globalForAgents.serverAgentsStore;
};

const setMemoryAgents = (agents: AgentProfile[]) => {
  globalForAgents.serverAgentsStore = agents;
};

export async function GET() {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formattedAgents: AgentProfile[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          email: item.email,
          whatsapp: item.whatsapp,
          officeAddress: item.office_address,
          cacNumber: item.cac_number,
          profileImage: item.profile_image,
          status: item.status || "approved",
          role: item.role || "agent",
          createdAt: item.created_at,
        }));
        setMemoryAgents(formattedAgents);
        return NextResponse.json(formattedAgents);
      }
    }
  } catch (err) {
    console.warn("Supabase query agents fallback:", err);
  }

  return NextResponse.json(getMemoryAgents());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || "agent-" + Math.random().toString(36).substring(2, 9);

    const newAgent: AgentProfile = {
      id,
      name: body.name,
      email: body.email,
      password: body.password || "Password123",
      whatsapp: body.whatsapp,
      officeAddress: body.officeAddress,
      cacNumber: body.cacNumber || "RC: Pending",
      profileImage: body.profileImage || "/images/ehis_hostel.png",
      status: body.status || "approved", // default approved or pending
      role: body.role || "agent",
      createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    };

    const currentMemory = getMemoryAgents();
    const updatedMemory = [newAgent, ...currentMemory.filter((a) => a.id !== newAgent.id && a.email !== newAgent.email)];
    setMemoryAgents(updatedMemory);

    const supabase = await createClient();
    if (supabase) {
      const dbPayload = {
        id,
        name: body.name,
        email: body.email,
        password_hash: body.password || "Password123",
        whatsapp: body.whatsapp,
        office_address: body.officeAddress,
        cac_number: body.cacNumber,
        profile_image: body.profileImage,
        status: newAgent.status,
        role: newAgent.role,
      };

      await supabase.from("agent_profiles").upsert([dbPayload]);
    }

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Agent ID and status required" }, { status: 400 });
    }

    const currentMemory = getMemoryAgents();
    const updatedMemory = currentMemory.map((a) => (a.id === id ? { ...a, status } : a));
    setMemoryAgents(updatedMemory);

    const supabase = await createClient();
    if (supabase) {
      await supabase.from("agent_profiles").update({ status }).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
