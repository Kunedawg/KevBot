-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `audio_category` 
DROP FOREIGN KEY `player_id_fk`;

ALTER TABLE `audio_play_log` 
DROP FOREIGN KEY `audio_log_player_id_fk`;

ALTER TABLE `category_play_log` 
DROP FOREIGN KEY `cat_log_player_id_fk`;

ALTER TABLE `player_greetings` 
DROP FOREIGN KEY `greeting_player_id_fk`;

ALTER TABLE `audio` 
ADD INDEX `fk_audio_player_id_idx` (`player_id` ASC),
DROP INDEX `player_id_idx` ;

ALTER TABLE `audio_category` 
ADD INDEX `fk_audiocat_player_id_idx` (`player_id` ASC),
ADD INDEX `fk_audiocat_audio_id_idx` (`audio_id` ASC),
ADD INDEX `fk_audiocat_cat_id_idx` (`category_id` ASC),
DROP INDEX `player_id_idx` ;

ALTER TABLE `audio_play_log` 
ADD INDEX `fk_audiolog_player_id_idx` (`player_id` ASC),
ADD INDEX `fk_audiolog_audio_id_idx` (`audio_id` ASC),
DROP INDEX `audio_log_player_id_fk_idx` ;

ALTER TABLE `categories` 
ADD INDEX `fk_cat_player_id_idx` (`player_id` ASC),
DROP INDEX `player_id_fk_idx` ;

ALTER TABLE `category_play_log` 
ADD INDEX `fk_catlog_player_id_idx` (`player_id` ASC),
DROP INDEX `cat_log_player_id_fk_idx` ;

CREATE TABLE IF NOT EXISTS `player_farewells` (
  `farewell_id` INT(11) NOT NULL AUTO_INCREMENT,
  `farewell` VARCHAR(100) NOT NULL,
  `player_id` INT(11) NOT NULL,
  PRIMARY KEY (`farewell_id`),
  UNIQUE INDEX `player_id_UNIQUE` (`player_id` ASC),
  CONSTRAINT `fk_farewell_player_id`
    FOREIGN KEY (`player_id`)
    REFERENCES `player_info` (`player_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

ALTER TABLE `player_greetings` 
ADD UNIQUE INDEX `player_id_UNIQUE` (`player_id` ASC),
DROP INDEX `player_id_idx` ;

ALTER TABLE `player_info` 
ADD UNIQUE INDEX `discord_id_UNIQUE` (`discord_id` ASC);

ALTER TABLE `audio` 
ADD CONSTRAINT `fk_audio_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE `audio_category` 
ADD CONSTRAINT `fk_audiocat_audio_id`
  FOREIGN KEY (`audio_id`)
  REFERENCES `audio` (`audio_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_audiocat_cat_id`
  FOREIGN KEY (`category_id`)
  REFERENCES `categories` (`category_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_audiocat_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE `audio_play_log` 
ADD CONSTRAINT `fk_audiolog_audio_id`
  FOREIGN KEY (`audio_id`)
  REFERENCES `audio` (`audio_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_audiolog_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE `categories` 
ADD CONSTRAINT `fk_cat_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE `category_play_log` 
ADD CONSTRAINT `fk_catlog_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE `player_greetings` 
ADD CONSTRAINT `fk_greeting_player_id`
  FOREIGN KEY (`player_id`)
  REFERENCES `player_info` (`player_id`)
  ON DELETE NO ACTION
  ON UPDATE CASCADE;


DELIMITER $$
CREATE PROCEDURE `del_farewell`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE player_id INT;
	
	DELETE FROM player_farewells
    WHERE player_farewells.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
    
    SELECT player_farewells.player_id 
    INTO player_id
    FROM player_farewells
    WHERE player_farewells.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
    
    IF player_id IS NULL THEN
		SET return_message = 'Success';
	ELSE
		SET return_message = 'Failed';
	END IF;
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `get_farewell`(IN discord_id VARCHAR(45), OUT farewell VARCHAR(100))
BEGIN
	SELECT player_farewells.farewell
	INTO farewell
	FROM player_farewells
    WHERE player_farewells.player_id = (
		SELECT player_info.player_id
        FROM player_info
        WHERE player_info.discord_id = discord_id
    );
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `set_farewell`(IN discord_id VARCHAR(45), IN farewell VARCHAR(100), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE player_id INT;
    DECLARE farewell_id INT;
    DECLARE return_farewell VARCHAR(100);
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF player_id IS NULL THEN
		CALL add_new_player(discord_id, @return_message);
        IF @return_message = 'Success' THEN
			SELECT player_info.player_id 
			INTO player_id
			FROM player_info
			WHERE player_info.discord_id = discord_id;
		ELSE
			SET return_message = 'Failed. Could not add new player';
			LEAVE sp;
		END IF;
    END IF;
    
	SELECT player_farewells.farewell_id
	INTO farewell_id
	FROM player_farewells
	WHERE player_farewells.player_id = player_id;
    
	IF player_id IS NOT NULL THEN
		IF farewell_id IS NOT NULL THEN
			UPDATE player_farewells
            SET player_farewells.farewell = farewell
            WHERE player_farewells.farewell_id = farewell_id;
        ELSE
			INSERT INTO player_farewells (farewell, player_id)
			VALUES (farewell, player_id);
        END IF;
		CALL get_farewell(discord_id, return_farewell);
        IF farewell = return_farewell THEN
			SET return_message = 'Success';
        ELSE
			SET return_message = 'Failed. Farewell did not set correctly.';
        END IF;
	ELSE
		SET return_message = 'Failed. player_id does not exist.';
    END IF;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
