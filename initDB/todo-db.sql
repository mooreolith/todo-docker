-- File: todo-db.sql
-- Purpose: A Todo App Database
-- By: mooreolith@gmail.com
-- Date: 2024-01-29

CREATE OR REPLACE DATABASE todo_db;
CREATE OR REPLACE USER 'todo_user'@'%' IDENTIFIED BY 'todo_pass';
GRANT ALL ON todo_db.* TO 'todo_user'@'%';
FLUSH PRIVILEGES;
USE todo_db;

CREATE OR REPLACE TABLE todo (
  id uuid PRIMARY KEY DEFAULT uuid(),
  item VARCHAR(256),
  done BOOLEAN DEFAULT false
);

DELIMITER //
CREATE OR REPLACE PROCEDURE todo_add (
	IN newItem VARCHAR(256)
)
BEGIN
	INSERT INTO todo (id, item, done)
	VALUES (uuid(), newItem, false);
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE todo_update (
  IN inId UUID,
  IN inItem VARCHAR(256),
  IN inDone BOOLEAN
)
BEGIN
  UPDATE todo
  SET 
    item = inItem,
    done = inDone
  WHERE id = inId;
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE todo_remove (
	IN todoId UUID
)
BEGIN
	DELETE FROM todo
	WHERE id = todoId;
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE todo_list ()
BEGIN
  SELECT id, item, done
  FROM todo;
END //
DELIMITER ;