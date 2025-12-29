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
        <div className="flex items-center justify-between px-4 py-3 border-b border-congress-blue-900/10">
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
            className="rounded-full border border-congress-blue-900/20 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          {isPdf ? (
            <iframe
              src={url}
              className="h-[70vh] w-full rounded-2xl border border-congress-blue-900/10"
              title="Resume preview"
            />
          ) : isDocx ? (
            <div className="h-[70vh] overflow-auto rounded-2xl border border-congress-blue-900/10 p-4">
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
                className="h-[70vh] w-full rounded-2xl border border-congress-blue-900/10"
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
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 pl-1 text-xs font-semibold text-congress-blue-900/80 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mode: Mode = useMemo(() => {
    return resumeQuery.data ? "update" : "create";
  }, [resumeQuery.data]);

  useEffect(() => {
    const r = resumeQuery.data as Resume | undefined;
    if (!r) {
      setDraft(emptyResumeDraft);
      return;
    }

    setDraft({
      first_name: r.first_name ?? "",
      last_name: r.last_name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      address: r.address ?? "",
      summary: r.summary ?? "",
      educations: (r.educations ?? []).map((e) => ({
        ...e,
        end_date: e.end_date ? e.end_date : PRESENT_SENTINEL,
      })),
      work_experiences: (r.work_experiences ?? []).map((w) => ({
        ...w,
        end_date: w.end_date ? w.end_date : PRESENT_SENTINEL,
      })),
      certifications: r.certifications ?? [],
      projects: (r.projects ?? []).map((p) => ({
        ...p,
        end_date: p.end_date ? p.end_date : PRESENT_SENTINEL,
      })),
      hobbies: r.hobbies ?? [],
      languages: r.languages ?? [],
      references: r.references ?? [],
      resume_skills: r.resume_skills ?? [],
    });
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

  const handleSelectedResumeFile = (file: File) => {
    if (!isAllowedResumeFile(file)) {
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    parseResume.reset?.();
  };

  const analyseByAI = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);

    const parsed = await parseResume.mutateAsync(formData);
    setDraft((d) => ({
      ...d,
      first_name: parsed.first_name ?? d.first_name ?? "",
      last_name: parsed.last_name ?? d.last_name ?? "",
      email: parsed.email ?? d.email ?? "",
      phone: parsed.phone ?? d.phone ?? "",
      address: parsed.address ?? d.address ?? "",
      summary: parsed.summary ?? d.summary ?? "",
      educations: (parsed.educations ?? []).map((e) => ({
        ...e,
        end_date: e.end_date ? e.end_date : PRESENT_SENTINEL,
      })),
      work_experiences: (parsed.work_experiences ?? []).map((w) => ({
        ...w,
        end_date: w.end_date ? w.end_date : PRESENT_SENTINEL,
      })),
      certifications: parsed.certifications ?? [],
      projects: (parsed.projects ?? []).map((p) => ({
        ...p,
        end_date: p.end_date ? p.end_date : PRESENT_SENTINEL,
      })),
      hobbies: parsed.hobbies ?? [],
      languages: parsed.languages ?? [],
      references: parsed.references ?? [],
      resume_skills: parsed.resume_skills ?? d.resume_skills ?? [],
    }));
  };

  const onSave = async () => {
    const normalized: CreateResumeRequest = {
      ...draft,
      educations: (draft.educations ?? []).map((e) => ({
        ...e,
        end_date: e.end_date === PRESENT_SENTINEL ? "" : e.end_date,
      })),
      work_experiences: (draft.work_experiences ?? []).map((w) => ({
        ...w,
        end_date: w.end_date === PRESENT_SENTINEL ? "" : w.end_date,
      })),
      projects: (draft.projects ?? []).map((p) => ({
        ...p,
        end_date: p.end_date === PRESENT_SENTINEL ? "" : p.end_date,
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
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className={cn(
              "rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50",
              busy && "opacity-60 cursor-not-allowed"
            )}
          >
            {mode === "create" ? "Create" : "Save"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={busy || mode === "create"}
            className={cn(
              "rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50",
              (busy || mode === "create") && "opacity-60 cursor-not-allowed"
            )}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="w-4/5">
          <div
            className={cn(
              "rounded-2xl border border-congress-blue-900/20 bg-congress-blue-100 p-4 flex items-center flex-col gap-2 text-center",
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
              </div>

              <div className="flex items-center gap-3">
                {resumeFile && resumePreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="rounded-full border border-congress-blue-900/20 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
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
                    Analyse by AI
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
          />
          <FilterOption
            title="Last Name"
            type="text"
            value={draft.last_name}
            onChange={(v) => setDraft((d) => ({ ...d, last_name: v }))}
            placeholder="Doe"
            className="max-w-none"
            labelBackground="bg-white"
          />
          <FilterOption
            title="Email"
            type="text"
            value={draft.email}
            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
            placeholder="john@doe.com"
            className="max-w-none"
            labelBackground="bg-white"
          />
          <FilterOption
            title="Phone"
            type="text"
            value={draft.phone}
            onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            placeholder="+61 400 000 000"
            className="max-w-none"
            labelBackground="bg-white"
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
            onChange={(e) =>
              setDraft((d) => ({ ...d, summary: e.target.value }))
            }
            placeholder="A few lines that describe your experience and focus…"
            className="min-h-[90px] w-full resize-y text-sm outline-none bg-transparent text-congress-blue-900"
          />
        </div>
      </Section>

      <Section title="Education">
        <ListEditor
          items={draft.educations ?? []}
          emptyLabel="No education entries"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              educations: [
                ...(d.educations ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
              />
              <FilterOption
                title="End"
                type="date"
                value={toDateInput(item.end_date)}
                disabled={item.end_date === PRESENT_SENTINEL}
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

      <Section title="Work Experience">
        <ListEditor
          items={draft.work_experiences ?? []}
          emptyLabel="No work experiences"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              work_experiences: [
                ...(d.work_experiences ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
                />
                <FilterOption
                  title="End"
                  type="date"
                  value={toDateInput(item.end_date)}
                  disabled={item.end_date === PRESENT_SENTINEL}
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

      <Section title="Certifications">
        <ListEditor
          items={draft.certifications ?? []}
          emptyLabel="No certifications"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              certifications: [
                ...(d.certifications ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
              />
            </div>
          )}
        />
      </Section>

      <Section title="Projects">
        <ListEditor
          items={draft.projects ?? []}
          emptyLabel="No projects"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              projects: [
                ...(d.projects ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
                />
                <FilterOption
                  title="End"
                  type="date"
                  value={toDateInput(item.end_date)}
                  disabled={item.end_date === PRESENT_SENTINEL}
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
                <label className="absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 bg-background z-10">
                  Description
                </label>
                <textarea
                  value={item.description ?? ""}
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
          onChange={(next) =>
            setDraft((d) => ({
              ...d,
              hobbies: next.map((hobby) => ({
                id: -Date.now(),
                resume_id: 0,
                hobby,
              })),
            }))
          }
        />
      </Section>

      <Section title="Languages">
        <ListEditor
          items={draft.languages ?? []}
          emptyLabel="No languages"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              languages: [
                ...(d.languages ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
              />
            </div>
          )}
        />
      </Section>

      <Section title="References">
        <ListEditor
          items={draft.references ?? []}
          emptyLabel="No references"
          onAdd={() =>
            setDraft((d) => ({
              ...d,
              references: [
                ...(d.references ?? []),
                {
                  id: -Date.now(),
                  resume_id: 0,
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
    <div className="flex flex-col gap-3">
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
}: {
  items: T[];
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
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
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded-full border border-congress-blue-900/20 px-3 py-1 text-[0.6875rem] font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
              >
                Remove
              </button>
            </div>
            {render(item, index)}
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-congress-blue-900 hover:bg-congress-blue-50"
        >
          Add {items.length === 0 ? "first" : "another"}
        </button>
      </div>
    </div>
  );
}

function TagListEditor({
  title,
  placeholder,
  items,
  onChange,
}: {
  title: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
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
      <div className="min-w-0">
        <div className="relative border border-congress-blue-900 rounded-full px-3 py-2">
          <label className="absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 bg-background z-10">
            {title}
          </label>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm outline-none bg-transparent text-congress-blue-900"
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

      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-congress-blue-900/60">None yet.</div>
        ) : null}
        {items.map((value) => (
          <span
            key={value}
            className="flex items-center gap-2 rounded-full border border-congress-blue-900/20 px-3 py-1.5 text-sm text-congress-blue-900"
          >
            <span className="font-medium">{value}</span>
            <button
              type="button"
              onClick={() => remove(value)}
              className="rounded-full px-2 py-0.5 text-[0.75rem] font-semibold text-congress-blue-900/70 hover:text-congress-blue-900"
              title="Remove"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
