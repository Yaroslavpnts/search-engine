interface HighlightedTextProps {
  text: string;
  query: string;
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) {
    return <span className="font-bold">{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <span>{text}</span>;
  }

  const beforeMatch = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const afterMatch = text.slice(matchIndex + query.length);

  return (
    <>
      {beforeMatch && <span>{beforeMatch}</span>}
      <span className="font-bold">{match}</span>
      {afterMatch && <span>{afterMatch}</span>}
    </>
  );
}
