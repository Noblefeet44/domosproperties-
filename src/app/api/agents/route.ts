import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
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
    const supabase = createPublicClient();
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

    // Check for duplicate email or WhatsApp in database first
    const supabase = createPublicClient();
    if (supabase) {
      // Check duplicate email
      const { data: existingEmail } = await supabase
        .from("agent_profiles")
        .select("id, name")
        .eq("email", (body.email || "").trim().toLowerCase())
        .maybeSingle();

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: `An agent account with this email already exists (${existingEmail.name}). Please sign in instead.` },
          { status: 409 }
        );
      }

      // Check duplicate WhatsApp
      const { data: existingPhone } = await supabase
        .from("agent_profiles")
        .select("id, name")
        .eq("whatsapp", body.whatsapp || "")
        .maybeSingle();

      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: `This WhatsApp number is already registered to another agent (${existingPhone.name}). Each agent must use a unique phone number.` },
          { status: 409 }
        );
      }
    }

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
    const { id, status, name, whatsapp, email, officeAddress, cacNumber, profileImage, role } = body;
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Build update payload
    const updateFields: Partial<AgentProfile> = {};
    if (status) updateFields.status = status;
    if (name !== undefined) updateFields.name = name;
    if (whatsapp !== undefined) updateFields.whatsapp = whatsapp;
    if (email !== undefined) updateFields.email = email;
    if (officeAddress !== undefined) updateFields.officeAddress = officeAddress;
    if (cacNumber !== undefined) updateFields.cacNumber = cacNumber;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;
    if (role !== undefined) updateFields.role = role;

    const currentMemory = getMemoryAgents();
    const updatedMemory = currentMemory.map((a) =>
      a.id === id ? { ...a, ...updateFields } : a
    );
    setMemoryAgents(updatedMemory);

    const supabase = createPublicClient();
    if (supabase) {
      const dbUpdate: Record<string, any> = {};
      if (status) dbUpdate.status = status;
      if (name !== undefined) dbUpdate.name = name;
      if (whatsapp !== undefined) dbUpdate.whatsapp = whatsapp;
      if (email !== undefined) dbUpdate.email = email;
      if (officeAddress !== undefined) dbUpdate.office_address = officeAddress;
      if (cacNumber !== undefined) dbUpdate.cac_number = cacNumber;
      if (profileImage !== undefined) dbUpdate.profile_image = profileImage;
      if (role !== undefined) dbUpdate.role = role;

      const { error } = await supabase.from("agent_profiles").update(dbUpdate).eq("id", id);
      if (error) console.warn("Supabase agent update error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
