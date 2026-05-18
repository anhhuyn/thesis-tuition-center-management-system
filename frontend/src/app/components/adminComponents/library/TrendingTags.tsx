// src/app/components/library/TrendingTags.tsx
import React from 'react';

interface TrendingTagsProps {
  tags: string[];
  onTagClick: (tag: string) => void;
}

export const TrendingTags: React.FC<TrendingTagsProps> = ({ tags, onTagClick }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Xu hướng từ khóa</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onTagClick(tag)}
            className="px-3 py-1.5 bg-white border border-slate-100 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};