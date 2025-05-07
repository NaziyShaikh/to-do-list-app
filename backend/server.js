const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Root route added for backend to display api 
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Todo App API',
    version: '1.0.0',
    endpoints: {
      todos: '/api/todos',
      health: '/health'
    }
  });
});

// endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await mongoose.connection.db.collection('todos').createIndex({
      task: 'text',
      description: 'text'
    }, { name: 'search_index' });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Please check your MongoDB Atlas connection string and IP whitelist');
    process.exit(1);
  }
};

app.use('/api/todos', todoRoutes);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid data', errors: err.errors });
  }
  
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: https://to-do-list-app-fjhc.onrender.com`);
  });
});