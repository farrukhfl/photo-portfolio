'use client';

import { useRef, useState } from 'react';

export default function TagsInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef();

  function commit(raw = draft) {
    const tags = raw.split(',').map((t) => t.trim()).filter((t) => t && !value.includes(t));
    if (tags.length) onChange([...value, ...tags]);
    setDraft('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function onPaste(e) {
    e.preventDefault();
    commit(e.clipboardData.getData('text'));
  }

  return (
    <div className="tags-input" onClick={() => inputRef.current?.focus()}>
      {value.map((t) => (
        <span className="tag" key={t}>
          <span className="tag-label">{t}</span>
          <button
            type="button"
            className="tag-remove"
            onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== t)); }}
            aria-label={`Remove ${t}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit()}
        onPaste={onPaste}
        placeholder={value.length ? '' : placeholder}
      />
    </div>
  );
}
