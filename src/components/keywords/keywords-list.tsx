import { useUserKeywords } from "@/hooks/use-keywords";
import Skill from "../ui/skill";
import Add from "@/icons/add.svg";
import { cn } from "@/lib/utils";
import KeywordsListSkeleton from "@/components/ui/keywords-list-skeleton";

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

  if (isLoading) return <KeywordsListSkeleton />;
  if (error) return <div>Error loading keywords</div>;
  return (
    <div className="flex flex-wrap gap-3 mb-2 mt-3 p-1 rounded-lg items-center px-4">
      <h4 className="text-sm font-semibold text-neutral-700 align-middle">
        Used Keywords:
      </h4>

      {/* API keywords */}
      {data &&
        data.map((keyword) => {
          const kw = keyword.keyword;
          const isAdded = keywords && keywords.includes(kw);
          return (
            <div key={keyword.id} className="relative cursor-pointer">
              <Skill
                skill={kw}
                size="sm"
                variant={isAdded ? "active" : "inactive"}
                // keep pill click behavior: delete if present, no-op otherwise
                onClick={() => {
                  if (!isAdded) {
                    onAddFunction && onAddFunction(kw);
                  } else {
                    onClickFunction && onClickFunction(kw);
                  }
                }}
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
                    ? "rotate-45 bg-primary-600 border-primary-600 text-white hover:bg-primary-700"
                    : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-primary-50 hover:border-primary-300",
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
              className="absolute -top-2 -right-2 grid place-items-center h-6 w-6 rounded-full border bg-primary-600 border-primary-600 text-white rotate-45 transition-transform duration-200"
            >
              <Add className="h-3 w-3" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default KeywordsList;
