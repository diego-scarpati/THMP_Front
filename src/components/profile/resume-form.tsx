"use client";

import { useEffect, useMemo, useState } from "react";
import FilterOption from "@/components/jobs/filter-option";
import { cn } from "@/lib/utils";
import {
  useCreateResume,
  useDeleteResume,
  useResume,
  useUpdateResume,
} from "@/hooks";
import type {
  CreateResumeRequest,
  Resume,
  UpdateResumeRequest,
} from "@/types/api";

type Mode = "create" | "update";

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

function toDateInput(value?: string) {
  if (!value) return "";
  // If the API returns an ISO date time, normalize.
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function ResumeForm() {
  const resumeQuery = useResume();
  const createResume = useCreateResume();
  const updateResume = useUpdateResume();
  const deleteResume = useDeleteResume();

  const [draft, setDraft] = useState<CreateResumeRequest>(emptyResumeDraft);

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
      educations: r.educations ?? [],
      work_experiences: r.work_experiences ?? [],
      certifications: r.certifications ?? [],
      projects: r.projects ?? [],
      hobbies: r.hobbies ?? [],
      languages: r.languages ?? [],
      references: r.references ?? [],
      resume_skills: r.resume_skills ?? [],
    });
  }, [resumeQuery.data]);

  const busy =
    resumeQuery.isLoading ||
    createResume.isPending ||
    updateResume.isPending ||
    deleteResume.isPending;

  const onSave = async () => {
    if (mode === "create") {
      await createResume.mutateAsync(draft);
      return;
    }

    const payload: UpdateResumeRequest = {
      ...draft,
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
        <p className="text-xs text-congress-blue-900/70">
          {resumeQuery.isLoading
            ? "Loading resume…"
            : mode === "create"
            ? "No resume found yet — fill this out and save."
            : "Resume loaded — edit and save your changes."}
        </p>

        <div className="flex items-center gap-2">
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
