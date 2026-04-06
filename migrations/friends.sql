create table friends
(
    user1      integer            not null
        constraint friends_user_id_fk
            references "user",
    user2      integer            not null
        constraint friends_user_id_fk_2
            references "user",
    created_at date default now() not null,
    constraint friends_pk
        primary key (user1, user2)
);

-- drop table friends;