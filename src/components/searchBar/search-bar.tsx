import {
  useSearchAndCreateWithAllKeywords,
  useUserInclusions,
  useUserExclusions,
} from "@/hooks";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import KeywordsList from "../keywords/keywords-list";
import Add from "../../../public/icons/add.svg";
import MagnifyingGlass from "../../../public/icons/magnifying_glass.svg";
import Skill from "../ui/skill";
import { Exclusion, Inclusion } from "@/types/api";

const SearchBar = () => {
  const [searchBarKeyword, setSearchBarKeyword] = useState<string>("");
  const [typedKeywords, setTypedKeywords] = useState<string[]>([]);
  const searchAndCreateJobs = useSearchAndCreateWithAllKeywords();
  const { data: userInclusions } = useUserInclusions();
  const { data: userExclusions } = useUserExclusions();
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSearchNewJobs = async () => {
    if (typedKeywords.length === 0) return;
    const newJobs = await searchAndCreateJobs.mutateAsync({
      keywords: typedKeywords,
    });
    console.log("🚀 ~ handleSearchNewJobs ~ newJobs:", newJobs);
  };

  const handleDeletingTypedKeywords = (target: string) => {
    setTypedKeywords((prev) => prev.filter((keyword) => keyword !== target));
  };

  // const handleIsEditable = () => {
  //   setIsEditable((prev) => !prev);
  // };

  // show add button only when more than 1 character has been typed
  const showAdd = searchBarKeyword.trim().length > 1;

  return (
    <div className="w-full flex flex-col mb-4">
      <div
        className="flex justify-between w-full max-w-[800px] mx-auto mt-6 mb-4 px-4 py-2 border border-congress-blue-900 rounded-3xl"
        id="search_bar"
        onClick={() => inputRef.current?.focus()}
      >
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
            if (e.key === "Enter" && searchBarKeyword.trim().length > 1) {
              e.preventDefault();
              setTypedKeywords((prev) => [...prev, searchBarKeyword.trim()]);
              setSearchBarKeyword("");
              handleSearchNewJobs();
            }
          }}
          placeholder="Type keywords to search jobs..."
          className="w-[65%] text-base/[1rem] outline-none"
        />
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleAddingKeywordsInput}
            aria-hidden={!showAdd}
            className={cn(
              "flex items-center rounded-full text-sm/[1rem] font-semibold py-1.5 px-3 mr-2 transform transition-all duration-300 ease-out",
              showAdd
                ? "bg-congress-blue-900 text-congress-blue-200 opacity-100 translate-x-0 pointer-events-auto"
                : "bg-transparent text-congress-blue-900 opacity-0 translate-x-4 pointer-events-none"
            )}
          >
            <span className="">Add</span>
            <Add className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-center mr-2 rounded-full bg-congress-blue-300 py-1.5 px-2 h-8">
            <p className="text-congress-blue-900 text-sm/[1rem] font-semibold px-2 h-5 leading-[20px]">
              #: <span>{typedKeywords.length}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSearchNewJobs}
            className="group flex cursor-pointer border border-transparent hover:border-congress-blue-900 p-1.5 rounded-full transition-colors duration-200 overflow-hidden"
          >
            <MagnifyingGlass className="h-5 w-5 text-congress-blue-900 group-hover:text-congress-blue-700 transition-colors duration-200" />
            <div
              className="relative ml-1 h-5 w-0 overflow-hidden transition-[width] duration-300 ease-out group-hover:w-[48px]"
              aria-hidden="true"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 text-congress-blue-900 text-sm/[1rem] font-semibold leading-[20px] whitespace-nowrap transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                Search
              </span>
            </div>
          </button>
        </div>
      </div>
      <KeywordsList
        onClickFunction={handleDeletingTypedKeywords}
        onAddFunction={handleAddingUserKeywords}
        keywords={typedKeywords}
      />
      {/* <div className="flex flex-wrap mt-2 px-4 gap-2">
        <div>
          <p className="text-md font-semibold">Inclusions: {userInclusions ? userInclusions.length : 0}</p>
          <div className="flex gap-1 flex-wrap mt-2">
            {userInclusions &&
              userInclusions?.map((inclusion: Inclusion) => (
                <Skill key={inclusion.id} skill={inclusion.title} size="sm" />
              ))}
          </div>
        </div>
        <div>
          <p className="text-md font-semibold">Exclusions: {userExclusions ? userExclusions.length : 0}</p>
          <div className="flex gap-1 flex-wrap mt-2">
            {userExclusions &&
              userExclusions?.map((exclusion: Exclusion) => (
                <Skill key={exclusion.id} skill={exclusion.title} size="sm" />
              ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default SearchBar;
