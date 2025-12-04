import React, { useEffect, useState } from 'react';
import { getFile } from '../../../services/operations/fileAPI';

const FileViewer = ({ fileId, fileUrl, token, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [mimeType, setMimeType] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchFile = async () => {
      if (!fileId && !fileUrl) return;
      // If fileUrl provided, prefer it (already a URL)
      if (fileUrl) {
        setObjectUrl(fileUrl);
        return;
      }
      setLoading(true);
      try {
        const resp = await getFile({ fileId, token })();
        if (!mounted) return;
        // resp is axios response with data as blob
        const blob = resp.data;
        const contentType = resp.headers && resp.headers['content-type'] ? resp.headers['content-type'] : blob.type;
        setMimeType(contentType);
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (err) {
        console.error('Failed to fetch file', err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFile();
    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, fileUrl, token]);

  if (!fileId && !fileUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-3 flex justify-between items-center border-b">
          <h3 className="font-semibold">Document Viewer</h3>
          <button className="text-lg font-bold" onClick={onClose}>×</button>
        </div>
        <div className="p-4">
          {loading && <p>Loading document...</p>}
          {error && <p className="text-red-600">Failed to load document.</p>}
          {!loading && objectUrl && (
            <div className="w-full">
              {mimeType && mimeType.includes('pdf') ? (
                <iframe src={objectUrl} title="pdf-viewer" className="w-full h-[70vh]" />
              ) : mimeType && mimeType.startsWith('image/') ? (
                <img src={objectUrl} alt="file-preview" className="max-h-[70vh] mx-auto" />
              ) : (
                <div className="flex flex-col items-center">
                  <p className="mb-2">File ready to download/view.</p>
                  <a href={objectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open in new tab / Download</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
