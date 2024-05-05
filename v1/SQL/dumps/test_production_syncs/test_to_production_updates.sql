-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';


USE `heroku_7d46a4d7ec18ce3`;
DROP procedure IF EXISTS `heroku_7d46a4d7ec18ce3`.`get_greeting`;

DELIMITER $$
USE `heroku_7d46a4d7ec18ce3`$$
CREATE PROCEDURE `get_greeting`(IN discord_id VARCHAR(45), OUT greeting VARCHAR(100), OUT greeting_type INT)
BEGIN
	SELECT player_greetings.greeting, player_greetings.greeting_type
	INTO greeting, greeting_type
	FROM player_greetings
    WHERE player_greetings.player_id = (
		SELECT player_info.player_id
        FROM player_info
        WHERE player_info.discord_id = discord_id
    );
END$$

DELIMITER ;

USE `heroku_7d46a4d7ec18ce3`;
DROP procedure IF EXISTS `heroku_7d46a4d7ec18ce3`.`set_greeting`;

DELIMITER $$
USE `heroku_7d46a4d7ec18ce3`$$
CREATE PROCEDURE `set_greeting`(IN discord_id VARCHAR(45), IN greeting VARCHAR(100), IN greeting_type INT, OUT return_message VARCHAR(100))
sp: BEGIN
	-- greeting_type 0=file, 1=category
	DECLARE player_id INT;
    DECLARE greeting_id INT;
    DECLARE return_greeting VARCHAR(100);
    DECLARE return_greeting_type INT;
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF greeting_type IS NULL OR greeting_type < 0 OR greeting_type > 1 THEN
		SET return_message = 'Failed, greeeting_type was not provided, or was not 0 or 1.';
		LEAVE sp;
    END IF;
    
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
    
	SELECT player_greetings.greeting_id
	INTO greeting_id
	FROM player_greetings
	WHERE player_greetings.player_id = player_id;
    
	IF player_id IS NOT NULL THEN
		IF greeting_id IS NOT NULL THEN
			UPDATE player_greetings
            SET player_greetings.greeting = greeting, player_greetings.greeting_type = greeting_type
            WHERE player_greetings.greeting_id = greeting_id;
        ELSE
			INSERT INTO player_greetings (greeting, player_id, greeting_type)
			VALUES (greeting, player_id, greeting_type);
        END IF;
		CALL get_greeting(discord_id, return_greeting, return_greeting_type);
        IF greeting = return_greeting AND greeting_type = return_greeting_type THEN
			SET return_message = 'Success';
        ELSE
			SET return_message = 'Failed. Greeting did not set correctly.';
        END IF;
	ELSE
		SET return_message = 'Failed. player_id does not exist.';
    END IF;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
