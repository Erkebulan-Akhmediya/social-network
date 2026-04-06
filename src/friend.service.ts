import {buildWhereClause, pool} from "./db";

export enum FriendRequestStatus {
    waiting = 'waiting',
    rejected = 'rejected',
    accepted = 'accepted',
}

export async function createFriendRequest(from: number, to: number): Promise<void> {
    const query = `insert into friend_request ("from", "to")
                   values ($1, $2)`
    await pool.query(query, [from, to])
}

export type FriendRequestUsers = {
    from: number,
    to: number,
}

export async function setFriendRequestStatus(id: number, accepted: boolean): Promise<FriendRequestUsers> {
    const query = `update friend_request
                   set status = $2
                   where id = $1
                   returning "from", "to"`
    const status: string = accepted ? FriendRequestStatus.accepted : FriendRequestStatus.rejected
    const {rows} = await pool.query(query, [id, status])
    return rows[0]
}

export type FriendRequestExistsOptions = {
    id?: number
    from?: number
    to?: number
    status?: FriendRequestStatus
}

export async function friendRequestExists(options?: FriendRequestExistsOptions): Promise<boolean> {
    let innerQuery = 'select id from friend_request'
    const { whereClause, args } = buildWhereClause(options)
    innerQuery += whereClause
    const outerQuery = `select exists(${innerQuery})`
    const {rows: [{exists}]} = await pool.query(outerQuery, args)
    return exists
}

export type WaitingFriendRequest = {
    id: number
    from: string
    createdAt: Date
}

export async function getWaitingFriendRequests(to: number): Promise<WaitingFriendRequest[]> {
    const query = `select fr.id,
                          fr.created_at,
                          jsonb_build_object(
                                  'id', u.id,
                                  'username', u.username
                          ) as "from"
                   from friend_request fr
                            left join "user" u on fr."from" = u.id
                   where "to" = $1
                     and status = 'waiting'`
    const {rows} = await pool.query(query, [to])
    return rows.map(((row): WaitingFriendRequest => ({
        id: row.id,
        from: row.from,
        createdAt: new Date(row.created_at)
    })))
}

export async function addFriend(user1id: number, user2id: number): Promise<void> {
    const query = `insert into friends (user1, user2)
                   values ($1, $2)`
    await pool.query(query, [user1id, user2id])
}

export async function friendExists(user1id: number, user2id: number): Promise<boolean> {
    const query = `select exists(select * from friends where user1 = $1 and user2 = $2)`
    const {rows: [{exists}]} = await pool.query(query, [user1id, user2id])
    return exists
}

export type Friend = {
    id: number
    username: string
}

export async function getFriends(userId: number): Promise<Friend[]> {
    const query = `select case
                              when f.user1 = $1 then u2.id
                              else u1.id
                              end as id,
                          case
                              when f.user1 = $1 then u2.username
                              else u1.username
                              end as username
                   from friends f
                            left join "user" u1 on f.user1 = u1.id
                            left join "user" u2 on f.user2 = u2.id
                   where user1 = $1
                      or user2 = $1`
    const {rows} = await pool.query(query, [userId])
    return rows
}