/*
  File: todo-server.js
  Purpose: A Todo App Server that connects to todo-db and serves the files in ./static/
  By: mooreolith@gmail.com
  Date: 2024-01-29
*/

/* 
  "require" is node for import.
  
  We'll import the express library for handling HTTP requests,
  and the mariadb package for handling the database.
*/
const express = require('express');
const mariadb = require('mariadb');


/*
  express() creates an express application.
*/
const app = express();
const port = 3000;

/* 
  With app.get('/', we define a route so that someone 
  accessing http://localhost:3000/hello will receive the 
  response defined in the following function, which receives
  the HTTP Request and the HTTP Response object as 
  parameters.
*/
app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

/*
  app.use adds so called middleware, functions that get run on
  certain requests, like the one above. Here, instead of adding a 
  function ourselves, we let express.static handle that part for us.
  It returns files as they are, from (here) the static folder. 

  We can define arbitrarily many routes. In this one, we'll
  return some static html on the standard address http://localhost:3000/ 
  
  This is how we serve up index.html, index.css, and index.js, since 
  they're content is not dynamic, but the same every time.
*/
app.use('/', express.static('static'));



/*
  This makes it so we can access the body paramters in the req.params dictionary.
*/
app.use(express.json());

/*
  This example is taken from https://mariadb.com/kb/en/getting-started-with-the-nodejs-connector/
  Note the require('mariadb') at the top. 
*/
const pool = mariadb.createPool({
  host: 'mariadb',
  user: 'todo_user',
  password: 'todo_pass',
  database: 'todo_db',
  idleTimeout: 0,
  connectionLimit: 100
});


/* 
  This function will be called if the connection to the mariadb server encounters
  an error.
*/
function handleError(err, res, conn){
  res.json({result: false, error: err});
  if(conn) conn.release();
  throw err;
}


/*
  Now we are going to define a few routes we can body from our
  front end html. 
*/

/*
  This route adds a todo.
  Oh yeah, get and post here are HTTP verbs. When you make a GET
  request from HTML/JS it needs to match a app.get route here.
  If you make POST request, it needs to match a app.post route here.
*/
app.post('/add', async (req, res) => {
  const todoItem = req.body.item;
  
  let conn;
  
  pool
  .getConnection()
  .then(conn => {
    conn
    .query('call todo_add(?)', [todoItem])
    .then(rows => res.json({result: true}))
    .catch(err => handleError(err, res, conn));
    conn.end();
  })
  .catch(err => handleError(err, res, conn));
});


/*
  This route lists all todos
*/
app.get('/list', async (req, res) => {
  let conn;
  
  pool
  .getConnection()
  .then(conn => {
    conn
    .query('call todo_list();')
    .then(rows => res.json({result: rows[0]}))
    .catch(err => handleError(err, res, conn));
    conn.end();
  })
  .catch(err => handleError(err, res, conn));
});

/*
  This route deletes a todo
*/
app.post('/remove', async (req, res) => {
  const id = req.body.id;
  
  let conn;
  
  pool
  .getConnection()
  .then(conn => {
    conn
    .query('call todo_remove(?);', [id])
    .then(rows => res.json({result: true}))
    .catch(err => handleError(err, res, conn));
    conn.end();
  })
  .catch(err => handleError(err, res, conn));
});


/*
  And this route deletes a todo
  I usually just use get and post, but there's other words, and more
  semantics to all four of the http verbs. 
*/
app.post('/update', async (req, res) => {
  const id = req.body.id;
  const item = req.body.item;
  const done = req.body.done;
  
  let conn;
  
  pool
  .getConnection()
  .then(conn => {
    conn
    .query('call todo_update(?, ?, ?);', [id, item, done])
    .then(rows => res.json({result: true}))
    .catch(err => handleError(err, res, conn));
    conn.end();
  })
  .catch(err => handleError(err, res, conn));
});


/*
  Now that we've defined all the routes we want the app to
  respond to, we call listen, and give it the port to listen 
  on. 
*/
app.listen(port, () => {
  console.log(`Todo App listening on http://localhost:${port}/`);
});