create table users (
	id serial primary key,
	name varchar(100) not null ,
	email varchar(100) not null unique,
	password varchar(100) not null
);
---------------------------
insert into users (name, email, password) values ('abc', 'weg', '324');
---------------------------
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

--------------------------------
DROP TABLE week;
DROP TABLE month;
DROP TABLE year;
DROP TABLE users;
--------------------------------