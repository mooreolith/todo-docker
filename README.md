# Containerizing todo-app

In this exercise, we create a docker version of the todo-app, which will include the database, and the server (which includes the frontend). After that, we’ll write a docker-compose script. Once we have a docker compose script, you’ll see the value of Docker. 


## Docker

You can follow along by taking the todo-app folder I sent you and copying it to a folder called todo-app-docker and following along. Or you can look at the finished project I’ll send you over. 

First, we delete the node_modules file. We’ll specify in the script that installation will require running npm install, which will pull the specified versions from the interwebs. 

I’m following these steps: https://www.docker.com/101-tutorial/, and https://docs.docker.com/get-started/02_our_app/. 

I copied and pasted the docker file contens from the tutorial, and adjust them to our needs.

```docker
# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "todo-server.js"]
EXPOSE 3000
```

This file goes in a file simply named “Dockerfile”. From that directory, we run docker “build -t todo-app .”, and finally execute “docker run -p ” from the Powershell (if you’re on Windows). 

docker run -p 127.0.0.1:3000:3000 todo-app

We deliberately left out the -d flag, and wrote -p insteand -dp. This is because detaching puts the process in the background, where it is more difficult to kill. This way, it will require the console window to remain open. 

-p stands for publish, which means that you expose a port from inside of the container to an address outside of the container. The outside (127.0.0.1:3000) comes first, followed by a colon, followed by what’s exposed on the inside (also 3000, because that’s the port our todo-app runs on). 

Together the Dockerfile and the commands say: Pull a minimal copy of linux with nodejs on it, (which themselves could be several images), install our todo-app on it, run it so it answers on port 3000, then expose the port 3000 from inside of the container to host 127.0.0.1 port 3000 on the local network (outside the container).


## docker-compose

Definitely check out the documentation on docker-compose v3 (comes with Docker Desktop on Windows) https://docs.docker.com/get-started/08_using_compose/.

Took me a litte bit, but now I’ve got it. I’ll paste the finished docker file here, and discuss it in detail. 

```yaml
version: '3'
volumes:
  data:
networks:
  db:
services: 
  mariadb:
    image: mariadb
    container_name: mariadb
    restart: always
    volumes:
      - ./initDB:/docker-entrypoint-initdb.d
      - data:/var/lib/mysql:rw
    ports:
      - "3306:3306"
    networks:
      - db
    environment:
      - MYSQL_HOST=mariadb
      - MYSQL_ROOT_USER=root
      - MYSQL_ALLOW_EMPTY_ROOT_PASSWORD=1
      - MYSQL_ROOT_PASSWORD=''
      - MYSQL_USER=todo_user
      - MYSQL_PASSWORD=todo_pass
      - MYSQL_DATABASE=todo_db
  app:
    image: node:20-alpine
    container_name: todo-app
    restart: always
    command: sh -c "npm install && cd /app && node todo-server.js"
    ports: 
      - 127.0.0.1:3000:3000
    working_dir: /app
    links:
      - mariadb
    volumes:
      - ./:/app
      - /app/node_modules
    networks:
      - db
    depends_on:
      - mariadb
```

Now this is a handful.  These contents go into docker-compose.yml, in our todo-app-docker directory. Familliarize yourself with yaml if you haven’t already, it’s basically json-lite. We define two services: mariadb, which will run our database, and app, which will run the nodejs app. 
Here are the various fields: 

image: Pulls from a public repository of images, in our case: mariadb and node:20-alpine, which is the minimal alpine linux (often used in docker distributions, cause it comes with nothing else), and node installed.

container_name: This is what the container is called, as if it was its own computer on the network. You can substitute the name you specify here for the host in the connection field of other programs. 

restart: Determines the behavior of the service specified. Do you want it to restart if it shuts down, or only if it encounters an error, or always? I ran into some connection timeout issues with the connection pool, so I set both to restart: always, which should fix that problem, even if it’s a little hacky.

volumes: An array of mappings from outside folders to inside folders. Remember, the inside (of the container) is what’s in the todo-app-docker folder. The outside is the docker-environment, which you don’t have to worry about, you just give it a file or folder path for sharing data between programs, if you need to do that through file systems instead of http apis. 

ports: A mapping from outside port to inside port. We want mariadb to expose port 3306 on the network “db” where app can listen to it on host mariadb, port 3306. 

networks: A list of networks. You can have multiple networks to have your programs talking to each other in ways that you intend, possibly separate from each other, and for different purposes. Note the networks field at the top. It defines the “db” network that’s used in the services “mariadb” and “app”. 

environment: Docker packages are often controlled via environment variables. Be sure not to commit your passwords to version control, if you’re using it, using the .gitignore file. 

depends_on: With this, you can instruct docker to start and wait for containers in a certain order. For example if starting the app without the database running would create an error.

command: We basically downloaded a nodejs container, and now we give it a command: npm install && cd /app && node todo-server.js

A note on the volumes section in the mariadb service: the initDB line maps the outside directory initDB to the inside directory /docker-entrypoint-initdb.d, which this docker container then uses to find scripts that initialize the database on first run. If you run “docker-compose down”, (or hit CTRL-C) it will shut down the containers. If you run “docker-compose down -v”, it also gets rid of the volumes we created, meaning upon next start of these containers, all the data volumes have to be recreated. Like a reset.

So with Docker Desktop installed: Powershell > 
    1. cd todo-app-docker
    2. docker-compose up
and to close it
    • docker-compose down, to simply shut down
    • docker-compose down -v, to shut down and delete the volumes (for example the one holding the mariadb database data, at /var/lib/mysql.

That’s it. Docker-compose is a software forklift. 
