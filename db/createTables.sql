DROP TABLE IF EXISTS users CASCADE;
DROP SEQUENCE IF EXISTS users_SEQ CASCADE;

DROP TABLE IF EXISTS playlists CASCADE;
DROP SEQUENCE IF EXISTS playlists_SEQ CASCADE;

DROP TABLE IF EXISTS songs CASCADE;
DROP SEQUENCE IF EXISTS songs_SEQ CASCADE;

DROP TABLE IF EXISTS subscriptions CASCADE;
DROP SEQUENCE IF EXISTS subscriptions_SEQ CASCADE;

DROP TABLE IF EXISTS scores CASCADE;
DROP SEQUENCE IF EXISTS scores_SEQ CASCADE;

CREATE SEQUENCE users_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE users
(
    id       int          not null DEFAULT nextval('users_SEQ'),
    role     int          not null DEFAULT 1,
    username VARCHAR(64)  not null,
    mail     VARCHAR(64)  not null,
    password VARCHAR(256) not null,

    CONSTRAINT users_pk PRIMARY KEY (id)
);

CREATE SEQUENCE playlists_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE playlists
(
    id   int         not null DEFAULT nextval('playlists_SEQ'),
    name VARCHAR(64) not null,
    creator_id int not null references users(id) on delete cascade,

    CONSTRAINT playlists_pk PRIMARY KEY (id)
);

CREATE SEQUENCE songs_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE songs
(
    id          int          not null DEFAULT nextval('songs_SEQ'),
    playlist_id int          not null references playlists (id) on delete cascade,
    url         VARCHAR(128) not null,
    token1      VARCHAR(128) not null,
    token2      VARCHAR(128) not null,

    CONSTRAINT songs_pk PRIMARY KEY (id)
);


CREATE SEQUENCE subscriptions_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE subscriptions
(
  id int not null DEFAULT nextval('subscriptions_SEQ'),
  playlist_id int not null references playlists(id) on delete cascade,
  user_id int not null references users(id) on delete cascade
);

CREATE SEQUENCE scores_SEQ INCREMENT BY 1 MINVALUE 0;
CREATE TABLE scores
(
    id int not null DEFAULT nextval('subscriptions_SEQ'),
    playlist_id int not null references playlists(id) on delete cascade,
    user_id int not null references users(id) on delete cascade,
    score int not null
);

