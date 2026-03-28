"use client";

import { CollapsibleCard } from "@/components/profile/collapsible-card";
import { ProfileKeywords } from "@/components/profile/profile-keywords";
import { ResumeForm } from "../../components/profile/resume-form";
import { useCurrentUser } from "@/hooks";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const currentUser = useCurrentUser();

  return (
    <main className="w-full">
      <div className="max-w-5xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Profile
              </h1>
              <div className="mt-1">
                {currentUser.isLoading ? (
                  <ProfileNameSkeleton />
                ) : currentUser.isError ? (
                  <InlineBanner
                    tone="error"
                    title="Could not load user"
                    detail="Please try again."
                  />
                ) : currentUser.data ? (
                  <p className="text-neutral-500 text-sm">
                    {currentUser.data.name} {currentUser.data.last_name}
                  </p>
                ) : (
                  <InlineBanner
                    tone="info"
                    title="Not logged in"
                    detail="Log in to view your profile."
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <CollapsibleCard title="Keywords" defaultOpen>
              <ProfileKeywords />
            </CollapsibleCard>

            <CollapsibleCard title="Resume" defaultOpen={false}>
              <ResumeForm />
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileNameSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-40 rounded-full bg-neutral-200 animate-pulse" />
      <div className="h-4 w-24 rounded-full bg-neutral-200 animate-pulse" />
    </div>
  );
}

function InlineBanner({
  tone,
  title,
  detail,
}: {
  tone: "info" | "error";
  title: string;
  detail?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "error"
          ? "border-error-200 bg-error-50 text-error-700"
          : "border-primary-100 bg-primary-50 text-primary-800"
      )}
    >
      <span className="font-semibold">{title}</span>
      {detail ? <span className="opacity-80"> — {detail}</span> : null}
    </div>
  );
}
