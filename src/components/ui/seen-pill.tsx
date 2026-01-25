import { cn } from "@/lib/utils";
import React from "react";

interface SeenPillProps {
  className?: string;
}

const SeenPill = ({ className }: SeenPillProps) => {
  return (
    <div className={cn(`text-sm font-semibold`, className)}>
      <p>Seen</p>
    </div>
  );
};

export default SeenPill;
