const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userNameAlreadyExisits = users.some(
    (user) => user.username === username
  );

  if (userNameAlreadyExisits) {
    return response.status(400).json({ error: "User already exists" });
  } else {
    const user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };
    users.push(user);
    return response.status(201).json(user);
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users.forEach((userm) => {
    if (userm.username === user.username) {
      userm.todos.push(todo);
    }
  });

  // user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  } else {
    users.forEach((userIt) => {
      if (userIt.username === user.username) {
        userIt.todos.forEach((todo) => {
          if (todo.id === id) {
            todo.title = title;
            todo.deadline = new Date(deadline);
          }
        });
      }
    });
    const changedTodo = user.todos.filter((todo) => todo.id === id);
    return response.status(201).json(changedTodo[0]);
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  } else {
    users.forEach((userIt) => {
      if (userIt.username === user.username) {
        userIt.todos.forEach((todo) => {
          if (todo.id === id) {
            todo.done = true;
          }
        });
      }
    });
    const changedTodo = user.todos.filter((todo) => todo.id === id);
    return response.status(201).json(changedTodo[0]);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;
  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  } else {
    const todoIndex = users.map((userIt) => {
      if (userIt.username === user.username) {
        return userIt.todos
          .map((todo) => {
            return todo.id;
          })
          .indexOf(id);
      }
    });
    users.forEach((userIt) => {
      if (userIt.username === user.username) {
        userIt.todos.splice(todoIndex, 1);
      }
    });

    return response.status(204).json(users);
  }
});

module.exports = app;
