/*
 * Script:      : 2.99.0_temp_foreign_key_updates.sql
 * Description  : updates foreign keys
 */

ALTER TABLE `audio_play_log`
	RENAME COLUMN `audio_id` TO `track_id`,
    DROP FOREIGN KEY `fk_audiolog_audio_id`,
    ADD CONSTRAINT `fk_audio_play_log_tracks_id` FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON UPDATE CASCADE;
    
-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.99.0');
INSERT INTO change_log (script_name) VALUES ('2.99.0_temp_foreign_key_updates.sql');
