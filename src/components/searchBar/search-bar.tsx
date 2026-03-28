import {
  useSearchAndCreateWithAllKeywords,
  useSeekAllKeywords,
  useIndeedAllKeywords,
} from "@/hooks";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import KeywordsList from "../keywords/keywords-list";
import Add from "@/icons/add.svg";
import ProgressActivity from "@/icons/progress_activity.svg";
import LocationSelectOptions from "../jobs/location-select-options";

const SearchBar = () => {
  const [searchBarKeyword, setSearchBarKeyword] = useState<string>("");
  const [typedKeywords, setTypedKeywords] = useState<string[]>([]);
  const [selectedRadioOption, setSelectedRadioOption] = useState<
    "LinkedIn" | "Seek" | "All"
  >("LinkedIn");
  // const [selectedRadioOption, setSelectedRadioOption] = useState<
  //   "LinkedIn" | "Seek" | "Indeed" | "All"
  // >("LinkedIn");
  const [selectedLocation, setSelectedLocation] = useState<
    "sydney" | "melbourne" | "oceania" | "APAC"
  >("sydney");
  const searchAndCreateJobs = useSearchAndCreateWithAllKeywords();
  const seekAllKeywords = useSeekAllKeywords();
  const indeedAllKeywords = useIndeedAllKeywords();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const radioOptions = ["LinkedIn", "Seek", "All"];
  // const radioOptions = ["LinkedIn", "Seek", "Indeed", "All"];

  const locationOptions = ["sydney", "melbourne", "oceania", "APAC"];

  const handleAddingKeywordsInput = () => {
    const value = searchBarKeyword.trim();
    if (value.length <= 1) return;

    // don't add duplicate typed keywords
    if (typedKeywords.includes(value)) {
      // reset input regardless
      setSearchBarKeyword("");
      return;
    }

    setTypedKeywords((prev) => [...prev, value]);
    setSearchBarKeyword("");
  };

  const handleAddingUserKeywords = (target: string) => {
    if (typedKeywords.includes(target)) {
      return;
    } else {
      setTypedKeywords((prev) => [...prev, target]);
    }
  };

  const handleSearchNewJobs = async (overrideKeywords?: string[]) => {
    const keywords = overrideKeywords ?? typedKeywords;
    if (keywords.length === 0) return;

    // Handle different search options based on selected radio button
    if (selectedRadioOption === "LinkedIn") {
      const newJobs = await searchAndCreateJobs.mutateAsync({
        keywords,
      });
    } else if (selectedRadioOption === "Seek") {
      const seekJobs = await seekAllKeywords.mutateAsync({
        keywordArray: keywords,
      });
      // } else if (selectedRadioOption === "Indeed") {
      //   const indeedJobs = await indeedAllKeywords.mutateAsync({
      //     keywordArray: keywords,
      //   });
    } else if (selectedRadioOption === "All") {
      try {
        const [linkedInJobs, seekJobs] = await Promise.all([
          searchAndCreateJobs.mutateAsync({ keywords }),
          seekAllKeywords.mutateAsync({ keywordArray: keywords }),
          // indeedAllKeywords.mutateAsync({
          //   keywordArray: keywords,
          // }),
        ]);
      } catch (error) {
        console.error(
          "❌ ~ handleSearchNewJobs ~ Error searching both:",
          error
        );
      }
    }
  };

  const handleDeletingTypedKeywords = (target: string) => {
    setTypedKeywords((prev) => prev.filter((keyword) => keyword !== target));
  };

  const handleSelectedLocation = (location: string) => {
    setSelectedLocation(
      location as "sydney" | "melbourne" | "oceania" | "APAC"
    );
  };

  // show add button only when more than 1 character has been typed
  const showAdd = searchBarKeyword.trim().length > 1;

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="flex flex-col justify-center">
        <div className="flex flex-col items-center w-full mx-auto">
          <div className="flex flex-col items-end p-4 w-full">
            {/* Search Bar */}
            <div
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-sm"
              id="search_bar"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Static magnifying glass icon */}
              <svg
                className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <label htmlFor="search" className="sr-only">
                Search jobs
              </label>
              <input
                type="text"
                id="search"
                ref={inputRef}
                value={searchBarKeyword}
                onChange={(e) => setSearchBarKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    searchBarKeyword.trim().length > 1
                  ) {
                    e.preventDefault();
                    const next = [...typedKeywords, searchBarKeyword.trim()];
                    setTypedKeywords(next);
                    setSearchBarKeyword("");
                    handleSearchNewJobs(next);
                  }
                }}
                placeholder="Type keywords to search jobs..."
                className="flex-1 min-w-0 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none bg-transparent"
              />
              <div className="flex items-center gap-2">
                {/* Animated "Add keyword" button */}
                <button
                  type="button"
                  onClick={handleAddingKeywordsInput}
                  aria-hidden={!showAdd}
                  className={cn(
                    "shrink-0 flex items-center rounded-lg text-xs sm:text-sm font-medium py-1 px-2.5 sm:py-1.5 sm:px-3 transform transition-all duration-300 ease-out",
                    showAdd
                      ? "bg-primary-600 text-white opacity-100 translate-x-0 pointer-events-auto"
                      : "bg-transparent text-transparent opacity-0 translate-x-4 pointer-events-none"
                  )}
                >
                  <span>Add</span>
                  <Add className="h-4 w-4 ml-1" />
                </button>
                {/* Keyword count badge */}
                <div className="shrink-0 bg-neutral-100 text-neutral-700 text-xs sm:text-sm font-semibold rounded-full px-2 py-0.5 border border-neutral-200">
                  #: <span>{typedKeywords.length}</span>
                </div>
                <LocationSelectOptions
                  value={selectedLocation}
                  locations={locationOptions}
                  onChange={handleSelectedLocation}
                  className="shrink-0"
                />
                {/* Search submit button with expand-on-hover */}
                <button
                  type="button"
                  onClick={() => handleSearchNewJobs()}
                  disabled={
                    searchAndCreateJobs.isPending || seekAllKeywords.isPending
                  }
                  aria-busy={
                    searchAndCreateJobs.isPending || seekAllKeywords.isPending
                  }
                  className={cn(
                    "group flex cursor-pointer border border-transparent hover:border-neutral-200 p-1.5 rounded-full transition-colors duration-200 overflow-hidden",
                    searchAndCreateJobs.isPending ||
                      (seekAllKeywords.isPending &&
                        "opacity-80 cursor-not-allowed")
                  )}
                >
                  {searchAndCreateJobs.isPending ||
                  seekAllKeywords.isPending ||
                  indeedAllKeywords.isPending ? (
                    <ProgressActivity className="h-5 w-5 text-neutral-700 animate-spin" />
                  ) : (
                    <svg
                      className="h-5 w-5 text-neutral-700 group-hover:text-neutral-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                  <div
                    className="relative ml-1 h-5 w-0 overflow-hidden transition-[width] duration-300 ease-out group-hover:w-[48px]"
                    aria-hidden="true"
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 text-neutral-700 text-sm font-semibold leading-[20px] whitespace-nowrap transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                      Search
                    </span>
                  </div>
                </button>
              </div>
            </div>
            {/* Radio Pills */}
            <div className="flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide">
              {radioOptions.map((option) => {
                const isSelected = selectedRadioOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={cn(
                      "shrink-0 px-3 py-1 text-sm font-medium rounded-full border transition-colors min-h-[32px]",
                      isSelected
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRadioOption(
                        option as "LinkedIn" | "Seek" | "All"
                      );
                      // setSelectedRadioOption(
                      //   option as "LinkedIn" | "Seek" | "Indeed" | "All"
                      // );
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <KeywordsList
        onClickFunction={handleDeletingTypedKeywords}
        onAddFunction={handleAddingUserKeywords}
        keywords={typedKeywords}
      />
    </div>
  );
};

export default SearchBar;
