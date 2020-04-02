-- Create app db tables

USE GOODLYALBUMS;

CREATE TABLE visitors (
  visitor_id   INT         NOT NULL  AUTO_INCREMENT
, ip_addr      VARCHAR(40) NOT NULL
, visits_count INT         NOT NULL
, PRIMARY KEY (visitor_id)
);


CREATE TABLE users (
  user_id       INT         NOT NULL  AUTO_INCREMENT
, user_name     VARCHAR(20) NOT NULL
, password_hash VARCHAR(44) NOT NULL
, password_salt VARCHAR(24) NOT NULL
, PRIMARY KEY (user_id)
);
ALTER TABLE users AUTO_INCREMENT = 1000;


CREATE TABLE roles (
  role_id   INT         NOT NULL  AUTO_INCREMENT
, role_name VARCHAR(20) NOT NULL
, PRIMARY KEY (role_id)
);
ALTER TABLE roles AUTO_INCREMENT = 1000;


-- Link table allowing users to have multiple roles
CREATE TABLE user_roles (
  user_id  INT  NOT NULL
, role_id  INT  NOT NULL
, FOREIGN KEY (user_id) REFERENCES users(user_id)
, FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
CREATE UNIQUE INDEX user_roles_index ON user_roles(user_id, role_id);
