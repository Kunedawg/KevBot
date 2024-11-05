/*
 * Script:      : 2.1.0_remove_stored_procedures.sql
 * Description  : removes all stored procedures from the database
 */

DROP PROCEDURE IF EXISTS `add_audio`;
DROP PROCEDURE IF EXISTS `add_audio_category`;
DROP PROCEDURE IF EXISTS `add_category`;
DROP PROCEDURE IF EXISTS `add_new_player`;
DROP PROCEDURE IF EXISTS `del_audio`;
DROP PROCEDURE IF EXISTS `del_audio_category`;
DROP PROCEDURE IF EXISTS `del_category`;
DROP PROCEDURE IF EXISTS `del_farewell`;
DROP PROCEDURE IF EXISTS `del_greeting`;
DROP PROCEDURE IF EXISTS `get_audio_id`;
DROP PROCEDURE IF EXISTS `get_category_id`;
DROP PROCEDURE IF EXISTS `get_farewell`;
DROP PROCEDURE IF EXISTS `get_greeting`;
DROP PROCEDURE IF EXISTS `get_player_id`;
DROP PROCEDURE IF EXISTS `log_audio_play`;
DROP PROCEDURE IF EXISTS `log_category_play`;
DROP PROCEDURE IF EXISTS `set_farewell`;
DROP PROCEDURE IF EXISTS `set_greeting`;
DROP PROCEDURE IF EXISTS `update_discord_user_name`;
DROP PROCEDURE IF EXISTS `update_discord_user_name`;

-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.1.0');
INSERT INTO change_log (script_name) VALUES ('2.1.0_remove_stored_procedures.sql');