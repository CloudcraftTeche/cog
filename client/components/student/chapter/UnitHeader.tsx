import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Unit } from "@/utils/studentChapter.service";
interface UnitHeaderProps {
  unit: Unit;
  chapterCount: number;
  isExpanded: boolean;
  colorClass: string;
  onToggle: () => void;
}
export default function UnitHeader({
  unit,
  chapterCount,
  isExpanded,
  colorClass,
  onToggle,
}: UnitHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-5 mb-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md flex-shrink-0`}
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h3
              className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent truncate`}
            >
              {unit.name}
            </h3>
            <p className="text-gray-600 text-xs">
              {chapterCount} chapter{chapterCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Badge className={`bg-gradient-to-r ${colorClass} text-white border-0 px-2 sm:px-3 py-1 text-xs`}>
            {chapterCount}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  );
}