import type { ReactNode } from "react";

export interface GenreTemplateSectionProps {
  genre?: string;
  templates?: ReactNode;
  onViewAll?: () => void;
  className?: string;
}

export function GenreTemplateSection({
  genre = "Electronic",
  templates,
  onViewAll,
  className = "",
}: GenreTemplateSectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">{genre}</h3>
        {onViewAll ? (
          <button type="button" onClick={onViewAll} className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates}
      </div>
    </div>
  );
}
