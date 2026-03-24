"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TabSwitcher from "@/components/ui/tab-switcher";

const TABS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "alltime", label: "All Time" },
];

export default function PeriodTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "alltime";

  function handleChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", id);
    router.push(`?${params.toString()}`);
  }

  return <TabSwitcher tabs={TABS} activeTab={current} onChange={handleChange} />;
}
