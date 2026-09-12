import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

/** Full-bleed authed layout (no app shell) for the editor. */
export default async function EditorLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
