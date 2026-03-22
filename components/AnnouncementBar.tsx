"use client";

import { CHANNEL } from "@/lib/channel";

export function AnnouncementBar() {
  return (
    <div className="bg-navy-950 text-white py-2 text-center">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <p className="text-xs font-medium tracking-wide text-white/80">
          {CHANNEL.id !== "all"
            ? `${CHANNEL.name} Pro Sales Portal — Contact your ABG rep for volume pricing`
            : "Pro Sales Portal — Browse the full ABG product catalog. Quote requests responded within 1 business day."}
        </p>
      </div>
    </div>
  );
}
