/*
 * Script:      : 2.2.0_update_audio_to_tracks.sql
 * Description  : Renames audio table to tracks, and updates columns of table as well
 */

RENAME TABLE `audio` TO `tracks`;

ALTER TABLE `tracks`
	RENAME COLUMN `audio_id` TO `id`,
    RENAME COLUMN `dt_created` TO `created_at`,
    RENAME COLUMN `audio_name` TO `name`;

ALTER TABLE `tracks`
    MODIFY COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN `duration` FLOAT NOT NULL,
    ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    DROP INDEX `audio_name_UNIQUE`,
    ADD UNIQUE INDEX `unique_tracks_name` (`name`, (IF(`deleted_at`, NULL, 1))),
    RENAME COLUMN `player_id` TO `user_id`,
    DROP FOREIGN KEY `fk_audio_player_id`,
    ADD CONSTRAINT `fk_tracks_users_id` FOREIGN KEY (`user_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE,
    DROP KEY `fk_audio_player_id_idx`,
    ADD KEY `index_tracks_user_id` (`user_id`);

UPDATE `tracks` SET `updated_at` = `created_at`;
    
-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.2.0');
INSERT INTO change_log (script_name) VALUES ('2.2.0_update_audio_to_tracks.sql');
