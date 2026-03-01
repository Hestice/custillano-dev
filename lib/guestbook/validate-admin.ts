import { cookies } from "next/headers";
import { createAnonClient } from "@/lib/supabase/client";

export async function validateAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return false;
  return data.user.email?.toLowerCase() === adminEmail.toLowerCase();
}
