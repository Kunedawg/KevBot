/*
 * Script:      : 2.5.0_update_audio_category_to_playlist_tracks.sql
 * Description  : Renames audio table to tracks, and updates columns of table as well
 */

RENAME TABLE `audio_category` TO `playlist_tracks`;

ALTER TABLE `playlist_tracks`
	RENAME COLUMN `audio_id` TO `track_id`,
	RENAME COLUMN `category_id` TO `playlist_id`,
    RENAME COLUMN `dt_created` TO `created_at`,
    RENAME COLUMN `player_id` TO `user_id`;

ALTER TABLE `playlist_tracks`
    DROP FOREIGN KEY `fk_audiocat_player_id`,
    DROP FOREIGN KEY `fk_audiocat_audio_id`,
    DROP FOREIGN KEY `fk_audiocat_cat_id`,
    DROP KEY `fk_audiocat_player_id_idx`,
    DROP KEY `fk_audiocat_audio_id_idx`,
    DROP KEY `fk_audiocat_cat_id_idx`,
    MODIFY COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD CONSTRAINT `fk_playlist_tracks_tracks_id` FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_playlist_tracks_playlists_id` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON UPDATE CASCADE,
    ADD KEY `index_playlist_tracks_track_id` (`track_id`),
    ADD KEY `index_playlist_tracks_playlist_id` (`playlist_id`);
    
ALTER TABLE `playlist_tracks`
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`track_id`, `playlist_id`),
    DROP COLUMN `audio_categoy_id`;

-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.5.0');
INSERT INTO change_log (script_name) VALUES ('2.5.0_update_audio_category_to_playlist_tracks.sql');