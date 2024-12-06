/*
 * Script:      : 2.6.0_update_audio_play_log_to_track_plays.sql
 * Description  : Renames audio_play_log table to track_plays, and updates columns of table as well
 */

RENAME TABLE `audio_play_log` TO `track_plays`;

ALTER TABLE `track_plays`
    RENAME COLUMN `log_id` to `id`,
	RENAME COLUMN `audio_id` TO `track_id`,
    RENAME COLUMN `dt_played` TO `played_at`,
    RENAME COLUMN `player_id` TO `user_id`;

ALTER TABLE `track_plays`
    DROP FOREIGN KEY `fk_audiolog_player_id`,
    DROP FOREIGN KEY `fk_audiolog_audio_id`,
    DROP KEY `fk_audiolog_player_id_idx`,
    DROP KEY `fk_audiolog_audio_id_idx`,
    MODIFY COLUMN `played_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN `play_type` INT NOT NULL,
    MODIFY COLUMN `user_id` INT NULL, 
    ADD CONSTRAINT `fk_track_plays_tracks_id` FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_track_plays_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
    ADD KEY `index_track_plays_track_id` (`track_id`),
    ADD KEY `index_track_plays_user_id` (`user_id`);
    
-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.6.0');
INSERT INTO change_log (script_name) VALUES ('2.6.0_update_audio_play_log_to_track_plays.sql');