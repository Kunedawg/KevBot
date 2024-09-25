/*
 * Script:      : 2.3.0_update_player_info_to_users.sql
 * Description  : Renames player_info table to users, and updates columns as well
 */

RENAME TABLE `player_info` TO `users`;

ALTER TABLE `users`
    RENAME COLUMN `discord_user_name` TO `discord_username`,
    RENAME COLUMN `player_id` TO `id`;

ALTER TABLE `users`
    ADD COLUMN `username` VARCHAR(32) NULL,
    ADD COLUMN `password_hash` CHAR(60) NULL,
    ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    MODIFY COLUMN `discord_username` VARCHAR(32) NULL,
    MODIFY COLUMN `discord_id` VARCHAR(20) NULL,
    DROP INDEX `discord_id_UNIQUE`,
    ADD UNIQUE INDEX `unique_users_discord_id` (`discord_id`),
    ADD UNIQUE INDEX `unique_users_username` (`username`);

-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.3.0');
INSERT INTO change_log (script_name) VALUES ('2.3.0_update_player_info_to_users.sql');
