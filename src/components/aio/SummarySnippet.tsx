import React from 'react';

interface SummaryItem {
  term: string;
  description: string;
}

interface SummarySnippetProps {
  title?: string;
  items: SummaryItem[];
}

/**
 * SummarySnippet: 针对 AIO 优化的高密度技术摘要
 */
const SummarySnippet: React.FC<SummarySnippetProps> = ({ 
  title = "Quick Technical Summary", 
  items 
}) => {
  return (
    <div className="bg-industrial-100 border border-industrial-200 border-t-4 border-industrial-900 p-6 my-8">
      <h3 className="text-xl font-bold text-industrial-900 mb-4 uppercase tracking-tight">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="text-industrial-600 leading-relaxed">
            <span className="font-bold text-industrial-900">{item.term}</span>: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SummarySnippet;
