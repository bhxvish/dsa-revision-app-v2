import { useState } from 'react';

export default function PatternTagInput({ value, onChange, availablePatterns, onCreatePattern }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = availablePatterns.filter(
    (p) => !value.includes(p) && p.toLowerCase().includes(input.toLowerCase())
  );

  function addTag(tag) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    if (!availablePatterns.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      onCreatePattern(trimmed);
    }
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="tag-input">
      <div className="tag-input-tags">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? '' : 'Add pattern...'}
        />
      </div>
      {showSuggestions && input && (
        <div className="tag-suggestions">
          {suggestions.slice(0, 8).map((s) => (
            <div key={s} className="tag-suggestion" onMouseDown={() => addTag(s)}>
              {s}
            </div>
          ))}
          {input.trim() && !availablePatterns.some((p) => p.toLowerCase() === input.trim().toLowerCase()) && (
            <div className="tag-suggestion tag-suggestion-new" onMouseDown={() => addTag(input)}>
              Create "{input.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
