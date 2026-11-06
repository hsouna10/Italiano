import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into blocks by double newline or single newline if section headers
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="space-y-1.5 my-3 pl-2">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A423D] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C04A33] mt-2 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process **bold**, *italic*, and `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-[#1F1A17]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-[#C04A33] font-serif">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EAE4DA] text-xs font-mono text-[#C04A33]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    // Flush any pending list
    flushList(index);

    if (!trimmed) {
      // Empty line / paragraph break
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="font-serif font-bold text-base sm:text-lg text-[#1F1A17] mt-5 mb-2">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="font-serif text-lg sm:text-xl font-normal text-[#1F1A17] mt-6 mb-2.5 pb-1 border-b border-[#F2ECE3]">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="font-serif text-xl sm:text-2xl font-bold text-[#1F1A17] mt-6 mb-3">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
    } else {
      elements.push(
        <p key={`p-${index}`} className="text-xs sm:text-sm text-[#4A423D] leading-relaxed my-2">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
