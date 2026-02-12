import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium' });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTasks(selectedProject);
  }, [selectedProject]);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('saas_token')}` });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/projects`, { headers: authHeader() });
      setProjects(res.data.data.projects);
      if (res.data.data.projects.length > 0 && !selectedProject) {
        setSelectedProject(res.data.data.projects[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    setTasksLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/projects/${projectId}/tasks`, { headers: authHeader() });
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskCreate = async (e) => {
    e.preventDefault();
    if (!selectedProject) return alert('Select a project first');
    try {
      await axios.post(`${API_BASE}/api/projects/${selectedProject}/tasks`, taskForm, { headers: authHeader() });
      setTaskForm({ title: '', priority: 'medium' });
      fetchTasks(selectedProject);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <header className="header-actions">
        <div>
          <p className="eyebrow">Project Summary</p>
          <h1>Overview</h1>
        </div>
        <div className="pill">Local Server: Online</div>
      </header>

      <section className="stat-grid">
        <div className="stat-card">
          <p className="eyebrow">Projects</p>
          <h2>{projects.length}</h2>
          <p className="muted">Private storage</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Tasks</p>
          <h2>{projects.reduce((sum, p) => sum + Number(p.task_count || 0), 0)}</h2>
          <p className="muted">Project tasks</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Account Health</p>
          <h2>98%</h2>
          <p className="muted">Server uptime</p>
        </div>
      </section>

      <section className="task-layout">
        <div className="panel">
          <p className="eyebrow">Quick Action</p>
          <h3>Quick Task Input</h3>
          {projects.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <p className="muted" style={{ marginBottom: '1rem' }}>No projects available to assign tasks.</p>
              <a href="/projects" className="btn primary small" style={{ textDecoration: 'none' }}>Create First Project</a>
            </div>
          ) : (
            <form onSubmit={handleTaskCreate} className="form-grid">
              <div className="field">
                <span>Target Project</span>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field">
                <span>Task Title</span>
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <button type="submit" className="btn primary">Add Task</button>
            </form>
          )}
        </div>

        <div className="panel">
          <p className="eyebrow">Current Activities</p>
          <h3>Active Project Tasks ({tasks.length})</h3>
          <div className="task-list">
            {tasksLoading ? <p>Loading...</p> : tasks.length === 0 ? <p className="muted">No work in progress.</p> : tasks.map(t => (
              <div key={t.id} className="task-card">
                <div className="task-meta">
                  <span className={`pill ${t.priority}`}>{t.priority}</span>
                  <span className="muted">{t.status}</span>
                </div>
                <h4>{t.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
