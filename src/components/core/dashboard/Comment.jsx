import React from 'react';
import { Trash2, Download } from 'lucide-react';

export default function Comment({ onDelete, comment, currentUserId = null })
{
  if (!comment) return null;

  const user = comment.user ?? 'Unknown' ;
  console.log("COMMENT =", comment);
  console.log("USER OBJ =", user);
  console.log("CURRENT USER =", currentUserId);

  const formatDate = (d) =>
  {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString();
  };

  // normalize file info - backend may return different shapes
  const fileObj = (() =>
  {
    const f = comment.file;
    if (!f) return null;

    return {
      url: f.fileURL ?? f.fileUrl ?? f.url ?? null,   // add fileURL support
      name: f.fileName ?? f.name ?? null,
      id: f.fileId ?? f.id ?? null,
    };
  })();


  console.log("file in comment: " + fileObj);

  return (
    <div className="flex gap-3 p-2 border rounded">
      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
        {user.userName ? user.userName.split(' ').map(s => s[0]).slice(0, 2).join('') : '?'}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-800">{user.userName ?? 'Unknown'}</div>
          <div className="text-xs text-gray-400">{formatDate(comment.commentCreatedAt ?? comment.createdAt ?? comment.commentCreated)}</div>
        </div>

        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.commentMessage ?? comment.message ?? ''}</div>

        {fileObj && fileObj.url && (
          <div className="mt-2 flex items-center gap-3">
            <a href={fileObj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>{fileObj.name ?? 'Attachment'}</span>
            </a>
          </div>
        )}

        {/* optional actions - delete if authored by current user (UI only) */}
        {currentUserId && user.userId && Number(currentUserId) === Number(user.userId) && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
            <button onClick={() => onDelete(comment.commentId)} className="flex items-center gap-1 text-red-600 hover:underline">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
