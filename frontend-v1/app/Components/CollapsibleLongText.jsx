import { useState } from 'react';
import { Button } from "@/components/ui/button";

const CollapsibleLongText = ({ text, limit = 100 }) => {
  const [expanded, setExpanded] = useState(false);

  const isTextLong = typeof text === 'string' && text.length > limit;

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="text-sm break-words">
      {typeof text === 'string' ? (
        <>
          {expanded || !isTextLong
            ? text
            : `${text.substring(0, limit)}...`}
          {isTextLong && (
            <Button
              variant="link"
              onClick={toggleExpand}
              className="p-0 h-auto ml-1 font-normal text-indigo-600 hover:text-indigo-800"
            >
              {expanded ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </>
      ) : (
        // If it's JSX (like Highlighter), always show fully, with optional expand toggle if needed
        <div>
          {text}
        </div>
      )}
    </div>
  );
};

export default CollapsibleLongText;
