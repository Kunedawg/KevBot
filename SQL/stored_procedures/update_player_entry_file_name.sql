CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `update_player_entry_file_name`(IN discord_id VARCHAR(45), IN file_name VARCHAR(100))
BEGIN
	DECLARE player_id INT;
    DECLARE entry_preference_id INT;
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF player_id IS NULL THEN
		CALL `***REMOVED***`.`add_new_player`(discord_id);
		SELECT player_info.player_id 
		INTO player_id
		FROM player_info
		WHERE player_info.discord_id = discord_id;
    END IF;
    
	SELECT player_entry_file_name.entry_preference_id 
	INTO entry_preference_id
	FROM player_entry_file_name
	WHERE player_entry_file_name.player_id = player_id;
    
	IF player_id IS NOT NULL THEN
		IF entry_preference_id IS NOT NULL THEN
			UPDATE player_entry_file_name
            SET player_entry_file_name.file_name = file_name
            WHERE player_entry_file_name.entry_preference_id = entry_preference_id;
        ELSE
			INSERT INTO player_entry_file_name (file_name, player_id)
			VALUES (file_name, player_id);
        END IF;
    END IF;
END