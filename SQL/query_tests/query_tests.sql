/*greeting calls*/
-- CALL get_greeting('1124', @greeting); SELECT @greeting;
-- CALL set_greeting('1124','rockbody', @mess); SELECT @mess;
-- CALL del_greeting('1124',@mess); SELECT @mess;
SELECT * FROM player_greetings;

/*player info calls*/
-- CALL add_new_player('1124',@mess); SELECT @mess;
-- CALL get_player_id('1124', @player_id, @mess); SELECT @player_id, @mess;
-- CALL update_discord_user_name('1124', 'mario', @mess); SELECT @mess;
SELECT * FROM player_info;

/*audio calls*/
-- CALL add_audio('1124', 'newaudio', '9', @mess); SELECT @mess;
-- CALL add_audio('145361690328825857', 'identify', '8', @mess); SELECT @mess;
-- CALL del_audio('kindfawn', @mess); SELECT @mess;
-- CALL get_audio_id('kindfawn', @audio_id, @mess); SELECT @audio_id, @mess;
SELECT * FROM audio;
SELECT COUNT(*) FROM audio;
SELECT * FROM audio WHERE player_id = 351 AND audio_id IN (1521,1681,1771,1801,2151,2281,2341,2371,2911,2931,3081,3191,3331,3351,3661,3691,3711,3871,3991,4051,4121,4301);

/*audio and player_info join for*/
SELECT audio.audio_name, player_info.discord_id
FROM audio
INNER JOIN player_info
ON audio.player_id = player_info.player_id;

/*audio log and audio inner join for*/
SELECT audio.audio_name, audio_play_log.play_type
FROM audio_play_log
INNER JOIN audio
ON audio_play_log.audio_id = audio.audio_id;

/*categories calls*/
-- CALL add_category('1124', 'animals', @mess); SELECT @mess;
-- CALL del_category('animals', @mess); SELECT @mess;
-- CALL get_category_id('animals', @category_id, @mess); SELECT @category_id, @mess;
SELECT * FROM categories;
SELECT discord_id FROM categories INNER JOIN player_info ON player_info.player_id = categories.player_id WHERE category_name = 'bingo';

/*audio_category calls*/
-- CALL add_audio_category('1124', 'kindfawn', 'animals', @mess); SELECT @mess;
-- CALL del_audio_category('kindfawn', 'animals', @mess); SELECT @mess;
SELECT * FROM audio_category;

/*audio play log calls*/
-- CALL log_audio_play('1124', '4d3d', '0', @mess); SELECT @mess;
SELECT * FROM audio_play_log;

/*audio play log calls*/
-- CALL log_category_play('1124', 'timeric', @mess); SELECT @mess;
SELECT * FROM category_play_log;

/* DELETE and REPLACE DATABASE */
-- DROP DATABASE `database_name`;
-- CREATE DATABASE `database_name`;