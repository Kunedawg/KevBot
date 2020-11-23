CALL add_new_player('1125',@mess); SELECT @mess;
CALL get_greeting('***REMOVED***', @greeting); SELECT @greeting;
CALL set_greeting('***REMOVED***','rockbody', @mess); SELECT @mess;
CALL del_greeting('***REMOVED***',@mess); SELECT @mess;

INSERT INTO mp3_storage (mp3, player_id_fk)
VALUES (LOAD_FILE('C:\maindir\kev-bot\audio\4d3d.mp3'), '1124');

SELECT * FROM player_info;
SELECT * FROM player_greetings;
SELECT * FROM mp3_storage;

SELECT LOAD_FILE('C:\maindir\kev-bot\audio\4d3d.mp3') AS Result;