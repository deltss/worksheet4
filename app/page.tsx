'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setTasks(data);
        setError(null);
      } else {
        console.error('API Error:', data);
        setTasks([]);
        setError('Failed to load tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
      setError('Failed to connect to API');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      if (editingId) {
        const res = await fetch(`/api/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update');
        }
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create');
        }
      }
      
      setTitle('');
      setDescription('');
      setEditingId(null);
      await fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(`Failed to save task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setEditingId(task.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus task ini?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE' 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }
      
      await fetchTasks();
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(`Failed to delete task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }
      
      await fetchTasks();
      setError(null);
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(`Failed to update task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        📝 Task Manager
      </h1>

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #fecaca'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        border: '2px solid #e5e7eb', 
        borderRadius: '12px',
        background: '#f9fafb'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#374151' }}>
          {editingId ? '✏️ Edit Task' : '➕ Add New Task'}
        </h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: editingId ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !title.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: (loading || !title.trim()) ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading && title.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? '⏳ Loading...' : editingId ? '💾 Update Task' : '➕ Add Task'}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setTitle('');
                setDescription('');
                setEditingId(null);
                setError(null);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6b7280';
              }}
            >
              ❌ Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#111827' }}>
          📋 Tasks ({tasks.length})
        </h2>
        {tasks.length > 0 && (
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {tasks.filter(t => t.completed).length} completed
          </span>
        )}
      </div>
      
      {tasks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#9ca3af',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ fontSize: '1.125rem' }}>No tasks yet. Add your first task above!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '1.25rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                background: task.completed ? '#f0fdf4' : 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#10b981' : '#111827',
                    marginBottom: '0.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '600'
                  }}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>
                      {task.description}
                    </p>
                  )}
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    marginTop: '0.5rem'
                  }}>
                    Created: {new Date(task.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleComplete(task)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: task.completed ? '#10b981' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {task.completed ? '✅ Done' : '⭕ To Do'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(task)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}