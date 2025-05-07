
const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel');

router.get('/', async (req, res) => {
  try {
    console.log('GET /api/todos request received');
    const { search, priority, status, dueDate } = req.query;
    console.log('Query params:', { search, priority, status, dueDate });
    
    const query = {};
    
    if (search) {
      query.$or = [
        { task: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'pending') {
      query.completed = false;
    }
    
    if (dueDate) {
      query.dueDate = new Date(dueDate);
    }

    console.log('Query:', query);
    
    const todos = await Todo.find(query)
      .sort({ createdAt: -1 });
      
    console.log(`Found ${todos.length} todos`);
    res.json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch todos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/todos request received');
    console.log('Request body:', req.body);

    const todo = new Todo({
      task: req.body.task,
      description: req.body.description,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      completed: false
    });

    const savedTodo = await todo.save();
    console.log('Todo saved successfully:', savedTodo);
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to add todo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log(`PUT /api/todos/${req.params.id} request received`);
    console.log('Request body:', req.body);

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    console.log('Todo updated successfully:', todo);
    res.json(todo);
  } catch (error) {
    console.error(`Error in PUT /api/todos/${req.params.id}:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to update todo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    console.log(`DELETE /api/todos/${req.params.id} request received`);

    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    console.log('Todo deleted successfully:', todo);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/todos/${req.params.id}:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to delete todo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;