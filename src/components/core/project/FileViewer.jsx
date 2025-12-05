import React, { useEffect, useState } from 'react';

const FileViewer = ({ fileId, fileUrl, token, onClose }) =>
{
  const [objectUrl, setObjectUrl] = useState(null);
  const [mimeType, setMimeType] = useState(null);

  useEffect(() =>
  {
    console.log("FileViewer mounted with fileId:", fileId, "fileUrl:", fileUrl);
    // If fileUrl is available → directly use it
    if (fileUrl)
    {
      setObjectUrl(fileUrl);

      // Determine MIME type from extension
      const ext = fileUrl.split('.').pop().toLowerCase();

      if (ext === "pdf") setMimeType("application/pdf");
      else if (["png", "jpg", "jpeg", "gif"].includes(ext))
        setMimeType("image/" + ext);
      else setMimeType("unknown");

      return;
    }

    // If fileUrl is NOT available, fallback to backend fetching
    const fetchFile = async () =>
    {
      if (!fileId) return;

      console.log("file id is not present");
    };

    fetchFile();

    return () =>
    {
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, fileUrl, token]);

  if (!objectUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-3 flex justify-between items-center border-b">
          <h3 className="font-semibold">Document Viewer</h3>
          <button className="text-lg font-bold" onClick={onClose}>×</button>
        </div>

        <div className="p-4">
          {mimeType.includes("pdf") ? (
            <iframe src={objectUrl} title="pdf-viewer" className="w-full h-[70vh]" />
          ) : mimeType.startsWith("image/") ? (
            <img src={objectUrl} alt="file-preview" className="max-h-[70vh] mx-auto" />
          ) : (
            <div className="flex flex-col items-center">
              <p className="mb-2">File ready to download/view.</p>
              <a href={objectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Open in new tab / Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
