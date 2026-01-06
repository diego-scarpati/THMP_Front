"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FilterOption from "@/components/jobs/filter-option";
import { cn } from "@/lib/utils";
import {
  useCreateResume,
  useDeleteResume,
  useResume,
  useUpdateResume,
  useParseResume,
} from "@/hooks";
import type {
  CreateResumeRequest,
  Resume,
  UpdateResumeRequest,
} from "@/types/api";
import { normalizeOptionalISODate } from "@/utils/normalizeDates";

type Mode = "create" | "update";

const PRESENT_SENTINEL = "__PRESENT__";

const emptyResumeDraft: CreateResumeRequest = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  educations: [],
  work_experiences: [],
  certifications: [],
  projects: [],
  hobbies: [],
  languages: [],
  references: [],
  resume_skills: [],
};

function isAllowedResumeFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")
  );
}

function normalizeIncomingDate(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  if (!s) return "";
  // Accept both YYYY-MM-DD and full ISO timestamps; keep the date part.
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function pickArray<T = any>(source: unknown, keys: string[]): T[] {
  if (!source || typeof source !== "object") return [];
  const obj = source as Record<string, unknown>;
  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function ResumePreviewPortal({
  open,
  file,
  url,
  onClose,
}: {
  open: boolean;
  file: File | null;
  url: string | null;
  onClose: () => void;
}) {
  const docxContainerRef = useRef<HTMLDivElement | null>(null);
  const [docxBusy, setDocxBusy] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);

  const ext = (file?.name ?? "").toLowerCase();
  const isPdf = ext.endsWith(".pdf");
  const isDocx = ext.endsWith(".docx");
  const isDoc = ext.endsWith(".doc");

  useEffect(() => {
    if (!open) return;
    if (!file) return;
    if (!isDocx) return;

    let cancelled = false;
    setDocxError(null);
    setDocxBusy(true);

    (async () => {
      const mod = await import("docx-preview");
      if (cancelled) return;
      if (!docxContainerRef.current) return;
      docxContainerRef.current.innerHTML = "";
      await mod.renderAsync(file, docxContainerRef.current);
    })()
      .catch((e) => {
        if (cancelled) return;
        setDocxError(e instanceof Error ? e.message : "Failed to render DOCX");
      })
      .finally(() => {
        if (cancelled) return;
        setDocxBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, file, isDocx]);

  if (!open) return null;
  if (!file) return null;
  if (!url) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-congress-blue-900/30 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-congress-blue-900/15 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-congress-blue-900/15">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-congress-blue-900/70">
              Preview
            </div>
            <div className="truncate text-sm font-semibold text-congress-blue-900">
              {file.name}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-congress-blue-900/15 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          {isPdf ? (
            <iframe
              src={url}
              className="h-[70vh] w-full rounded-2xl border border-congress-blue-900/15"
              title="Resume preview"
            />
          ) : isDocx ? (
            <div className="h-[70vh] overflow-auto rounded-2xl border border-congress-blue-900/15 p-4">
              {docxBusy ? (
                <div className="text-sm text-congress-blue-900/70">
                  Rendering document…
                </div>
              ) : null}
              {docxError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  <span className="font-semibold">Could not render DOCX</span>
                  <span className="opacity-80"> — {docxError}</span>
                </div>
              ) : null}
              <div ref={docxContainerRef} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-congress-blue-900/70">
                In-browser preview for .doc files may be limited.
              </div>
              <iframe
                src={url}
                className="h-[70vh] w-full rounded-2xl border border-congress-blue-900/15"
                title="Resume preview"
              />
            </div>
          )}

          {isDoc ? (
            <div className="mt-3 text-xs text-congress-blue-900/60">
              If the preview is blank, try uploading a .pdf or .docx.
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

function toDateInput(value?: string) {
  if (!value) return "";
  if (value === PRESENT_SENTINEL) return "";
  // If the API returns an ISO date time, normalize.
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function PresentToggle({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 pl-1 text-xs font-semibold text-congress-blue-900/80 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 accent-congress-blue-900"
      />
      Present
    </label>
  );
}

export function ResumeForm() {
  const resumeQuery = useResume();
  const createResume = useCreateResume();
  const updateResume = useUpdateResume();
  const deleteResume = useDeleteResume();
  const parseResume = useParseResume();

  const [draft, setDraft] = useState<CreateResumeRequest>(emptyResumeDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mode: Mode = useMemo(() => {
    return resumeQuery.data ? "update" : "create";
  }, [resumeQuery.data]);

  const readOnly = mode === "update" && !isEditing;
  const canEdit = mode === "create" || isEditing;

  const hydrateDraftFromResume = (r: Resume) => {
    const legacyResumeSkills = (r as unknown as { resume_skills?: any[] })
      .resume_skills;
    const resumeSkills = (r as Resume).resumeSkills ?? legacyResumeSkills ?? [];

    const educationsRaw = pickArray<any>(r, ["educations", "Education"]);
    const workExperiencesRaw = pickArray<any>(r, [
      "work_experiences",
      "workExperiences",
      "WorkExperiences",
    ]);
    const certificationsRaw = pickArray<any>(r, [
      "certifications",
      "Certifications",
    ]);
    const projectsRaw = pickArray<any>(r, ["projects", "Projects"]);
    const hobbiesRaw = pickArray<any>(r, ["hobbies", "Hobbies"]);
    const languagesRaw = pickArray<any>(r, ["languages", "Languages"]);
    const referencesRaw = pickArray<any>(r, ["references", "References"]);

    setDraft({
      first_name: r.first_name ?? "",
      last_name: r.last_name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      address: r.address ?? "",
      summary: r.summary ?? "",
      educations: educationsRaw.map((e) => {
        const { id: _id, resume_id: _resumeId, ...rest } = e;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
        };
      }),
      work_experiences: workExperiencesRaw.map((w) => {
        const { id: _id, resume_id: _resumeId, ...rest } = w;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
          responsibilities: rest.responsibilities ?? [],
        };
      }),
      certifications: certificationsRaw.map((c) => {
        const { id: _id, resume_id: _resumeId, ...rest } = c;
        return {
          ...rest,
          issue_date: normalizeIncomingDate(rest.issue_date),
          expiration_date: normalizeIncomingDate(rest.expiration_date),
        };
      }),
      projects: projectsRaw.map((p) => {
        const { id: _id, resume_id: _resumeId, ...rest } = p;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
        };
      }),
      hobbies: hobbiesRaw.map((h) => ({ hobby: h?.hobby ?? String(h ?? "") })),
      languages: languagesRaw.map((l) => {
        const { id: _id, resume_id: _resumeId, ...rest } = l;
        return {
          ...rest,
        };
      }),
      references: referencesRaw.map((ref) => {
        const { id: _id, resume_id: _resumeId, ...rest } = ref;
        return rest;
      }),
      resume_skills: Array.isArray(resumeSkills)
        ? resumeSkills.map((rs: any) => ({
            skill_id: rs?.skill_id,
            title: rs?.skill?.title ?? rs?.Skill?.title ?? rs?.title,
          }))
        : [],
    });
  };

  useEffect(() => {
    const r = resumeQuery.data as Resume | undefined;
    if (!r) {
      setDraft(emptyResumeDraft);
      setIsEditing(true);
      return;
    }
    setIsEditing(false);
    hydrateDraftFromResume(r);
  }, [resumeQuery.data]);

  useEffect(() => {
    if (!resumeFile) {
      setResumePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resumeFile]);

  const busy =
    resumeQuery.isLoading ||
    createResume.isPending ||
    updateResume.isPending ||
    deleteResume.isPending ||
    parseResume.isPending;

  const toggleEdit = () => {
    if (busy) return;
    if (mode !== "update") return;

    if (isEditing) {
      const r = resumeQuery.data as Resume | undefined;
      if (r) hydrateDraftFromResume(r);
    }
    setIsEditing((v) => !v);
  };

  const handleSelectedResumeFile = (file: File) => {
    if (!isAllowedResumeFile(file)) {
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    parseResume.reset?.();
  };

  const analyseByAI = async () => {
    if (!canEdit) return;
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);

    const parsed = await parseResume.mutateAsync(formData);

    const legacyResumeSkills = (parsed as unknown as { resume_skills?: any[] })
      .resume_skills;
    const resumeSkills =
      (parsed as Resume).resumeSkills ?? legacyResumeSkills ?? [];

    const educationsRaw = pickArray<any>(parsed, ["educations", "Education"]);
    const workExperiencesRaw = pickArray<any>(parsed, [
      "work_experiences",
      "workExperiences",
      "WorkExperiences",
    ]);
    const certificationsRaw = pickArray<any>(parsed, [
      "certifications",
      "Certifications",
    ]);
    const projectsRaw = pickArray<any>(parsed, ["projects", "Projects"]);
    const hobbiesRaw = pickArray<any>(parsed, ["hobbies", "Hobbies"]);
    const languagesRaw = pickArray<any>(parsed, ["languages", "Languages"]);
    const referencesRaw = pickArray<any>(parsed, ["references", "References"]);

    setDraft((d) => ({
      ...d,
      first_name: parsed.first_name ?? d.first_name ?? "",
      last_name: parsed.last_name ?? d.last_name ?? "",
      email: parsed.email ?? d.email ?? "",
      phone: parsed.phone ?? d.phone ?? "",
      address: parsed.address ?? d.address ?? "",
      summary: parsed.summary ?? d.summary ?? "",
      educations: educationsRaw.map((e) => {
        const { id: _id, resume_id: _resumeId, ...rest } = e;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
        };
      }),
      work_experiences: workExperiencesRaw.map((w) => {
        const { id: _id, resume_id: _resumeId, ...rest } = w;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
          responsibilities: rest.responsibilities ?? [],
        };
      }),
      certifications: certificationsRaw.map((c) => {
        const { id: _id, resume_id: _resumeId, ...rest } = c;
        return {
          ...rest,
          issue_date: normalizeIncomingDate(rest.issue_date),
          expiration_date: normalizeIncomingDate(rest.expiration_date),
        };
      }),
      projects: projectsRaw.map((p) => {
        const { id: _id, resume_id: _resumeId, ...rest } = p;
        return {
          ...rest,
          start_date: normalizeIncomingDate(rest.start_date),
          end_date: rest.end_date
            ? normalizeIncomingDate(rest.end_date)
            : PRESENT_SENTINEL,
        };
      }),
      hobbies: hobbiesRaw.map((h) => ({ hobby: h?.hobby ?? String(h ?? "") })),
      languages: languagesRaw.map((l) => {
        const { id: _id, resume_id: _resumeId, ...rest } = l;
        return {
          ...rest,
        };
      }),
      references: referencesRaw.map((ref) => {
        const { id: _id, resume_id: _resumeId, ...rest } = ref;
        return rest;
      }),
      resume_skills: Array.isArray(resumeSkills)
        ? resumeSkills.map((rs: any) => ({
            skill_id: rs?.skill_id,
            title: rs?.skill?.title ?? rs?.Skill?.title ?? rs?.title,
          }))
        : d.resume_skills ?? [],
    }));
  };

  const onSave = async () => {
    const normalized: CreateResumeRequest = {
      ...draft,
      educations: (draft.educations ?? []).map((e) => ({
        ...e,
        start_date: normalizeOptionalISODate(e.start_date) ?? "",
        end_date:
          e.end_date === PRESENT_SENTINEL
            ? ""
            : normalizeOptionalISODate(e.end_date) ?? "",
      })),
      work_experiences: (draft.work_experiences ?? []).map((w) => ({
        ...w,
        start_date: normalizeOptionalISODate(w.start_date) ?? "",
        end_date:
          w.end_date === PRESENT_SENTINEL
            ? ""
            : normalizeOptionalISODate(w.end_date) ?? "",
        responsibilities: w.responsibilities ?? [],
      })),
      certifications: (draft.certifications ?? []).map((c) => ({
        ...c,
        issue_date: normalizeOptionalISODate(c.issue_date) ?? "",
        expiration_date:
          normalizeOptionalISODate(c.expiration_date) ?? undefined,
      })),
      projects: (draft.projects ?? []).map((p) => ({
        ...p,
        start_date: normalizeOptionalISODate(p.start_date) ?? undefined,
        end_date:
          p.end_date === PRESENT_SENTINEL
            ? undefined
            : normalizeOptionalISODate(p.end_date) ?? undefined,
      })),
    };

    if (mode === "create") {
      await createResume.mutateAsync(normalized);
      return;
    }

    const payload: UpdateResumeRequest = {
      ...normalized,
    };
    await updateResume.mutateAsync(payload);
  };

  const onDelete = async () => {
    await deleteResume.mutateAsync();
  };

  return (
    <div className="flex flex-col gap-5">
      {resumeQuery.isLoading ? <ResumeSkeleton /> : null}
      {resumeQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <span className="font-semibold">Could not load resume</span>
          <span className="opacity-80">
            {" "}
            — you can still create a new one below.
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-[14px]/[14px] text-congress-blue-900/70">
          {resumeQuery.isLoading
            ? "Loading resume…"
            : mode === "create"
            ? "No resume found yet — fill this out and save."
            : "Resume loaded — edit and save your changes."}
        </p>

        <div className="flex items-center gap-2" id="creationButtos">
          {mode === "create" ? (
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className={cn(
                "rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50",
                busy && "opacity-60 cursor-not-allowed"
              )}
            >
              Create
            </button>
          ) : (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={busy}
                  className={cn(
                    "rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50",
                    busy && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Save
                </button>
              ) : null}

              {isEditing ? (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={busy}
                  className={cn(
                    "rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50",
                    busy && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Delete
                </button>
              ) : null}

              <button
                type="button"
                onClick={toggleEdit}
                disabled={busy}
                className={cn(
                  "rounded-full border border-congress-blue-900/15 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50",
                  busy && "opacity-60 cursor-not-allowed"
                )}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </>
          )}
        </div>
      </div>

      {canEdit ? (
        <div className="flex items-center justify-center p-4">
          <div className="w-4/5">
            <div
              className={cn(
                "rounded-2xl border border-congress-blue-900/15 bg-congress-blue-100 p-4 flex items-center flex-col gap-2 text-center",
                dropActive && "bg-congress-blue-50"
              )}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropActive(false);
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                handleSelectedResumeFile(file);
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-congress-blue-900">
                  Drag and drop your resume here
                </div>
                <div className="text-xs text-congress-blue-900/70">
                  Formats accepted: .pdf, .doc, .docx
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleSelectedResumeFile(file);
                    e.currentTarget.value = "";
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50",
                      busy && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    Search files
                  </button>

                  {resumeFile ? (
                    <div className="min-w-0 flex items-start justify-center gap-1">
                      <div className="text-xs/[14px] font-semibold text-congress-blue-900/70">
                        Attached:
                      </div>
                      <div className="truncate text-sm/[14px] text-congress-blue-900/70">
                        {resumeFile.name}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3">
                    {resumeFile && resumePreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="rounded-full border border-congress-blue-900/15 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
                        title="Preview the attached file"
                      >
                        Preview
                      </button>
                    ) : null}

                    {resumeFile ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={analyseByAI}
                        className={cn(
                          "rounded-full border border-congress-blue-900 bg-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
                          busy && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        Autocomplete with AI
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {parseResume.isPending ? (
                <div className="mt-3 text-sm text-congress-blue-900/70">
                  Parsing resume…
                </div>
              ) : null}
              {parseResume.isError ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  <span className="font-semibold">Could not parse resume</span>
                  <span className="opacity-80">
                    {" "}
                    — please try a different file.
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ResumePreviewPortal
        open={previewOpen}
        file={resumeFile}
        url={resumePreviewUrl}
        onClose={() => setPreviewOpen(false)}
      />

      <Section title="Contact">
        <div className="flex flex-wrap gap-3">
          <FilterOption
            title="First Name"
            type="text"
            value={draft.first_name}
            onChange={(v) => setDraft((d) => ({ ...d, first_name: v }))}
            placeholder="John"
            className="max-w-none"
            labelBackground="bg-white"
            disabled={readOnly}
          />
          <FilterOption
            title="Last Name"
            type="text"
            value={draft.last_name}
            onChange={(v) => setDraft((d) => ({ ...d, last_name: v }))}
            placeholder="Doe"
            className="max-w-none"
            labelBackground="bg-white"
            disabled={readOnly}
          />
          <FilterOption
            title="Email"
            type="text"
            value={draft.email}
            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
            placeholder="john@doe.com"
            className="max-w-none"
            labelBackground="bg-white"
            disabled={readOnly}
          />
          <FilterOption
            title="Phone"
            type="text"
            value={draft.phone}
            onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            placeholder="+61 400 000 000"
            className="max-w-none"
            labelBackground="bg-white"
            disabled={readOnly}
          />
          <div className="w-full">
            <FilterOption
              title="Address"
              type="text"
              value={draft.address}
              onChange={(v) => setDraft((d) => ({ ...d, address: v }))}
              placeholder="Sydney, NSW"
              className="max-w-none"
              labelBackground="bg-white"
              disabled={readOnly}
            />
          </div>
        </div>
      </Section>

      <Section title="Summary">
        <div className="relative border border-congress-blue-900 rounded-2xl px-3 py-2">
          <label className="absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 bg-white z-10">
            Summary
          </label>
          <textarea
            value={draft.summary ?? ""}
            readOnly={readOnly}
            onChange={(e) =>
              setDraft((d) => ({ ...d, summary: e.target.value }))
            }
            placeholder="A few lines that describe your experience and focus…"
            className="min-h-[90px] w-full resize-y text-sm outline-none bg-transparent text-congress-blue-900"
          />
        </div>
      </Section>

      <Section title="Work Experience">
        <ListEditor
          items={draft.work_experiences ?? []}
          emptyLabel="No work experiences"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              work_experiences: [
                ...(d.work_experiences ?? []),
                {
                  company: "",
                  position: "",
                  start_date: "",
                  end_date: "",
                  responsibilities: [],
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              work_experiences: (d.work_experiences ?? []).filter(
                (_, i) => i !== index
              ),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <FilterOption
                  title="Company"
                  type="text"
                  value={item.company}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      work_experiences: (d.work_experiences ?? []).map((w, i) =>
                        i === index ? { ...w, company: v } : w
                      ),
                    }))
                  }
                  placeholder="Company"
                  className="max-w-none"
                  labelBackground="bg-white"
                  disabled={readOnly}
                />
                <FilterOption
                  title="Position"
                  type="text"
                  value={item.position}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      work_experiences: (d.work_experiences ?? []).map((w, i) =>
                        i === index ? { ...w, position: v } : w
                      ),
                    }))
                  }
                  placeholder="Role"
                  className="max-w-none"
                  labelBackground="bg-white"
                  disabled={readOnly}
                />
                <FilterOption
                  title="Start"
                  type="date"
                  value={toDateInput(item.start_date)}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      work_experiences: (d.work_experiences ?? []).map((w, i) =>
                        i === index ? { ...w, start_date: v } : w
                      ),
                    }))
                  }
                  className="max-w-none"
                  labelBackground="bg-white"
                  disabled={readOnly}
                />
                <FilterOption
                  title="End"
                  type="date"
                  value={toDateInput(item.end_date)}
                  disabled={readOnly || item.end_date === PRESENT_SENTINEL}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      work_experiences: (d.work_experiences ?? []).map((w, i) =>
                        i === index ? { ...w, end_date: v } : w
                      ),
                    }))
                  }
                  className="max-w-none"
                  labelBackground="bg-white"
                />

                <PresentToggle
                  checked={item.end_date === PRESENT_SENTINEL}
                  disabled={readOnly}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({
                      ...d,
                      work_experiences: (d.work_experiences ?? []).map((w, i) =>
                        i === index
                          ? { ...w, end_date: checked ? PRESENT_SENTINEL : "" }
                          : w
                      ),
                    }))
                  }
                />
              </div>

              <TagListEditor
                title="Responsibilities"
                placeholder="Add responsibility"
                items={item.responsibilities ?? []}
                readOnly={readOnly}
                bgColor="bg-white"
                onChange={(next) =>
                  setDraft((d) => ({
                    ...d,
                    work_experiences: (d.work_experiences ?? []).map((w, i) =>
                      i === index ? { ...w, responsibilities: next } : w
                    ),
                  }))
                }
              />
            </div>
          )}
        />
      </Section>

      <Section title="Education">
        <ListEditor
          items={draft.educations ?? []}
          emptyLabel="No education entries"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              educations: [
                ...(d.educations ?? []),
                {
                  institution: "",
                  degree: "",
                  field_of_study: "",
                  start_date: "",
                  end_date: "",
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              educations: (d.educations ?? []).filter((_, i) => i !== index),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-wrap gap-3">
              <FilterOption
                title="Institution"
                type="text"
                value={item.institution}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index ? { ...e, institution: v } : e
                    ),
                  }))
                }
                placeholder="University"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Degree"
                type="text"
                value={item.degree}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index ? { ...e, degree: v } : e
                    ),
                  }))
                }
                placeholder="BSc"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Field"
                type="text"
                value={item.field_of_study}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index ? { ...e, field_of_study: v } : e
                    ),
                  }))
                }
                placeholder="Computer Science"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Start"
                type="date"
                value={toDateInput(item.start_date)}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index ? { ...e, start_date: v } : e
                    ),
                  }))
                }
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="End"
                type="date"
                value={toDateInput(item.end_date)}
                disabled={readOnly || item.end_date === PRESENT_SENTINEL}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index ? { ...e, end_date: v } : e
                    ),
                  }))
                }
                className="max-w-none"
                labelBackground="bg-white"
              />

              <PresentToggle
                checked={item.end_date === PRESENT_SENTINEL}
                disabled={readOnly}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({
                    ...d,
                    educations: (d.educations ?? []).map((e, i) =>
                      i === index
                        ? { ...e, end_date: checked ? PRESENT_SENTINEL : "" }
                        : e
                    ),
                  }))
                }
              />
            </div>
          )}
        />
      </Section>

      <Section title="Certifications">
        <ListEditor
          items={draft.certifications ?? []}
          emptyLabel="No certifications"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              certifications: [
                ...(d.certifications ?? []),
                {
                  name: "",
                  issuing_organization: "",
                  issue_date: "",
                  expiration_date: "",
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              certifications: (d.certifications ?? []).filter(
                (_, i) => i !== index
              ),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-wrap gap-3">
              <FilterOption
                title="Name"
                type="text"
                value={item.name}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    certifications: (d.certifications ?? []).map((c, i) =>
                      i === index ? { ...c, name: v } : c
                    ),
                  }))
                }
                placeholder="AWS Solutions Architect"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Issuer"
                type="text"
                value={item.issuing_organization}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    certifications: (d.certifications ?? []).map((c, i) =>
                      i === index ? { ...c, issuing_organization: v } : c
                    ),
                  }))
                }
                placeholder="Amazon"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Issue"
                type="date"
                value={toDateInput(item.issue_date)}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    certifications: (d.certifications ?? []).map((c, i) =>
                      i === index ? { ...c, issue_date: v } : c
                    ),
                  }))
                }
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Expires"
                type="date"
                value={toDateInput(item.expiration_date)}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    certifications: (d.certifications ?? []).map((c, i) =>
                      i === index ? { ...c, expiration_date: v } : c
                    ),
                  }))
                }
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
            </div>
          )}
        />
      </Section>

      <Section title="Projects">
        <ListEditor
          items={draft.projects ?? []}
          emptyLabel="No projects"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              projects: [
                ...(d.projects ?? []),
                {
                  name: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              projects: (d.projects ?? []).filter((_, i) => i !== index),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <FilterOption
                  title="Name"
                  type="text"
                  value={item.name}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      projects: (d.projects ?? []).map((p, i) =>
                        i === index ? { ...p, name: v } : p
                      ),
                    }))
                  }
                  placeholder="Project name"
                  className="max-w-none"
                  labelBackground="bg-white"
                  disabled={readOnly}
                />
                <FilterOption
                  title="Start"
                  type="date"
                  value={toDateInput(item.start_date)}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      projects: (d.projects ?? []).map((p, i) =>
                        i === index ? { ...p, start_date: v } : p
                      ),
                    }))
                  }
                  className="max-w-none"
                  labelBackground="bg-white"
                  disabled={readOnly}
                />
                <FilterOption
                  title="End"
                  type="date"
                  value={toDateInput(item.end_date)}
                  disabled={readOnly || item.end_date === PRESENT_SENTINEL}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      projects: (d.projects ?? []).map((p, i) =>
                        i === index ? { ...p, end_date: v } : p
                      ),
                    }))
                  }
                  className="max-w-none"
                  labelBackground="bg-white"
                />

                <PresentToggle
                  checked={item.end_date === PRESENT_SENTINEL}
                  disabled={readOnly}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({
                      ...d,
                      projects: (d.projects ?? []).map((p, i) =>
                        i === index
                          ? { ...p, end_date: checked ? PRESENT_SENTINEL : "" }
                          : p
                      ),
                    }))
                  }
                />
              </div>
              <div className="relative border border-congress-blue-900 rounded-2xl px-3 py-2">
                <label className="absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 bg-white z-10">
                  Description
                </label>
                <textarea
                  value={item.description ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      projects: (d.projects ?? []).map((p, i) =>
                        i === index ? { ...p, description: e.target.value } : p
                      ),
                    }))
                  }
                  placeholder="What did you build?"
                  className="min-h-[70px] w-full resize-y text-sm outline-none bg-transparent text-congress-blue-900"
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Hobbies">
        <TagListEditor
          title="Hobbies"
          placeholder="Add hobby"
          items={(draft.hobbies ?? []).map((h) => h.hobby)}
          readOnly={readOnly}
          bgColor="bg-white"
          onChange={(next) =>
            setDraft((d) => ({
              ...d,
              hobbies: next.map((hobby) => ({ hobby })),
            }))
          }
        />
      </Section>

      <Section title="Languages">
        <ListEditor
          items={draft.languages ?? []}
          emptyLabel="No languages"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              languages: [
                ...(d.languages ?? []),
                {
                  language: "",
                  proficiency: "",
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              languages: (d.languages ?? []).filter((_, i) => i !== index),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-wrap gap-3">
              <FilterOption
                title="Language"
                type="text"
                value={item.language}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    languages: (d.languages ?? []).map((l, i) =>
                      i === index ? { ...l, language: v } : l
                    ),
                  }))
                }
                placeholder="English"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Proficiency"
                type="text"
                value={item.proficiency}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    languages: (d.languages ?? []).map((l, i) =>
                      i === index ? { ...l, proficiency: v } : l
                    ),
                  }))
                }
                placeholder="Native"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
            </div>
          )}
        />
      </Section>

      <Section title="References">
        <ListEditor
          items={draft.references ?? []}
          emptyLabel="No references"
          readOnly={readOnly}
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              references: [
                ...(d.references ?? []),
                {
                  name: "",
                  relationship: "",
                  contact: "",
                },
              ],
            }))
          }
          onRemove={(index) =>
            setDraft((d) => ({
              ...d,
              references: (d.references ?? []).filter((_, i) => i !== index),
            }))
          }
          render={(item, index) => (
            <div className="flex flex-wrap gap-3">
              <FilterOption
                title="Name"
                type="text"
                value={item.name}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    references: (d.references ?? []).map((r, i) =>
                      i === index ? { ...r, name: v } : r
                    ),
                  }))
                }
                placeholder="Jane Doe"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Relationship"
                type="text"
                value={item.relationship}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    references: (d.references ?? []).map((r, i) =>
                      i === index ? { ...r, relationship: v } : r
                    ),
                  }))
                }
                placeholder="Manager"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
              <FilterOption
                title="Contact"
                type="text"
                value={item.contact}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    references: (d.references ?? []).map((r, i) =>
                      i === index ? { ...r, contact: v } : r
                    ),
                  }))
                }
                placeholder="email/phone"
                className="max-w-none"
                labelBackground="bg-white"
                disabled={readOnly}
              />
            </div>
          )}
        />
      </Section>
    </div>
  );
}

function ResumeSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-56 rounded bg-congress-blue-900/10 animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-full bg-congress-blue-900/10 animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-congress-blue-900/10 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-[16rem] rounded-full bg-congress-blue-900/10 animate-pulse"
          />
        ))}
      </div>
      <div className="h-24 w-full rounded-2xl bg-congress-blue-900/10 animate-pulse" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[calc(1rem)] border border-congress-blue-900 bg-white p-3">
      <div className="text-xs font-semibold text-congress-blue-900/80">
        {title}
      </div>
      {children}
    </div>
  );
}

function ListEditor<T>({
  items,
  emptyLabel,
  onAdd,
  onRemove,
  render,
  readOnly = false,
}: {
  items: T[];
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <div className="text-sm text-congress-blue-900/60">{emptyLabel}</div>
      ) : null}

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-congress-blue-900/15 bg-white p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold text-congress-blue-900/70">
                Entry {index + 1}
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full border border-congress-blue-900/15 px-3 py-1 text-[0.6875rem] font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {render(item, index)}
          </div>
        ))}
      </div>

      {!readOnly ? (
        <div>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
          >
            Add {items.length === 0 ? "first" : "another"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TagListEditor({
  title,
  placeholder,
  items,
  onChange,
  readOnly = false,
  bgColor,
}: {
  title: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
  bgColor?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const next = input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    onChange(Array.from(new Set([...items, ...next])));
    setInput("");
  };

  const remove = (value: string) => {
    onChange(items.filter((x) => x !== value));
  };

  return (
    <div className="flex flex-col gap-3">
      {!readOnly ? (
        <div className="min-w-0">
          <div className="relative border border-congress-blue-900 rounded-full px-3 py-2">
            <label
              className={cn(
                "absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 z-10",
                bgColor ? bgColor : "bg-background"
              )}
            >
              {title}
            </label>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={readOnly}
                className="w-full text-sm outline-none bg-transparent text-congress-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={add}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold border border-congress-blue-900 text-congress-blue-900 hover:bg-congress-blue-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-congress-blue-900/60">None yet.</div>
        ) : null}
        {items.map((value) => (
          <span
            key={value}
            className="flex items-center gap-2 rounded-full border border-congress-blue-900 px-3 py-1.5 text-sm text-congress-blue-900"
          >
            <span className="font-medium">{value}</span>
            {!readOnly ? (
              <button
                type="button"
                onClick={() => remove(value)}
                className="rounded-full px-2 py-0.5 text-[0.75rem] font-semibold text-congress-blue-900/70 hover:text-congress-blue-900"
                title="Remove"
              >
                ✕
              </button>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
