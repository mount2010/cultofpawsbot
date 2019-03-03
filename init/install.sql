-- CAREFUL RUNNING THIS FILE!! It should only be ran on installation.
-- Todo: Add check for first run.
-- Usage: mysql -u user -p < install.sql

USE copbot;

CREATE TABLE requests (
	id SMALLINT NOT NULL AUTO_INCREMENT,
	item TINYTEXT NOT NULL,
	description TEXT,
	userid TINYTEXT NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE disableditems (
	name TINYTEXT NOT NULL
);
