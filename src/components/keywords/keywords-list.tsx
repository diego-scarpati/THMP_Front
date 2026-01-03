import { useUserKeywords } from "@/hooks/use-keywords";
import Skill from "../ui/skill";
import Add from "@/icons/add.svg";
import { cn } from "@/lib/utils";

interface KeywordsListProps {
  onClickFunction?: (keyword: string) => void; // delete handler
  onAddFunction?: (keyword: string) => void; // add handler
  keywords?: string[]; // typed keywords
}

const KeywordsList = ({
  onClickFunction,
  onAddFunction,
  keywords,
}: KeywordsListProps) => {
  let keywordList;
  if (keywords && keywords.length > 0) {
    keywordList = keywords;
  }
  const { data, isLoading, error } = useUserKeywords();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading keywords</div>;
  return (
    <div className="flex gap-3 my-2 p-1 rounded-lg items-center px-4">
      <h4 className="font-semibold text-md text-congress-blue-900 align-middle">
        Used Keywords:
      </h4>

      {/* API keywords */}
      {data &&
        data.map((keyword) => {
          const kw = keyword.keyword;
          const isAdded = keywords && keywords.includes(kw);
          return (
            <div key={keyword.id} className="relative">
              <Skill
                skill={kw}
                size="sm"
                variant={isAdded ? "active" : "inactive"}
                // keep pill click behavior: delete if present, no-op otherwise
                onClick={() => onClickFunction && onClickFunction(kw)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAdded) {
                    onAddFunction && onAddFunction(kw);
                  } else {
                    onClickFunction && onClickFunction(kw);
                  }
                }}
                aria-label={isAdded ? `Remove ${kw}` : `Add ${kw}`}
                className={cn(
                  "absolute -top-2 -right-2 grid place-items-center h-5 w-5 rounded-full border transition-transform duration-200 cursor-pointer",
                  isAdded
                    ? "rotate-45 bg-congress-blue-900 border-congress-blue-900 text-congress-blue-200 hover:bg-congress-blue-700"
                    : "bg-congress-blue-200 border-congress-blue-300 text-congress-blue-900 hover:bg-congress-blue-300"
                )}
              >
                <Add className="h-3 w-3" />
                {/* <img src="/icons/add.svg" alt="Add" className="h-3 w-3" /> */}
              </button>
            </div>
          );
        })}

      {/* typed keywords rendered after API list */}
      {keywordList
        ?.filter((keyword) => !data?.some((kw) => kw.keyword === keyword)) // only show typed keywords not present in API data
        .map((keyword, index) => (
          <div key={`${keyword}-${index}`} className="relative">
            <Skill
              skill={keyword}
              size="sm"
              variant="active"
              onClick={() => onClickFunction && onClickFunction(keyword)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickFunction && onClickFunction(keyword);
              }}
              aria-label={`Remove ${keyword}`}
              className="absolute -top-2 -right-2 grid place-items-center h-6 w-6 rounded-full border bg-congress-blue-900 border-congress-blue-900 text-congress-blue-200 rotate-45 transition-transform duration-200"
            >
              <Add className="h-3 w-3" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default KeywordsList;
