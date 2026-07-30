import type { Metadata } from "next";
import AdminClient from "../components/AdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal | DOMOS PROPERTY GLOBAL LIMITED",
  description: "Internal management portal for DOMOS PROPERTY admins and agents.",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
