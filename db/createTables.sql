DROP TABLE IF EXISTS users CASCADE;
DROP SEQUENCE IF EXISTS users_SEQ CASCADE;

CREATE SEQUENCE users_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE users
(
    id        int          not null DEFAULT nextval('users_SEQ'),
    role  int              not null DEFAULT 1,
    username   VARCHAR(64)  not null,
    mail      VARCHAR(64)  not null,
    password  VARCHAR(256) not null,

    CONSTRAINT users_pk PRIMARY KEY (id)
);