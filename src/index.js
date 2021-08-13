const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) response.status(400).json({ error: "User not found." })

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists) response.status(400).json({error: "User already exists"});

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) response.status(404).json({error: "Todo not found."});

  const todos = user.todos.map(todo => {
    if (todo.id === id) {
      return {
        id: todo.id,
        title,
        done: todo.done,
        deadline: new Date(deadline),
        created_at: todo.created_at
      }
    } else {
      return todo;
    }
  });

  user.todos = todos;

  return response.status(201).json({
    title,
    deadline,
    done: false
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) response.status(404).json({error: "Todo not found."});

  const todos = user.todos.map(todo => {
    if (todo.id === id) {
      return {
        id: todo.id,
        title: todo.title,
        done: true,
        deadline: todo.deadline,
        created_at: todo.created_at
      }
    } else {
      return todo;
    }
    
  });

  user.todos = todos;

  const todo = user.todos.find(todo => todo.id === id);

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) response.status(404).json({error: "Todo not found."});

  const todos = user.todos.filter(todo => todo.id !== id);

  user.todos = todos;

  return response.status(204).json(todos);
});

module.exports = app;