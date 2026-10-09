import React from 'react';

interface TextListProps {
  text?: string;
  className?: string;
}

export function TextList({ text, className = "" }: TextListProps) {
  if (!text) return null;
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (lines.length > 1) {
    return (
      <ul className={`list-disc pl-5 space-y-1 ${className}`}>
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^[-•*]\s*/, '')}</li>
        ))}
      </ul>
    );
  }
  
  return <p className={className}>{text}</p>;
}
