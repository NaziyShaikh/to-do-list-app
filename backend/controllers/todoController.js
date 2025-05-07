   const asyncHandler = require('express-async-handler');
   const Todo = require('../models/todoModel');

  
   const getTodos = asyncHandler(async (req, res) => {
     const todos = await Todo.find({});
     res.json(todos);
   });

  
   const getTodoById = asyncHandler(async (req, res) => {
     const todo = await Todo.findById(req.params.id);
     if (todo) {
       res.json(todo);
     } else {
       res.status(404);
       throw new Error('To-Do item not found');
     }
   });

  
   const createTodo = asyncHandler(async (req, res) => {
     const { task, completed } = req.body;
     if (!task || task.trim() === '') {
       res.status(400);
       throw new Error('Task content is required');
     }
     const todo = new Todo({
       task: task.trim(),
       completed: completed || false,
     });

     const createdTodo = await todo.save();
     res.status(201).json(createdTodo);
   });

  
   const updateTodo = asyncHandler(async (req, res) => {
     const { task, completed } = req.body;
     const todo = await Todo.findById(req.params.id);
if (todo) {
       if (task !== undefined) todo.task = task.trim();
       if (completed !== undefined) todo.completed = completed;

       const updatedTodo = await todo.save();
       res.json(updatedTodo);
     } else {
       res.status(404);
       throw new Error('To-Do item not found');
     }
   });

   const deleteTodo = asyncHandler(async (req, res) => {
     const todo = await Todo.findById(req.params.id);

     if (todo) {
       await todo.remove();
       res.json({ message: 'To-Do item removed' });
     } else {
       res.status(404);
       throw new Error('To-Do item not found');
     }
   });

   module.exports = {
     getTodos,
     getTodoById,
     createTodo,
     updateTodo,
     deleteTodo,
   };
   