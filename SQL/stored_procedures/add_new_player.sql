CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `add_new_player`(IN discord_id VARCHAR(45))
BEGIN
	DECLARE player_id INT;
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF player_id IS NULL THEN
		INSERT INTO player_info (discord_id)
		VALUES (discord_id);
    END IF;
END