# Create app db tables

USE GOODLYALBUMS;

CREATE TABLE visitors (
  visitor_id   INT         NOT NULL  AUTO_INCREMENT
, ip_addr      VARCHAR(40) NOT NULL
, visits_count INT         NOT NULL
  PRIMARY KEY ( visitor_id )
);
