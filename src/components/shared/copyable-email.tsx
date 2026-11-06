'use client';

import { useState, useCallback } from 'react';

interface CopyableEmailProps {
  subject: string;
  body: string;
}

/** Subject line, scrollable body preview, and copy buttons for a generated email. */
export function CopyableEmail({ subject, body }: CopyableEmailProps) {
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null);

  const handleCopy = useCallback(async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied((c) => (c === type ? null : c)), 2000);
    } catch {
      // clipboard API may not be available in some contexts
    }
  }, []);

  return (
    <>
      {/* Subject line */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">Subject</span>
        <span className="text-sm text-gray-900 flex-1 truncate">{subject}</span>
        <button
          type="button"
          onClick={() => handleCopy(subject, 'subject')}
          className="shrink-0 text-xs font-medium text-rula-sp3 hover:text-rula-purple transition-colors"
        >
          {copied === 'subject' ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Email body */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
        {body}
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleCopy(body, 'body')}
          className="inline-flex items-center rounded-full bg-rula-sp3 text-rula-sand px-5 py-2.5 text-sm font-medium hover:bg-rula-purple transition-colors"
        >
          {copied === 'body' ? 'Copied!' : 'Copy Email'}
        </button>
      </div>
    </>
  );
}
