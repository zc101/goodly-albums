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
, password_hash CHAR(44)    NOT NULL
, password_salt CHAR(24)    NOT NULL
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


CREATE TABLE albums (
  album_id      INT          NOT NULL  AUTO_INCREMENT
, owner_id      INT          NOT NULL
, album_name    VARCHAR(30)  NOT NULL
, album_desc    VARCHAR(255)
, album_cover   CHAR(36)
, album_private BOOLEAN      NOT NULL
, PRIMARY KEY (album_id)
, FOREIGN KEY (owner_id) REFERENCES users(user_id)
);
CREATE UNIQUE INDEX albums_index ON albums(album_id, owner_id);


-- Link table matching media (photos, etc) to albums
CREATE TABLE media (
  album_id      INT          NOT NULL
, media_file    CHAR(36)     NOT NULL  -- 16-byte hash + 4-char file extension
, media_caption VARCHAR(255)
, FOREIGN KEY (album_id) REFERENCES albums(album_id)
);
CREATE UNIQUE INDEX media_index ON media(album_id, media_file);
