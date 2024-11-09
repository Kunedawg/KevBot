import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  change_log: ChangeLogTable;
  db_version: DbVersionTable;
  playlist_plays: PlaylistPlaysTable;
  playlists: PlaylistsTable;
  playlist_tracks: PlaylistTracksTable;
  track_play_counts: TrackPlayCountsTable;
  track_plays: TrackPlaysTable;
  track_play_type_counts: TrackPlayTypeCountsTable;
  tracks: TracksTable;
  user_farewells: UserFarewellsTable;
  user_greetings: UserGreetingsTable;
  users: UsersTable;
}

export interface ChangeLogTable {
  id: Generated<number>;
  script_name: string;
  applied_at: Generated<Date>;
}
export type ChangeLog = Selectable<ChangeLogTable>;
export type NewChangeLog = Insertable<ChangeLogTable>;
export type ChangeLogUpdate = Updateable<ChangeLogTable>;

export interface DbVersionTable {
  id: Generated<number>;
  version: string;
  applied_at: Generated<Date>;
}
export type DbVersion = Selectable<DbVersionTable>;
export type NewDbVersion = Insertable<DbVersionTable>;
export type DbVersionUpdate = Updateable<DbVersionTable>;

export interface PlaylistPlaysTable {
  id: Generated<number>;
  playlist_id: number;
  played_at: Generated<Date>;
  user_id: number | null;
}
export type PlaylistPlay = Selectable<PlaylistPlaysTable>;
export type NewPlaylistPlay = Insertable<PlaylistPlaysTable>;
export type PlaylistPlayUpdate = Updateable<PlaylistPlaysTable>;

export interface PlaylistsTable {
  id: Generated<number>;
  name: string;
  created_at: Generated<Date>;
  user_id: number;
  updated_at: Generated<Date>;
  deleted_at: ColumnType<Date | null, never, Date | null>;
}
export type Playlist = Selectable<PlaylistsTable>;
export type NewPlaylist = Insertable<PlaylistsTable>;
export type PlaylistUpdate = Updateable<PlaylistsTable>;

export interface PlaylistTracksTable {
  track_id: number;
  playlist_id: number;
  created_at: Generated<Date>;
  user_id: number;
}
export type PlaylistTrack = Selectable<PlaylistTracksTable>;
export type NewPlaylistTrack = Insertable<PlaylistTracksTable>;
export type PlaylistTrackUpdate = Updateable<PlaylistTracksTable>;

export interface TrackPlayCountsTable {
  track_id: Generated<number>;
  raw_total_play_count: ColumnType<number, number | undefined, number>;
  total_play_count: ColumnType<number, number | undefined, number>;
  updated_at: Generated<Date>;
}
export type TrackPlayCount = Selectable<TrackPlayCountsTable>;
export type NewTrackPlayCount = Insertable<TrackPlayCountsTable>;
export type TrackPlayCountUpdate = Updateable<TrackPlayCountsTable>;

export interface TrackPlaysTable {
  id: Generated<number>;
  track_id: number;
  played_at: Generated<Date>;
  user_id: number | null;
  play_type: number;
}
export type TrackPlay = Selectable<TrackPlaysTable>;
export type NewTrackPlay = Insertable<TrackPlaysTable>;
export type TrackPlayUpdate = Updateable<TrackPlaysTable>;

export interface TrackPlayTypeCountsTable {
  track_id: number;
  play_type: number;
  play_count: ColumnType<number, number | undefined, number>;
  updated_at: Generated<Date>;
}
export type TrackPlayTypeCount = Selectable<TrackPlayTypeCountsTable>;
export type NewTrackPlayTypeCount = Insertable<TrackPlayTypeCountsTable>;
export type TrackPlayTypeCountUpdate = Updateable<TrackPlayTypeCountsTable>;

export interface TracksTable {
  id: Generated<number>;
  name: string;
  created_at: Generated<Date>;
  user_id: number;
  duration: number;
  updated_at: Generated<Date>;
  deleted_at: ColumnType<Date | null, never, Date | null>;
}
export type Track = Selectable<TracksTable>;
export type NewTrack = Insertable<TracksTable>;
export type TrackUpdate = Updateable<TracksTable>;

export interface UserFarewellsTable {
  user_id: number;
  farewell_track_id: ColumnType<number | null, number | null, number | null>;
  farewell_playlist_id: ColumnType<number | null, number | null, number | null>;
  updated_at: Generated<Date>;
}
export type UserFarewell = Selectable<UserFarewellsTable>;
export type NewUserFarewell = Insertable<UserFarewellsTable>;
export type UserFarewellUpdate = Updateable<UserFarewellsTable>;

export interface UserGreetingsTable {
  user_id: number;
  greeting_track_id: ColumnType<number | null, number | null, number | null>;
  greeting_playlist_id: ColumnType<number | null, number | null, number | null>;
  updated_at: Generated<Date>;
}
export type UserGreeting = Selectable<UserGreetingsTable>;
export type NewUserGreeting = Insertable<UserGreetingsTable>;
export type UserGreetingUpdate = Updateable<UserGreetingsTable>;

export interface UsersTable {
  id: Generated<number>;
  discord_id: string | null;
  discord_username: string | null;
  username: string | null;
  password_hash: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
