import { useState, useEffect, useMemo } from 'react';
import './App.css';

function load() {
  try {
    const raw = localStorage.getItem('todo:items');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function App() {
  const [items, setItems] = useState(load);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('todo:items', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  function addTask(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setItems([{ id: Date.now(), text: value, done: false }, ...items]);
    setText('');
  }

  function toggle(id) {
    setItems(items.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function remove(id) {
    setItems(items.filter(i => i.id !== id));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function saveEdit(id) {
    const value = editText.trim();
    if (!value) {
      remove(id);
    } else {
      setItems(items.map(i => (i.id === id ? { ...i, text: value } : i)));
    }
    setEditingId(null);
  }

  function clearDone() {
    setItems(items.filter(i => !i.done));
  }

  const visible = useMemo(() => {
    if (filter === 'active') return items.filter(i => !i.done);
    if (filter === 'done') return items.filter(i => i.done);
    return items;
  }, [items, filter]);

  const remaining = items.filter(i => !i.done).length;
  const hasDone = items.some(i => i.done);

  return (
    <div className="app">
      <h1>Todo</h1>
      <p className="sub">
        {remaining === 0 ? 'Nothing left to do.' : `${remaining} task${remaining === 1 ? '' : 's'} remaining`}
      </p>

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Add a task"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={140}
        />
        <button className="add-btn" type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>

      <div className="tabs">
        {['all', 'active', 'done'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">{items.length === 0 ? 'Add your first task above.' : 'Nothing here.'}</div>
      ) : (
        <ul>
          {visible.map(item => (
            <li key={item.id}>
              <button
                className={'check' + (item.done ? ' done' : '')}
                onClick={() => toggle(item.id)}
                aria-label="Toggle done"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>

              {editingId === item.id ? (
                <div className="text">
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveEdit(item.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(item.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                </div>
              ) : (
                <div className={'text' + (item.done ? ' done' : '')} onClick={() => startEdit(item)}>
                  {item.text}
                </div>
              )}

              <button className="del" onClick={() => remove(item.id)} aria-label="Delete task">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="footer">
          <span>{items.length} total</span>
          {hasDone && <button onClick={clearDone}>Clear done</button>}
        </div>
      )}
    </div>
  );
}