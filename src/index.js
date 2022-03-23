const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "Usuário inexistente!" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const alredyExistsUser = users.find((user) => user.username === username);

  if (alredyExistsUser) {
    return response.status(400).json({ erro: "User alredy exists." });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json({ todos: user.todos });
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.json({ todo: user.todos.slice(-1) });
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoAlredyExists = user.todos.find((todo) => todo.id == id);

  if (!todoAlredyExists) {
    return response.status(404).json({ error: "Todo not exists." });
  }

  if (user.todos.length > 0) {
    for (todo of user.todos) {
      if (todo.id === id) {
        todo.title = title;
        todo.deadline = deadline;
      }
    }
  } else {
    return response.json({ error: "There is no todo to update." });
  }

  return response.status(201).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { done } = request.body;
  const { id } = request.params;

  const todoAlredyExists = user.todos.find((todo) => todo.id == id);

  if (!todoAlredyExists) {
    return response.status(404).json({ error: "Todo not exists." });
  }

  if (user.todos.length > 0) {
    for (todo of user.todos) {
      if (todo.id === id) {
        todo.done = done;
      }
    }
    return response.status(201).send();
  } else {
    return response.json({ erro: "There is no todo to update" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlredyExists = user.todos.find((todo) => todo.id == id);

  if (!todoAlredyExists) {
    return response.status(404).json({ error: "Todo not exists." });
  }

  if (user.todos.length > 0) {
    for (let i = 0; i <= user.todos.length - 1; i++) {
      if (user.todos[i].id === id) {
        user.todos.splice(i, 1);
      }
    }
  } else {
    return response.json({ error: "There is no todo to delete." });
  }

  return response.status(200).send();
});

module.exports = app;
