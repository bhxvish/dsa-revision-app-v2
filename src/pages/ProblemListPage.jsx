import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../data/repositories/problemsRepository';
import { listPatterns, addPattern } from '../data/repositories/patternsRepository';
import { listMockSessions } from '../data/repositories/mockSessionsRepository';
import { isDue } from '../data/scheduling';
import { computePatternScores, getWeaknessRank } from '../data/analytics';
import StatusBadge from '../components/StatusBadge';
import ProblemFormModal from '../components/ProblemFormModal';
import { STATUSES, STATUS_META } from '../constants/status';

export default function ProblemListPage() {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [mockSessions, setMockSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [patternFilter, setPatternFilter] = useState(() => searchParams.get('pattern') || 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [p, pat, mock] = await Promise.all([listProblems(), listPatterns(), listMockSessions()]);
    setProblems(p);
    setPatterns(pat);
    setMockSessions(mock);
  }

  async function handleCreatePattern(name) {
    setPatterns(await addPattern(name));
  }

  async function handleSubmit(form) {
    if (editing) {
      await updateProblem(editing.id, form);
    } else {
      await createProblem(form);
    }
    setModalOpen(false);
    setEditing(null);
    refresh();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this problem? This cannot be undone.')) return;
    await deleteProblem(id);
    refresh();
  }

  const dueCount = useMemo(() => problems.filter((p) => isDue(p)).length, [problems]);

  const patternScores = useMemo(() => computePatternScores(problems, mockSessions), [problems, mockSessions]);

  const filtered = useMemo(() => {
    return problems
      .filter((p) => {
        if (statusFilter === 'unrated' && p.status) return false;
        if (statusFilter !== 'all' && statusFilter !== 'unrated' && p.status !== statusFilter) return false;
        if (patternFilter !== 'all' && !p.patterns.includes(patternFilter)) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = (a.nextReviewDate || '').localeCompare(b.nextReviewDate || '');
        if (dateCompare !== 0) return dateCompare;
        // Among ties (mainly untracked problems, which all share a null date),
        // surface the weakest-pattern ones first.
        return getWeaknessRank(patternScores, a.patterns) - getWeaknessRank(patternScores, b.patterns);
      });
  }, [problems, statusFilter, patternFilter, search, patternScores]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Problems</h1>
        <div className="page-header-actions">
          <Link to="/bulk-add" className="btn-secondary">
            Bulk Add
          </Link>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            + Add Problem
          </button>
        </div>
      </div>

      {dueCount > 0 && (
        <Link to="/recall" className="due-banner">
          <strong>{dueCount}</strong> problem{dueCount === 1 ? '' : 's'} due for review — start Quick Recall Check
        </Link>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="unrated">{STATUS_META.unrated.label}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select value={patternFilter} onChange={(e) => setPatternFilter(e.target.value)}>
          <option value="all">All patterns</option>
          {patterns.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="problem-table">
        <div className="problem-row problem-row-header">
          <span>Title</span>
          <span>Category</span>
          <span>Patterns</span>
          <span>Status</span>
          <span>Next Review</span>
          <span>Reviews</span>
          <span />
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">No problems match. Add one to get started.</div>
        )}
        {filtered.map((p) => (
          <div className="problem-row" key={p.id}>
            <span className="problem-title">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.title}
                </a>
              ) : (
                p.title
              )}
            </span>
            <span>{p.neetcodeCategory}</span>
            <span className="pattern-chips">
              {p.patterns.map((tag) => (
                <Link key={tag} to={`/templates/${encodeURIComponent(tag)}`} className="tag-chip-sm tag-chip-link">
                  {tag}
                </Link>
              ))}
            </span>
            <span>
              <StatusBadge status={p.status} />
            </span>
            <span>{p.nextReviewDate}</span>
            <span>{p.timesReviewed}</span>
            <span className="row-actions">
              {!p.status && (
                <Link to={`/practice/${p.id}`} className="btn-link">
                  Practice
                </Link>
              )}
              <button
                className="btn-link"
                onClick={() => {
                  setEditing(p);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
              <button className="btn-link btn-danger" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ProblemFormModal
          key={editing ? editing.id : 'new'}
          initial={editing}
          availablePatterns={patterns}
          onCreatePattern={handleCreatePattern}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
