/*
 * Script:      : 2.10.0_update_player_farewells_to_user_farewells.sql
 * Description  : Updates player_farewells table
 */

START TRANSACTION;

-- Create new columns, foreign keys, and update names
RENAME TABLE `player_farewells` TO `user_farewells`;

ALTER TABLE `user_farewells`
    RENAME COLUMN `player_id` to `user_id`;

ALTER TABLE `user_farewells`
    DROP INDEX `player_id_UNIQUE`,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`user_id`),
    DROP COLUMN `farewell_id`;

ALTER TABLE `user_farewells`
    DROP FOREIGN KEY `fk_farewell_player_id`,
    ADD COLUMN `farewell_track_id` INT NULL,
    ADD COLUMN `farewell_playlist_id` INT NULL,
    ADD CONSTRAINT `fk_user_farewells_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_user_farewells_tracks_id` FOREIGN KEY (`farewell_track_id`) REFERENCES `tracks` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_user_farewells_playlists_id` FOREIGN KEY (`farewell_playlist_id`) REFERENCES `playlists` (`id`) ON UPDATE CASCADE,
    ADD INDEX `index_user_farewells_farewell_track_id` (`farewell_track_id`),
    ADD INDEX `index_user_farewells_farewell_playlist_id` (`farewell_playlist_id`);

-- map farewell -> farewell_track_id
-- note, disabling SQL_SAFE_UPDATES is needed because there is no WHERE clause on a keyed column
SET SQL_SAFE_UPDATES = 0;

UPDATE user_farewells uf
    JOIN tracks t ON uf.farewell = t.name
    SET uf.farewell_track_id = t.id;

SET SQL_SAFE_UPDATES = 1;

-- Ensure that only a track or playlist can be not null at one time
-- Note, trigger is needed because a check constraint conflicts with foreign key constraints
DELIMITER $$
CREATE TRIGGER before_user_farewells_update
BEFORE UPDATE ON user_farewells
FOR EACH ROW
BEGIN
    IF (NEW.farewell_track_id IS NOT NULL AND NEW.farewell_playlist_id IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'A user farewell cannot be set to a track and playlist at the same time, only one.';
    END IF;
END$$
DELIMITER ;

-- remove deprecated columns and at an updated at column
ALTER TABLE `user_farewells`
    DROP COLUMN farewell,
    ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.10.0');
INSERT INTO change_log (script_name) VALUES ('2.10.0_update_player_farewells_to_user_farewells.sql');

COMMIT;