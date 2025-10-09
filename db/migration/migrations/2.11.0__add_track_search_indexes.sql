-- Adds supporting indexes and config for track search and suggestion features.

-- check ngram token size is 2, fail if not
DROP PROCEDURE IF EXISTS check_ngram;
DELIMITER //

CREATE PROCEDURE check_ngram()
BEGIN
  IF @@ngram_token_size != 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'ngram_token_size must be 2';
  END IF;
END //

DELIMITER ;

CALL check_ngram();
DROP PROCEDURE check_ngram;

ALTER TABLE `tracks`
  ADD INDEX `idx_tracks_name` (`name`);

ALTER TABLE `tracks`
  ADD FULLTEXT INDEX `ftx_tracks_name` (`name`) WITH PARSER ngram;
