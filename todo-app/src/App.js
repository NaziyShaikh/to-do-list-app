import React, { useState, useEffect, useCallback } from 'react';
import { getTodos, addTodo, updateTodo, deleteTodo } from './api/todoApi';
import './App.css';

const TodoItem = ({ todo, onComplete, onIncomplete, onDelete, onEdit }) => (
  <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
    <div className="flex-1">
      <h3 className="todo-text font-semibold text-lg">
        {todo.task}
      </h3>
      <p className="text-gray-600 mt-1">{todo.description}</p>
      <div className="flex gap-3 mt-3">
        <span className={`todo-priority ${todo.priority ? todo.priority.toLowerCase() : ''}`}>
          {todo.priority || 'No Priority'}
        </span>
        {todo.dueDate && (
          <span className="todo-date">
            Due: {new Date(todo.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
    <div className="todo-actions">
      {!todo.completed ? (
        <button
          onClick={() => onComplete(todo._id)}
          className="todo-button bg-green-500 hover:bg-green-600"
        >
          Complete
        </button>
      ) : (
        <button
          onClick={() => onIncomplete(todo._id)}
          className="todo-button bg-yellow-500 hover:bg-yellow-600"
        >
          Incomplete
        </button>
      )}
      <button
        onClick={() => onEdit(todo)}
        className="todo-button bg-blue-500 hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(todo._id)}
        className="todo-button bg-red-500 hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  </div>
);

const TodoForm = ({ onSubmit, task, description, priority, dueDate, onChange }) => (
  <form onSubmit={onSubmit} className="todo-form">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <input
        type="text"
        placeholder="Task"
        value={task}
        onChange={(e) => onChange('task', e.target.value)}
        className="todo-input"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => onChange('description', e.target.value)}
        className="todo-input"
      />
      <select
        value={priority}
        onChange={(e) => onChange('priority', e.target.value)}
        className="todo-input"
      >
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => onChange('dueDate', e.target.value)}
        className="todo-input"
      />
    </div>
    <button
      type="submit"
      className="todo-button w-full md:w-auto mt-4"
    >
      Add Todo
    </button>
  </form>
);

const TodoSearch = ({ search, filterPriority, filterStatus, onChange, onSearch }) => (
  <div className="todo-form">
    <div className="flex gap-4 mb-4">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => {
            onChange('search', e.target.value);
            onSearch();
          }}
          className="todo-input pr-10"
        />
      </div>
      <select
        value={filterPriority}
        onChange={(e) => onChange('filterPriority', e.target.value)}
        className="todo-input"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select
        value={filterStatus}
        onChange={(e) => onChange('filterStatus', e.target.value)}
        className="todo-input"
      >
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  </div>
);

const EditTodo = ({ todo, onSave, onCancel, onClose }) => {
  const [editingTodo, setEditingTodo] = useState({ ...todo });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editingTodo);
  };

  const handleChange = (field, value) => {
    setEditingTodo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Todo</h2>
        <form onSubmit={handleSubmit} className="todo-form">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Task"
              value={editingTodo.task}
              onChange={(e) => handleChange('task', e.target.value)}
              className="todo-input"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={editingTodo.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="todo-input"
            />
            <select
              value={editingTodo.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="todo-input"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <input
              type="date"
              value={editingTodo.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="todo-input"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="todo-button bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="todo-button bg-blue-500 hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const todos = await getTodos(search, filterPriority, filterStatus);
      setTodos(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPriority, filterStatus, setTodos]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'task':
        setTask(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'search':
        setSearch(value);
        break;
      case 'filterPriority':
        setFilterPriority(value);
        break;
      case 'filterStatus':
        setFilterStatus(value);
        break;
      default:
        break;
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) {
      setError('Task is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addTodo(task, description, priority, dueDate);
      setTask('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const todoToUpdate = todos.find(todo => todo._id === id);
      if (!todoToUpdate) {
        throw new Error('Todo not found');
      }
      
      const updateWithTask = { ...updates, task: updates.task || todoToUpdate.task };
      
      const response = await updateTodo(id, updateWithTask);
      setTodos(todos.map(todo => (todo._id === id ? response : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTodo = (id) => {
    const todo = todos.find(todo => todo._id === id);
    if (!todo) return;
    
    handleUpdateTodo(id, { 
      completed: true,
      task: todo.task 
    });
  };

  const handleIncompleteTodo = (id) => {
    const todo = todos.find(todo => todo._id === id);
    if (!todo) return;
    
    handleUpdateTodo(id, { 
      completed: false,
      task: todo.task 
    });
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
  };

  const handleSaveTodo = async (todo) => {
    if (!editingTodo) return;

    try {
      setLoading(true);
      setError(null);
      await handleUpdateTodo(editingTodo._id, todo);
      setEditingTodo(null);
      fetchTodos(); 
    } catch (error) {
      console.error('Error saving todo:', error);
      setError('Failed to save todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  if (loading) {
    return (
      <div className="todo-container">
        <div className="todo-header">
          <h1>Todo List</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todo-container">
        <div className="todo-header">
          <h1>Todo List</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>Todo List</h1>
      </div>

      <TodoSearch
        search={search}
        filterPriority={filterPriority}
        filterStatus={filterStatus}
        onChange={handleInputChange}
        onSearch={fetchTodos}
      />

      <TodoForm
        onSubmit={handleAddTodo}
        task={task}
        description={description}
        priority={priority}
        dueDate={dueDate}
        onChange={handleInputChange}
      />

      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <p>No todos found. Add a new todo above!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onComplete={handleCompleteTodo}
              onIncomplete={handleIncompleteTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          ))
        )}
      </div>

      {editingTodo && (
        <EditTodo
          todo={editingTodo}
          onSave={handleSaveTodo}
          onCancel={handleCancelEdit}
          onClose={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default App;