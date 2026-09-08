import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listProblems } from '../data/repositories/problemsRepository';
import { listTemplates, upsertTemplate } from '../data/repositories/templatesRepository';
import { getPatternsInUse } from '../data/patternUsage';
import TemplateCard from '../components/TemplateCard';

export default function PatternLibraryPage() {
  const { pattern: targetPattern } = useParams();
  const decodedTarget = targetPattern ? decodeURIComponent(targetPattern) : null;
  const [patterns, setPatterns] = useState(null);
  const [templates, setTemplates] = useState({});

  async function refresh() {
    const [problems, templateList] = await Promise.all([listProblems(), listTemplates()]);
    setPatterns(getPatternsInUse(problems));
    const map = {};
    templateList.forEach((t) => {
      map[t.pattern] = t;
    });
    setTemplates(map);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave(pattern, content) {
    await upsertTemplate(pattern, content);
    await refresh();
  }

  if (patterns === null) {
    return <div className="page" />;
  }

  return (
    <div className="page">
      <h1>Pattern Template Library</h1>
      {patterns.length === 0 ? (
        <p className="hint-text">Tag a problem with a pattern to see it appear here.</p>
      ) : (
        <div className="template-list">
          {patterns.map((pattern) => (
            <TemplateCard
              key={pattern}
              pattern={pattern}
              template={templates[pattern]}
              highlighted={pattern === decodedTarget}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
