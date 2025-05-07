
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/todos';

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
    console.error('Error fetching todos:', error);
    throw error;
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
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodo = async (id, updates) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};