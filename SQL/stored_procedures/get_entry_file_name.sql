CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `get_entry_file_name`(IN discord_id VARCHAR(45), OUT file_name VARCHAR(100))
BEGIN
	SELECT player_entry_file_name.file_name
	INTO file_name
	FROM player_entry_file_name
    WHERE player_entry_file_name.player_id = (
		SELECT player_info.player_id
        FROM player_info
        WHERE player_info.discord_id = discord_id
    );
END