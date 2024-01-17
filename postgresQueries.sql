-- Users table to store the user's name, email and password
create table users (
	id serial primary key,
	name varchar(100) not null ,
	email varchar(100) not null unique,
	password varchar(100) not null
);

-- week, month, year table to store the users task, having one to many relation with user.id for the referance of the user
CREATE TABLE week (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
  	state INTEGER DEFAULT 1,
  	date VARCHAR(22),
	user_id INTEGER REFERENCES users(id)
);
	
CREATE TABLE month (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
  	state INTEGER DEFAULT 1,
  	date VARCHAR(22),
	user_id INTEGER REFERENCES users(id)
);

CREATE TABLE year (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
 	state INTEGER DEFAULT 1,
  	date VARCHAR(22),
	user_id INTEGER REFERENCES users(id)
);
-- To drop the tables
DROP TABLE users;
DROP TABLE week;
DROP TABLE month;
DROP TABLE year;

