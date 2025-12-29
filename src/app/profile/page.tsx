"use client";

import { CollapsibleCard } from "@/components/profile/collapsible-card";
import { ProfileKeywords } from "@/components/profile/profile-keywords";
import { ResumeForm } from "../../components/profile/resume-form";
import { useCurrentUser, useParseResume } from "@/hooks";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const currentUser = useCurrentUser();
  const parseResume = useParseResume();

  const handleParsingResume = async () => {
    const formData = new FormData();
    const resume = await fetch("/assets/Diego_Scarpati_Resume.docx");
    if (!resume.ok) {
      throw new Error("Failed to fetch resume file");
    }
    const blob = await resume.blob();
    const file = new File([blob], "Diego_Scarpati_Resume.docx", {
      type: blob.type,
    });

    formData.append("resume", file); // field name must match backend

    return await parseResume.mutateAsync(formData);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="bg-congress-blue-900 rounded-[calc(2rem+1rem)] p-4">
        <div className="space-y-4 w-full bg-background rounded-4xl px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-congress-blue-900">
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
                  <p className="text-sm text-congress-blue-900/70">
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

          <div>
            <button
              type="button"
              onClick={() => {
                handleParsingResume();
              }}
              className="flex p-3 py-1.5 border border-congress-blue-900 text-congress-blue-300 rounded-full font-semibold bg-congress-blue-900 hover:bg-congress-blue-500 hover:border-congress-blue-500 hover:text-congress-blue-100 transition-colors items-center justify-center text-sm cursor-pointer"
            >
              Parse Resume
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-4">
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
      <div className="h-4 w-40 rounded-full bg-congress-blue-900/10 animate-pulse" />
      <div className="h-4 w-24 rounded-full bg-congress-blue-900/10 animate-pulse" />
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
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-congress-blue-200 bg-congress-blue-50 text-congress-blue-900"
      )}
    >
      <span className="font-semibold">{title}</span>
      {detail ? <span className="opacity-80"> — {detail}</span> : null}
    </div>
  );
}
