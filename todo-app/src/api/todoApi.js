import axios from 'axios';

const API_URL = 'https://to-do-list-app-fjhc.onrender.com/api/todos';

export const getTodos = async (search = '', priority = '', status = '', dueDate = '') => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        search,
        priority,
        status,
        dueDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching todos:', error.response?.data?.message || error.message);
    throw new Error('Failed to fetch todos. Please try again.');
  }
};

export const addTodo = async (task, description = '', priority = 'Medium', dueDate = null) => {
  try {
    const response = await axios.post(API_URL, {
      task,
      description,
      priority,
      dueDate
    });
    return response.data;
  } catch (error) {
    console.error('Error adding todo:', error.response?.data?.message || error.message);
    throw new Error('Failed to add todo. Please try again.');
  }
};

export const updateTodo = async (id, updates) => {
  try {
    if (!id) {
      throw new Error('Todo ID is required');
    }
    if (!updates || !updates.task) {
      throw new Error('Task is required for update');
    }

    const response = await axios.put(`${API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating todo:', error.response?.data?.error || error.message);
    throw new Error('Failed to update todo. Please try again.');
  }
};

export const deleteTodo = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting todo:', error.response?.data?.message || error.message);
    throw new Error('Failed to delete todo. Please try again.');
  }
};