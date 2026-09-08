import { useEffect, useRef, useState } from 'react';

export default function TemplateCard({ pattern, template, highlighted, onSave }) {
  const [content, setContent] = useState(template?.content || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (highlighted && textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textareaRef.current.focus();
    }
  }, [highlighted]);

  return (
    <div className={`template-card ${highlighted ? 'template-card-highlighted' : ''}`}>
      <div className="template-card-header">
        <h2>{pattern}</h2>
        {template?.lastUpdated && <span className="hint-text">Updated {template.lastUpdated}</span>}
      </div>
      <textarea
        ref={textareaRef}
        className="template-textarea"
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => onSave(pattern, content)}
        placeholder="Write the minimal generic skeleton for this pattern..."
        spellCheck={false}
      />
    </div>
  );
}
