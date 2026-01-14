'use client';
import React, { useState } from "react";
import DocViewer from "react-doc-viewer";

const DocumentViewer = ({ documentUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="document-viewer">
      {isLoading && <div>Loading...</div>}
      <DocViewer
        documents={[
          {
            uri: documentUrl, // URL of the document
            fileType: "pdf", // You can set the fileType based on the document (pdf, pptx, docx)
          },
        ]}
        onLoad={onDocumentLoad} // Optional: to track when the document is loaded
      />
    </div>
  );
};

export default DocumentViewer;
