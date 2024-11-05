/*
 * Script:      : 2.4.0_update_categories_to_playlists.sql
 * Description  : Renames categories table to playlists, and updates columns of table as well
 */

RENAME TABLE `categories` TO `playlists`;

ALTER TABLE `playlists`
	RENAME COLUMN `category_id` TO `id`,
    RENAME COLUMN `dt_created` TO `created_at`,
    RENAME COLUMN `player_id` TO `user_id`,
    RENAME COLUMN `category_name` TO `name`;

ALTER TABLE `playlists`
    MODIFY COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    DROP INDEX `category_name_UNIQUE`,
    ADD UNIQUE INDEX `unique_playlists_name` (`name`, (IF(`deleted_at`, NULL, 1))),
    DROP FOREIGN KEY `fk_cat_player_id`,
    ADD CONSTRAINT `fk_playlists_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
    DROP KEY `fk_cat_player_id_idx`,
    ADD KEY `index_playlists_user_id` (`user_id`);

UPDATE `playlists` SET `updated_at` = `created_at`;
    
-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.4.0');
INSERT INTO change_log (script_name) VALUES ('2.4.0_update_categories_to_playlists.sql');
