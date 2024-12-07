-- Updates player_greetings table

START TRANSACTION;

-- Create new columns, foreign keys, and update names
RENAME TABLE `player_greetings` TO `user_greetings`;

ALTER TABLE `user_greetings`
    RENAME COLUMN `player_id` to `user_id`;

ALTER TABLE `user_greetings`
    DROP INDEX `player_id_UNIQUE`,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`user_id`),
    DROP COLUMN `greeting_id`;

ALTER TABLE `user_greetings`
    DROP FOREIGN KEY `fk_greeting_player_id`,
    ADD COLUMN `greeting_track_id` INT NULL,
    ADD COLUMN `greeting_playlist_id` INT NULL,
    ADD CONSTRAINT `fk_user_greetings_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_user_greetings_tracks_id` FOREIGN KEY (`greeting_track_id`) REFERENCES `tracks` (`id`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_user_greetings_playlists_id` FOREIGN KEY (`greeting_playlist_id`) REFERENCES `playlists` (`id`) ON UPDATE CASCADE,
    ADD INDEX `index_user_greetings_greeting_track_id` (`greeting_track_id`),
    ADD INDEX `index_user_greetings_greeting_playlist_id` (`greeting_playlist_id`);

-- map (greeting, greeting_type) -> (greeting_track_id, greeting_playlist_id)
-- note, disabling SQL_SAFE_UPDATES is needed because there is no WHERE clause on a keyed column
SET SQL_SAFE_UPDATES = 0;

UPDATE user_greetings ug
    JOIN tracks t ON ug.greeting = t.name
    SET ug.greeting_track_id = t.id
    WHERE ug.greeting_type = 0;

UPDATE user_greetings ug
    JOIN playlists p ON ug.greeting = p.name
    SET ug.greeting_playlist_id = p.id
    WHERE ug.greeting_type = 1;

SET SQL_SAFE_UPDATES = 1;

-- Ensure that only a track or playlist can be not null at one time
-- Note, trigger is needed because a check constraint conflicts with foreign key constraints
DELIMITER $$
CREATE TRIGGER before_user_greetings_update
BEFORE UPDATE ON user_greetings
FOR EACH ROW
BEGIN
    IF (NEW.greeting_track_id IS NOT NULL AND NEW.greeting_playlist_id IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'A user greeting cannot be set to a track and playlist at the same time, only one.';
    END IF;
END$$
DELIMITER ;

-- remove deprecated columns and at an updated at column
ALTER TABLE `user_greetings`
    DROP COLUMN greeting,
    DROP COLUMN greeting_type,
    ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

COMMIT;