create table users
(
    id           serial,
    uuid         uuid
        constraint users_pk
            primary key,
    email        varchar not null,
    password     varchar not null,
    salt         varchar not null,
    created      timestamptz default NOW(),
    last_updated timestamptz default NOW()
);

