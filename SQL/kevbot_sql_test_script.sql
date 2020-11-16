CALL add_new_player('1125',@mess); SELECT @mess;
CALL get_greeting('***REMOVED***', @greeting); SELECT @greeting;
CALL set_greeting('***REMOVED***','rockbody', @mess); SELECT @mess;
CALL del_greeting('***REMOVED***',@mess); SELECT @mess;

SELECT * FROM player_info;
SELECT * FROM player_greetings;