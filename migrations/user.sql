create table "user"
(
    id         serial primary key,
    username   varchar(255) not null unique,
    password   varchar(255) not null,
    created_at date         not null default now()
);

-- drop table "user";