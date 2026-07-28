import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_AGENTS, AgentProfile } from "../../data/agents";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check Master Super-Admin Override
    const adminPass = process.env.ADMIN_PASSWORD || "Admin@password";
    if (
      email === "superadmin@domosproperties.com" ||
      email === "admin" ||
      (email === "domospropertygloballimited@gmail.com" && password === adminPass) ||
      (email === "info@domosproperties.com" && password === adminPass)
    ) {
      const superAdminProfile: AgentProfile = {
        id: "agent-main",
        name: "DOMOS PROPERTY GLOBAL LIMITED (Super-Admin)",
        email: "domospropertygloballimited@gmail.com",
        whatsapp: "07073537007",
        officeAddress: "Suit 4, DOMOS Plaza, University Road, Ekpoma, Edo State",
        cacNumber: "RC: 7482910",
        profileImage: "/images/ehis_hostel.png",
        status: "approved",
        role: "super_admin",
      };
      return NextResponse.json({ success: true, agent: superAdminProfile });
    }

    // Query Supabase for Agent credentials
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (!error && data) {
        if (data.status === "banned") {
          return NextResponse.json({ error: "Your agent account has been suspended by Super-Admin." }, { status: 403 });
        }
        if (data.status === "pending") {
          return NextResponse.json({ error: "Your agent account is currently pending Super-Admin approval." }, { status: 403 });
        }
        if (data.password_hash === password) {
          const agentProfile: AgentProfile = {
            id: String(data.id),
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            officeAddress: data.office_address,
            cacNumber: data.cac_number,
            profileImage: data.profile_image,
            status: data.status,
            role: data.role || "agent",
          };
          return NextResponse.json({ success: true, agent: agentProfile });
        } else {
          return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
        }
      }
    }

    // Fallback to initial local memory agents check
    const matchedAgent = INITIAL_AGENTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedAgent) {
      if (matchedAgent.status === "banned") {
        return NextResponse.json({ error: "Your agent account has been suspended by Super-Admin." }, { status: 403 });
      }
      return NextResponse.json({ success: true, agent: matchedAgent });
    }

    return NextResponse.json({ error: "No registered agent found with this email." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
