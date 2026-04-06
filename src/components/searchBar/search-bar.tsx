import {
  useSearchAndCreateWithAllKeywords,
  useSeekAllKeywords,
  useIndeedAllKeywords,
  useCapabilities,
} from "@/hooks";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import KeywordsList from "../keywords/keywords-list";
import Add from "@/icons/add.svg";
import MagnifyingGlass from "@/icons/magnifying_glass.svg";
import ProgressActivity from "@/icons/progress_activity.svg";
import LocationSelectOptions from "../jobs/location-select-options";

const SearchBar = () => {
  const [searchBarKeyword, setSearchBarKeyword] = useState<string>("");
  const [typedKeywords, setTypedKeywords] = useState<string[]>([]);
  // const [selectedRadioOption, setSelectedRadioOption] = useState<
  //   "LinkedIn" | "Seek" | "All"
  // >("LinkedIn");
  const [selectedRadioOption, setSelectedRadioOption] = useState<
    "LinkedIn" | "Seek" | "Indeed" | "All"
  >("LinkedIn");
  const [selectedLocation, setSelectedLocation] = useState<
    "sydney" | "melbourne" | "oceania" | "APAC"
  >("sydney");
  const searchAndCreateJobs = useSearchAndCreateWithAllKeywords();
  const seekAllKeywords = useSeekAllKeywords();
  const indeedAllKeywords = useIndeedAllKeywords();
  const { canRunLiveScraping } = useCapabilities();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // const radioOptions = ["LinkedIn", "Seek", "All"];
  const radioOptions = ["LinkedIn", "Seek", "Indeed", "All"];

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

  const handleToggleKeyword = (target: string) => {
    setTypedKeywords((prev) =>
      prev.includes(target) ? prev.filter((k) => k !== target) : [...prev, target]
    );
  };

  const handleSearchNewJobs = async (overrideKeywords?: string[]) => {
    const keywords = overrideKeywords ?? typedKeywords;
    if (keywords.length === 0) return;
    if (!canRunLiveScraping) return;

    // Handle different search options based on selected radio button
    if (selectedRadioOption === "LinkedIn") {
      await searchAndCreateJobs.mutateAsync({
        keywords,
      });
    } else if (selectedRadioOption === "Seek") {
      await seekAllKeywords.mutateAsync({
        keywordArray: keywords,
      });
      } else if (selectedRadioOption === "Indeed") {
        const indeedJobs = await indeedAllKeywords.mutateAsync({
          keywordArray: keywords,
        });
    } else if (selectedRadioOption === "All") {
      try {
        await Promise.all([
          searchAndCreateJobs.mutateAsync({ keywords }),
          seekAllKeywords.mutateAsync({ keywordArray: keywords }),
          // indeedAllKeywords.mutateAsync({
          //   keywordArray: keywords,
          // }),
        ]);
      } catch (error) {
        console.error(
          "❌ ~ handleSearchNewJobs ~ Error searching both:",
          error,
        );
      }
    }
  };

  const handleSelectedLocation = (location: string) => {
    setSelectedLocation(
      location as "sydney" | "melbourne" | "oceania" | "APAC",
    );
  };

  // show add button only when more than 1 character has been typed
  const showAdd = searchBarKeyword.trim().length > 1;
  const isSearching =
    searchAndCreateJobs.isPending ||
    seekAllKeywords.isPending ||
    indeedAllKeywords.isPending;
  const isSearchDisabled = !canRunLiveScraping || isSearching;

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="flex flex-col justify-center">
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full max-w-[1000px] flex-col items-center justify-center md:items-end px-0 pt-4 sm:px-4">
            {/* Search Bar */}
            <div
              className="flex w-full justify-between rounded-[calc(2rem+1rem)] md:rounded-br-none bg-congress-blue-900 p-3 sm:p-4"
              id="search_bar"
              onClick={() => inputRef.current?.focus()}
            >
              <div className="flex w-full flex-col gap-3 rounded-[2rem] bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-2 sm:rounded-4xl">
                <div className="flex min-w-0 items-center gap-2 sm:flex-1">
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
                        searchBarKeyword.trim().length > 1 &&
                        canRunLiveScraping
                      ) {
                        e.preventDefault();
                        const next = [
                          ...typedKeywords,
                          searchBarKeyword.trim(),
                        ];
                        setTypedKeywords(next);
                        setSearchBarKeyword("");
                        handleSearchNewJobs(next);
                      }
                    }}
                    placeholder="Type keywords to search jobs..."
                    className="min-w-0 flex-1 bg-transparent text-base/[1rem] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddingKeywordsInput}
                    disabled={!showAdd}
                    aria-hidden={!showAdd}
                    className={cn(
                      "flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full text-sm/[1rem] font-semibold transition-all duration-300 ease-out",
                      showAdd
                        ? "max-w-24 bg-congress-blue-900 px-3 py-1.5 text-congress-blue-200 opacity-100"
                        : "max-w-0 px-0 py-1.5 text-congress-blue-900 opacity-0 pointer-events-none",
                    )}
                  >
                    <span>Add</span>
                    <Add className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:items-center">
                    <div className="flex h-8 min-w-[3.25rem] items-center justify-center rounded-full border border-congress-blue-300 bg-congress-blue-300 px-2 py-1.5">
                      <p className="h-5 text-sm/[1rem] font-semibold leading-[20px] text-congress-blue-900">
                        #: <span>{typedKeywords.length}</span>
                      </p>
                    </div>
                    <LocationSelectOptions
                      value={selectedLocation}
                      locations={locationOptions}
                      onChange={handleSelectedLocation}
                      className="w-full sm:mr-2 md:mr-0 sm:w-auto h-8"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchNewJobs()}
                    disabled={isSearchDisabled}
                    aria-busy={isSearching}
                    title={
                      !canRunLiveScraping
                        ? "Not available in preview"
                        : undefined
                    }
                    className={cn(
                      "group flex h-8 w-full items-center justify-center gap-2 rounded-full border border-congress-blue-900 px-3 transition-colors duration-200 sm:w-auto sm:justify-start sm:border-transparent sm:px-1.5",
                      isSearchDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-congress-blue-900",
                    )}
                  >
                    {isSearching ? (
                      <ProgressActivity className="h-5 w-5 animate-spin text-congress-blue-900" />
                    ) : (
                      <MagnifyingGlass className="h-5 w-5 text-congress-blue-900 transition-colors duration-200 group-hover:text-congress-blue-700" />
                    )}
                    <span
                      className={cn(
                        "whitespace-nowrap text-sm/[1rem] font-semibold leading-[20px] text-congress-blue-900 sm:max-w-0 sm:overflow-hidden sm:opacity-0 sm:transition-all sm:duration-300 sm:ease-out sm:group-hover:ml-1 sm:group-hover:max-w-[48px] sm:group-hover:opacity-100",
                      )}
                    >
                      Search
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {/* Radio Buttons */}
            <div className="flex sm:relative sm:top-[-5.6px] md:inherit md:top-0">
              <div className="w-4 h-4 bg-congress-blue-900 border-0">
                <div className="w-4 h-4 bg-background border-0 rounded-tr-4xl " />
              </div>
              <div className="md:flex md:flex-wrap justify-center gap-3 rounded-3xl rounded-t-none bg-congress-blue-900 px-4 pt-2 pb-3 text-congress-blue-300 md:gap-4 md:px-6">
                {/* LinkedIn Radio */}
                {radioOptions.map((option) => (
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    key={option}
                  >
                    <span className="text-sm font-semibold">{option}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // setSelectedRadioOption(
                        //   option as "LinkedIn" | "Seek" | "All",
                        // );
                        setSelectedRadioOption(
                          option as "LinkedIn" | "Seek" | "Indeed" | "All"
                        );
                      }}
                      className={cn(
                        "h-5 w-5 rounded-full border transition-transform duration-200 cursor-pointer bg-congress-blue-300 rotate-45 justify-center items-center flex",
                        selectedRadioOption === option ? "" : "bg-background",
                      )}
                    >
                      {selectedRadioOption === option && (
                        <Add className="h-5 w-5 text-congress-blue-900" />
                      )}
                    </button>
                  </label>
                ))}
              </div>
              <div className={cn("w-4 h-4 bg-congress-blue-900", "md:hidden")}>
                <div className="w-4 h-4 bg-background rounded-tl-4xl " />
              </div>
            </div>
          </div>
        </div>
      </div>
      <KeywordsList
        onToggle={handleToggleKeyword}
        keywords={typedKeywords}
      />
    </div>
  );
};

export default SearchBar;
