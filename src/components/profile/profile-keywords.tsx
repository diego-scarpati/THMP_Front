"use client";

import { useMemo, useState } from "react";
import {
  useSkills,
  useCreateSkill,
  useDeleteSkill,
  useInclusions,
  useCreateInclusion,
  useDeleteInclusion,
  useExclusions,
  useCreateExclusion,
  useDeleteExclusion,
  useToggleFilterActive,
  useSetInclusionsActive,
  useSetExclusionsActive,
} from "@/hooks";
import type { Exclusion, Inclusion, Skill } from "@/types/api";
import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";

type KeywordKind = "skills" | "includes" | "excludes";

type KeywordItem =
  | { kind: "skills"; id: number; title: string; active: boolean }
  | { kind: "includes"; id: number; title: string; active: boolean }
  | { kind: "excludes"; id: number; title: string; active: boolean };

function getActiveFromRelation(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.active === "boolean") return record.active;
  return undefined;
}

export function ProfileKeywords() {
  const skillsQuery = useSkills();
  const inclusionsQuery = useInclusions();
  const exclusionsQuery = useExclusions();

  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();

  const createInclusion = useCreateInclusion();
  const deleteInclusion = useDeleteInclusion();

  const createExclusion = useCreateExclusion();
  const deleteExclusion = useDeleteExclusion();

  const toggleActive = useToggleFilterActive();
  const setInclusionsActive = useSetInclusionsActive();
  const setExclusionsActive = useSetExclusionsActive();

  const [skillInput, setSkillInput] = useState("");
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");

  const skills = useMemo(
    () => (skillsQuery.data ?? []) as Skill[],
    [skillsQuery.data]
  );
  const inclusions = useMemo(
    () => (inclusionsQuery.data ?? []) as Inclusion[],
    [inclusionsQuery.data]
  );
  const exclusions = useMemo(
    () => (exclusionsQuery.data ?? []) as Exclusion[],
    [exclusionsQuery.data]
  );

  const kinds = ["skills", "includes", "excludes"] as const;

  const skillItems: KeywordItem[] = useMemo(
    () =>
      skills.map((x) => ({
        kind: "skills",
        id: x.id,
        title: x.title,
        active: x.active,
      })),
    [skills]
  );

  const inclusionItems: KeywordItem[] = useMemo(
    () =>
      inclusions.map((x) => {
        const record = x as unknown as Record<string, unknown>;
        const users = Array.isArray(record.Users)
          ? (record.Users as Array<Record<string, unknown>>)
          : [];

        const relActive = getActiveFromRelation(users[0]?.UserInclusion);
        const directActive =
          typeof record.active === "boolean" ? record.active : undefined;
        const active = directActive ?? relActive ?? false;

        return {
          kind: "includes",
          id: x.id,
          title: x.title,
          active,
        };
      }),
    [inclusions]
  );

  const exclusionItems: KeywordItem[] = useMemo(
    () =>
      exclusions.map((x) => {
        const record = x as unknown as Record<string, unknown>;
        const users = Array.isArray(record.Users)
          ? (record.Users as Array<Record<string, unknown>>)
          : [];

        const relActive = getActiveFromRelation(users[0]?.UserExclusion);
        const directActive =
          typeof record.active === "boolean" ? record.active : undefined;
        const active = directActive ?? relActive ?? false;

        return {
          kind: "excludes",
          id: x.id,
          title: x.title,
          active,
        };
      }),
    [exclusions]
  );

  const counts = useMemo(
    () => ({
      skills: skillItems.length,
      includes: inclusionItems.length,
      excludes: exclusionItems.length,
    }),
    [skillItems.length, inclusionItems.length, exclusionItems.length]
  );

  const allItems: KeywordItem[] = useMemo(
    () =>
      [...skillItems, ...inclusionItems, ...exclusionItems].sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
    [skillItems, inclusionItems, exclusionItems]
  );

  const isLoading =
    skillsQuery.isLoading ||
    inclusionsQuery.isLoading ||
    exclusionsQuery.isLoading;
  const isError =
    skillsQuery.isError || inclusionsQuery.isError || exclusionsQuery.isError;

  const isMutating =
    createSkill.isPending ||
    deleteSkill.isPending ||
    createInclusion.isPending ||
    deleteInclusion.isPending ||
    createExclusion.isPending ||
    deleteExclusion.isPending ||
    toggleActive.isPending ||
    setInclusionsActive.isPending ||
    setExclusionsActive.isPending;

  const addMany = async (kind: KeywordKind, raw: string) => {
    const titles = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (titles.length === 0) return;

    if (kind === "skills") {
      await createSkill.mutateAsync({ skills: titles });
      setSkillInput("");
      return;
    }

    if (kind === "includes") {
      await createInclusion.mutateAsync({ inclusions: titles });
      setIncludeInput("");
      return;
    }

    await createExclusion.mutateAsync({ exclusions: titles });
    setExcludeInput("");
  };

  const toggleOne = async (item: KeywordItem) => {
    if (item.kind === "skills") return;

    if (item.kind === "includes") {
      await toggleActive.mutateAsync({ includes: [item.title] });
      return;
    }

    await toggleActive.mutateAsync({ excludes: [item.title] });
  };

  const removeOne = async (item: KeywordItem) => {
    if (item.kind === "skills") {
      await deleteSkill.mutateAsync(item.title);
      return;
    }
    if (item.kind === "includes") {
      await deleteInclusion.mutateAsync(item.title);
      return;
    }
    await deleteExclusion.mutateAsync(item.title);
  };

  const summary = (
    <div className="grid grid-cols-3 gap-4 text-sm text-congress-blue-700 [&>*]:px-6 [&>*]:py-1 [&>*]:bg-white/60 [&>*]:rounded-md [&>*]:flex [&>*]:items-center [&>*]:gap-4">
      <div>
        <span className="">Skills: </span>
        <span className="tabular-nums">{counts.skills}</span>
      </div>
      <div>
        <span className="">Includes: </span>
        <span className="tabular-nums">{counts.includes}</span>
      </div>
      <div>
        <span className="">Excludes: </span>
        <span className="tabular-nums">{counts.excludes}</span>
      </div>
    </div>
  );

  return (
    <CollapsibleCard defaultOpen={false} summary={summary}>
      {({ open }) => (
        <div className="flex flex-col gap-5">
          {isLoading ? <KeywordsSkeleton /> : null}
          {isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-semibold">Could not load keywords</span>
              <span className="opacity-80">
                {" "}
                — please refresh and try again.
              </span>
            </div>
          ) : null}

          {open ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                <KeywordAdder
                  title="Skills"
                  placeholder="Add skills (comma separated)"
                  value={skillInput}
                  onChange={setSkillInput}
                  onSubmit={() => addMany("skills", skillInput)}
                  disabled={isMutating || isLoading}
                />
                <KeywordAdder
                  title="Includes"
                  placeholder="Add includes (comma separated)"
                  value={includeInput}
                  onChange={setIncludeInput}
                  onSubmit={() => addMany("includes", includeInput)}
                  disabled={isMutating || isLoading}
                />
                <KeywordAdder
                  title="Excludes"
                  placeholder="Add excludes (comma separated)"
                  value={excludeInput}
                  onChange={setExcludeInput}
                  onSubmit={() => addMany("excludes", excludeInput)}
                  disabled={isMutating || isLoading}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <ChipsSkeleton />
                ) : isError ? (
                  <div className="text-sm text-congress-blue-900/70">
                    Keywords unavailable.
                  </div>
                ) : allItems.length === 0 ? (
                  <div className="text-sm text-congress-blue-900/70">
                    No keywords saved yet.
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-congress-blue-700 gap-4 flex flex-col">
                    <div className="rounded-2xl border border-congress-blue-900/20 flex flex-col justify-center py-4">
                      <div className="flex items-center mb-2">
                        <span className="px-6 py-1 bg-white/60 rounded-md flex items-center">
                          Skills:{" "}
                        </span>
                        <span className="tabular-nums">{counts.skills}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 px-6">
                        {skillItems.map((skill) => (
                          <KeywordChip
                            key={`${"skill"}-${skill.id}`}
                            item={skill}
                            onToggle={() => toggleOne(skill)}
                            onRemove={() => removeOne(skill)}
                            disableToggle={true}
                            disabled={isMutating}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-congress-blue-900/20 flex flex-col justify-center py-4">
                      <div className="flex items-center mb-2">
                        <span className="px-6 py-1 bg-white/60 rounded-md flex items-center">
                          Includes:{" "}
                        </span>
                        <span className="tabular-nums">{counts.includes}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 px-6">
                        {inclusionItems.map((include) => (
                          <KeywordChip
                            key={`${"include"}-${include.id}`}
                            item={include}
                            onToggle={() => toggleOne(include)}
                            onRemove={() => removeOne(include)}
                            disableToggle={false}
                            disabled={isMutating}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="rounded-2xl border border-congress-blue-900/20 flex flex-col justify-center py-4">
                        <div className="flex items-center mb-2">
                          <span className="px-6 py-1 bg-white/60 rounded-md flex items-center">
                            Excludes:{" "}
                          </span>
                          <span className="tabular-nums">
                            {counts.excludes}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 px-6">
                          {exclusionItems.map((exclude) => (
                            <KeywordChip
                              key={`${"exclude"}-${exclude.id}`}
                              item={exclude}
                              onToggle={() => toggleOne(exclude)}
                              onRemove={() => removeOne(exclude)}
                              disableToggle={false}
                              disabled={isMutating}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-congress-blue-900/70">
              Expand to see keywords.
            </div>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
}

function KeywordsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="relative border border-congress-blue-900/20 rounded-full px-3 py-2"
        >
          <div className="absolute -top-2 left-3 h-3 w-16 rounded bg-congress-blue-900/10 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-4 w-full rounded bg-congress-blue-900/10 animate-pulse" />
            <div className="h-7 w-14 rounded-full bg-congress-blue-900/10 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-28 rounded-full bg-congress-blue-900/10 animate-pulse"
        />
      ))}
    </div>
  );
}

function KeywordAdder(props: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="relative border border-congress-blue-900 rounded-full pl-3 p-2">
        <label className="absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 bg-white z-10">
          {props.title}
        </label>
        <div className="flex items-center gap-2">
          <input
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            className="w-full text-sm outline-none bg-transparent text-congress-blue-900"
          />
          <button
            type="button"
            onClick={props.onSubmit}
            disabled={props.disabled}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold border border-congress-blue-900 text-congress-blue-900 hover:bg-congress-blue-50",
              props.disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function KeywordChip({
  item,
  onToggle,
  onRemove,
  disabled,
  disableToggle,
}: {
  item: KeywordItem;
  onToggle: () => void;
  onRemove: () => void;
  disabled?: boolean;
  disableToggle?: boolean;
}) {
  const kindLabel =
    item.kind === "skills"
      ? "Skill"
      : item.kind === "includes"
      ? "Include"
      : "Exclude";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border p-1.5 pl-3 text-sm",
        item.kind === "excludes"
          ? "border-red-700 text-red-700"
          : item.kind === "includes"
          ? "border-green-700 text-green-700"
          : "border-congress-blue-900/30 text-congress-blue-900"
      )}
    >
      {/* <span className="text-[0.625rem] font-semibold opacity-80">
        {kindLabel}
      </span> */}
      <span className="font-medium capitalize">{item.title}</span>

      {item.kind !== "skills" && (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || disableToggle}
          className={cn(
            "ml-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold cursor-pointer",
            item.active
              ? "border-green-700 bg-congress-blue-50 text-green-700"
              : "border-red-700 bg-white text-red-700",
            (disabled || disableToggle) && "opacity-50 cursor-not-allowed"
          )}
          title={
            disableToggle
              ? "Skill active toggle not wired yet"
              : "Toggle active"
          }
        >
          {item.active ? "Active" : "Inactive"}
        </button>
      )}

      {/* Add remove button */}
      {item.kind === "skills" && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            "ml-1 rounded-full px-2 py-0.5 text-[0.75rem] font-semibold text-congress-blue-900/70 hover:text-congress-blue-900",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
}
