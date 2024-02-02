# Todo App Overview

This is a short tutorial on how to pull off a small webapp. I’ll keep this very very short, but it can serve as a reference for more complicated projects. Let’s dive in.

This is how I would build a todo app. I typically design applications from the database outwards: Tables, Stored Procedures (MariaDB’s SQL), Server (NodeJS and ExpressJS), Front-end (Plain HTML5 for now). As for functionality, it will feature a list of todos, mark completed todos with a checkmark and crossed out text. There will be two buttons per todo item: Done and Delete. Done toggles whether the todo is marked completed or not, Delete removes it completely. And of course, there’s an Add button for adding more todos. I didn’t want to deal with styling inputs to make them look fancy, so I used prompt, which is a mortal sin.

You’ll need to install MariaDB for this exercise. When you do, you can create a username and password for your application to use in the connection with the database. I looked through a bunch of Visual SQL Database Clients, and found one that was free and I liked: DBeaver Community. It’s got all we need for the database work here.

Open the file todo-db.sql. This SQL script contains a table (todo) and two stored procedures (todo_add, todo_update, and todo_remove). The todo table is simple, it contains an id (specifically a UUID) and a text field for the todo item. The stored procedures create, modify and delete todos, respectively. If you open DBeaver, connect to the database instance, open this file, todo-db.sql, right click the text (without selecting anything), and select Execute > Execute SQL Script, mysql will install the database described in the file. After the script runs and without errors, hit refresh on the database object explorer to the right. The table and the three stored procedures should show up now.

It’s good practice to store database changes in migration files that you can run and rerun and make changes in responsible fashion through, instead of willinilly editing data or tables in a SQL GUI. Anyway.

Next up, is todo-server.js. For that, we’ll use some command line foo. Be sure to have NodeJS and NPM installed. Then create and navigate to a folder of your choice, and run npm init (there’s prompts, so be sure to answer them, naming the “entry point” todo-server.js, instead of index.js). Then we’ll install expressjs. This setup for any generic nodejs project is described at https://expressjs.com/en/starter/installing.html. Now that we have a project, we can run npm install express. This adds express as a dependency in package.json, installs it in the node_modules folder, and writes the specific version installed into the package-lock.json file.

The server will consist of a small express app defining four routes: /add, /list, /remove, and /update, which will make calls to the database, using the four stored procedures we defined earlier: todo_add, todo_list, todo_update, and todo_remove. Of course, the server also houses the html, here I put the html, javascript (client side) and css files into a folder called static. In addition to the aforementioned four routes, we use an app.use(‘/serverpath’, express.static(‘file system path’)) function, which just returns the files in the “file system path” (relative to the folder from which todo-server.js is run). By the way, you can start the server using node todo-server.js. You might have to give it permission to the network, so it can listen on port 3000.

• Run the todo-db.sql against your MariaDB instance. (Depending on what your do here, you might have to adjust the host, user, and password in todo-server.js).

• npm install 
  (This one is going to create the node_modules folder into which the nodejs packages express and mariadb and their dependencies are installed)

• node todo-server.js
  (Make sure your database is running)

• Open a browser and visit http://localhost:3000/

• Once you’re familiar with how the app works, take a look at the files in this order:
    1. todo-db.sql
    2. todo-server.js
    3. static/index.html
    4. static/index.js
    5. static/index.css

Et voila, here’s a pretty minimal todo app. In production, you could include a bash script installing and starting all the components, and have nginx or Apache act as a reverse proxy that points to http://localhost:3000, at which point you could go ahead and put it all in docker and docker-compose files.

I didn’t get into detail with the Frontend. The idea here is to set up the html, and add event listeners to the buttons, which in turn make the server calls (via fetch) which in turn make the database calls, and return the db values back to the front end. The way the frontend works now, it has a raw layout, and a render function, that takes an individual todo and adds a built up
to the

    in the .html file. Every action triggers a refresh, this could be more efficient, but the point here is that the database is the single source of truth, the server merely relays between the database and the frontend, and the frontend does no more heavy lifting than necessary for fetching and presenting data.

    This took me about two days to look up and write. It had been a while.
