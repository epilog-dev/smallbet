import type { Metadata } from "next";
import { NewProjectFlow } from "@/components/app/intake/NewProjectFlow";

export const metadata: Metadata = { title: "New idea" };

export default function NewProjectPage() {
  return <NewProjectFlow />;
}
