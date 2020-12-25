/*greeting calls*/
CALL get_greeting('1124', @greeting); SELECT @greeting;
CALL set_greeting('1124','rockbody', @mess); SELECT @mess;
CALL del_greeting('1124',@mess); SELECT @mess;
SELECT * FROM player_greetings;

/*player info calls*/
CALL add_new_player('1124',@mess); SELECT @mess;
CALL get_player_id('1124', @player_id, @mess); SELECT @player_id, @mess;
SELECT * FROM player_info;

/*audio calls*/
CALL add_audio('1124', 'kindfawn', @mess); SELECT @mess;
CALL del_audio('kindfawn', @mess); SELECT @mess;
CALL get_audio_id('kindfawn', @audio_id, @mess); SELECT @audio_id, @mess;
SELECT * FROM audio;

/*categories calls*/
CALL add_category('1124', 'animals', @mess); SELECT @mess;
CALL del_category('animals', @mess); SELECT @mess;
CALL get_category_id('animals', @category_id, @mess); SELECT @category_id, @mess;
SELECT * FROM categories;

/*audio_category calls*/
CALL add_audio_category('1124', 'kindfawn', 'animals', @mess); SELECT @mess;
CALL add_audio_category('1124', 'arnoldcum', 'arnold', @mess); SELECT @mess;
CALL del_audio_category('kindfawn', 'animals', @mess); SELECT @mess;
SELECT * FROM audio_category;

/*audio play log calls*/
CALL log_audio_play('1124', 'kindfawn', @mess); SELECT @mess;
SELECT * FROM audio_play_log;

/*audio play log calls*/
CALL log_category_play('1124', 'animals', @mess); SELECT @mess;
SELECT * FROM category_play_log;