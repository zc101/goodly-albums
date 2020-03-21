# Create app db tables

USE GOODLYALBUMS;

CREATE TABLE visitors (
  visitor_id   INT         NOT NULL  AUTO_INCREMENT
, ip_addr      VARCHAR(40) NOT NULL
, visits_count INT         NOT NULL
, CONSTRAINT visitors_pk PRIMARY KEY ( visitor_id )
);

CREATE TABLE users (
  user_id       INT         NOT NULL  AUTO_INCREMENT
, user_name     VARCHAR(20) NOT NULL
, password_hash VARCHAR(64) NOT NULL
, password_salt VARCHAR(32) NOT NULL
, CONSTRAINT users_pk PRIMARY KEY ( user_id )
);

ALTER TABLE users AUTO_INCREMENT = 1000;
