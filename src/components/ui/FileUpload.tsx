'use client';

import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
}

export function FileUpload({
  onFilesSelected,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  multiple = true,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(
      (f) => f.size <= maxSizeMB * 1024 * 1024
    );
    setFiles((prev) => [...prev, ...validFiles]);
    onFilesSelected(validFiles);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div>
      <div
        className={`file-upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="file-upload-icon">📄</div>
        <div className="file-upload-text">
          <strong>Click to upload</strong> or drag and drop
          <br />
          PDF, JPG, PNG, DOC up to {maxSizeMB}MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-item">
              <span style={{ fontSize: '1.2rem' }}>📎</span>
              <span className="file-item-name">{file.name}</span>
              <span className="file-item-size">{formatSize(file.size)}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
