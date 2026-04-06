create type friend_request_status as enum ('waiting', 'rejected', 'accepted');

create table friend_request
(
    id serial primary key,
    "from" integer not null
        constraint friend_request_user_id_fk
            references "user",
    "to"   integer not null
        constraint friend_request_user_id_fk_2
            references "user",
    status friend_request_status not null default 'waiting',
    created_at timestamp not null default now()
);

-- drop table friend_request;