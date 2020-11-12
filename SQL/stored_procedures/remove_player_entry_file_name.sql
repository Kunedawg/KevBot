CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `remove_player_entry_file_name`(IN discord_id VARCHAR(45))
BEGIN
	DELETE FROM player_entry_file_name
    WHERE player_entry_file_name.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
END