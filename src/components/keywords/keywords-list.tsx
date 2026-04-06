import { useUserKeywords } from "@/hooks/use-keywords";
import Skill from "../ui/skill";
import Add from "@/icons/add.svg";
import { cn } from "@/lib/utils";
import KeywordsListSkeleton from "@/components/ui/keywords-list-skeleton";

interface KeywordsListProps {
  onToggle: (keyword: string) => void;
  keywords?: string[];
}

const KeywordsList = ({
  onToggle,
  keywords,
}: KeywordsListProps) => {
  const { data, isLoading, error } = useUserKeywords();

  if (isLoading) return <KeywordsListSkeleton />;
  if (error) return <div>Error loading keywords</div>;

  return (
    <div className="flex flex-wrap gap-3 mb-2 mt-3 p-1 rounded-lg items-center px-4">
      <h4 className="font-semibold text-md text-congress-blue-900 align-middle">
        Used Keywords:
      </h4>

      {data &&
        data.map((keyword) => {
          const kw = keyword.keyword;
          const isAdded = keywords && keywords.includes(kw);
          return (
            <div key={keyword.id} className="relative cursor-pointer" 
            // onClick={() => onToggle(kw)}
            >
              <Skill
                skill={kw}
                size="sm"
                variant={isAdded ? "active" : "inactive"}
                onClick={() => onToggle(kw)}
              />
              <span
                className={cn(
                  "absolute -top-2 -right-2 grid place-items-center h-5 w-5 rounded-full border pointer-events-none transition-transform duration-200",
                  isAdded
                    ? "rotate-45 bg-congress-blue-900 border-congress-blue-900 text-congress-blue-200"
                    : "bg-congress-blue-200 border-congress-blue-300 text-congress-blue-900"
                )}
              >
                <Add className="h-3 w-3 cursor-pointer"/>
              </span>
            </div>
          );
        })}

      {keywords
        ?.filter((keyword) => !data?.some((kw) => kw.keyword === keyword))
        .map((keyword, index) => (
          <div key={`${keyword}-${index}`} className="relative">
            <Skill
              skill={keyword}
              size="sm"
              variant="active"
              onClick={() => onToggle(keyword)}
            />
            <span className="absolute -top-2 -right-2 grid place-items-center h-5 w-5 rounded-full border pointer-events-none rotate-45 bg-congress-blue-900 border-congress-blue-900 text-congress-blue-200">
              <Add className="h-3 w-3" />
            </span>
          </div>
        ))}
    </div>
  );
};

export default KeywordsList;
