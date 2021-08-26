const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ erro: "User not found." });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "This user already exists!" });
  }

  users.push({
    id: uuid(),
    name,
    username,
    todos: [],
  });

  return response
    .status(201)
    .json(users.find((user) => user.username === username));
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todoCreation = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoCreation);

  return response
    .status(201)
    .json(user.todos.find((todo) => todo.id === todoCreation.id));
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;
