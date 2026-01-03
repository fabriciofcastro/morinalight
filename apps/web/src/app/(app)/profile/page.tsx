import type { Metadata } from "next";

import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Meu Perfil — MORINA",
  description: "Gerencie seu perfil pessoal, segurança e preferências.",
};

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProfileClient />;
}

