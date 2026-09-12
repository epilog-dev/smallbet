import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/shell/AppShell";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await getUser();
  if (!user) redirect("/login?next=/app");
  return <AppShell email={user.email ?? "you"}>{children}</AppShell>;
}
