'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={textareaId} className="input-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
