import { useState, useEffect } from 'react';
import API from '../api';

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const { data } = await API.post('/tasks', { title, description });
      setTasks([data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Error creating task');
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const { data } = await API.put(`/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map((t) => (t.id === id ? data : t)));
    } catch (err) {
      alert('Error updating task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert('Error deleting task');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <h1 className="text-xl font-bold">Welcome, {user.name || user.email} 👋</h1>
            <p className="text-xs text-slate-400">Local Task Tracker</p>
          </div>
          <button onClick={onLogout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition">
            Logout
          </button>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleCreateTask} className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Task Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg transition">
            + Add Task
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-slate-500 py-6">No tasks found. Create one above!</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                    className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                  />
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-400 p-2 transition">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}