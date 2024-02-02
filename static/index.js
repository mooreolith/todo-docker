/*
  File: static/index.js
  Purpose: Front-end Logic for Todo App, referenced by static/index.html
  By: mooreolith@gmail.com
  Date: 2024-01-29
*/

const addButton = document.querySelector('#add-button');
addButton.addEventListener('click', onAddButtonClick);
refreshTodos();

function onAddButtonClick(){
  const todo = prompt("Enter your todo item:");
  const body = {item: todo}
  
  // fetch is the XMLHttpRequest, if you remember those
  fetch('http://localhost:3000/add', {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(refreshTodos)
}

function refreshTodos(){ 
  fetch('http://localhost:3000/list', {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
  .then(async res => {
    const json = await res.json(); // if you use await, you gotta make your function asyn
    if(!json.result){
      const error = document.querySelector('#error');
      error.value = JSON.stringify(json.error);
    }else{
      clearTodos();
      
      const todos = json.result;
      todos.forEach(render);
    }
  })
  .catch(err => {
    console.error(err);
  });
}

function clearTodos(){
  const todos = document.querySelector('#todos');
  todos.innerHTML = ''; // basically emptying out the #todos element
}

/*
  This is a longer function, but all it does is translate the json object
  we got from the server into html that we can look at. 
*/
function render(todo){
  const todos = document.querySelector('#todos');
  const li = document.createElement('li')
  
  /*
    First, we're going to add some hidden input fields, which can hold data
    to be needed in other functions.
  */
  const idField = document.createElement('input');
  idField.classList.add("id-field");
  idField.value = todo.id;
  idField.type = "hidden";
  li.appendChild(idField);
  
  const itemField = document.createElement('input');
  itemField.classList.add("item-field");
  itemField.value = todo.item;
  itemField.type = "hidden";
  li.appendChild(itemField);
  
  const doneField = document.createElement('input');
  doneField.classList.add('done-field');
  doneField.value = todo.done;
  doneField.type = "hidden";
  li.appendChild(doneField);
  
  /*
    Here, a happy little indicator:
  */
  const indicator = document.createElement('output');
  indicator.classList.add('indicator');
  indicator.value = todo.done ? '✓' : '✗';
  li.appendChild(indicator);
  
  /*
    Next up, we display the text
  */
  
  const itemOutput = document.createElement('output');
  itemOutput.classList.add('todo');
  itemOutput.value = `${todo.item}`;
  if(todo.done) itemOutput.classList.add('done');
  li.appendChild(itemOutput);
  
  /*
    Now, some buttons to toggle the todo items.
  */
  
  const doneBtn = document.createElement('button');
  doneBtn.innerHTML = "Done";
  doneBtn.addEventListener('click', onDoneBtnClick);
  li.appendChild(doneBtn);
  
  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = "Delete";
  // here we assign the onRemoveBtnClick function as the elemnt's eventHandler 
  removeBtn.addEventListener('click', onRemoveBtnClick);
  li.appendChild(removeBtn);
  
  // this might seem verbose, but keep in mind that most time is spent thinking,
  // not typing. We could have used a templating library for this, as well. but
  // this was faster. It's easy, one's just gotta type it out.
  
  todos.appendChild(li);
}

function onDoneBtnClick(event){
  const doneBtn = event.target;
  const li = doneBtn.parentElement;
  
  const id = li.querySelector('.id-field').value;
  const item = li.querySelector('.item-field').value;
  let done = parseInt(li.querySelector('.done-field').value);
  
  done = !done;
  
  const body = {id, item, done};
  
  fetch('http://localhost:3000/update', {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(refreshTodos);
}

function onRemoveBtnClick(event){
  const removeBtn = event.target;
  const li = removeBtn.parentElement;
  const itemId = li.querySelector('.id-field').value;
  
  fetch('http://localhost:3000/remove', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: itemId})
  }).then(refreshTodos)
}
