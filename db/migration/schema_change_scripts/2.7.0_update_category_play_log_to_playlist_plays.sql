/*
 * Script:      : 2.7.0_update_category_play_log_to_playlist_plays.sql
 * Description  : Renames category_play_log table to playlist_plays, and updates columns of table as well
 */

RENAME TABLE `category_play_log` TO `playlist_plays`;

ALTER TABLE `playlist_plays`
    RENAME COLUMN `log_id` to `id`,
	RENAME COLUMN `category_id` TO `playlist_id`,
    RENAME COLUMN `dt_played` TO `played_at`,
    RENAME COLUMN `player_id` TO `user_id`;

ALTER TABLE `playlist_plays`
    DROP FOREIGN KEY `fk_catlog_player_id`,
    DROP KEY `fk_catlog_player_id_idx`,
    MODIFY COLUMN `played_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN `user_id` INT NULL, 
    ADD CONSTRAINT `fk_playlist_plays_playlists_id` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_playlist_plays_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
    ADD KEY `index_playlist_plays_playlist_id` (`playlist_id`),
    ADD KEY `index_playlist_plays_user_id` (`user_id`);
    
-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.7.0');
INSERT INTO change_log (script_name) VALUES ('2.7.0_update_category_play_log_to_playlist_plays.sql');