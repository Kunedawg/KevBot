-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: ***REMOVED***    Database: ***REMOVED***
-- ------------------------------------------------------
-- Server version	5.5.62-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `player_greetings`
--

DROP TABLE IF EXISTS `player_greetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `player_greetings` (
  `greeting_id` int(11) NOT NULL AUTO_INCREMENT,
  `greeting` varchar(100) NOT NULL,
  `player_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`greeting_id`),
  KEY `player_id_idx` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_info`
--

DROP TABLE IF EXISTS `player_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `player_info` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `discord_id` varchar(45) NOT NULL,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database '***REMOVED***'
--

--
-- Dumping routines for database '***REMOVED***'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_new_player` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `add_new_player`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE player_id INT;
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF player_id IS NULL THEN
		INSERT INTO player_info (discord_id)
		VALUES (discord_id);
		SELECT player_info.player_id 
		INTO player_id
		FROM player_info
		WHERE player_info.discord_id = discord_id;
    END IF;
    
	IF player_id IS NOT NULL THEN
		SET return_message = 'Success';
	ELSE
		SET return_message = 'Failed';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `del_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `del_greeting`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE player_id INT;
	
	DELETE FROM player_greetings
    WHERE player_greetings.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
    
    SELECT player_greetings.player_id 
    INTO player_id
    FROM player_greetings
    WHERE player_greetings.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
    
    IF player_id IS NULL THEN
		SET return_message = 'Success';
	ELSE
		SET return_message = 'Failed';
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `get_greeting`(IN discord_id VARCHAR(45), OUT greeting VARCHAR(100))
BEGIN
	SELECT player_greetings.greeting
	INTO greeting
	FROM player_greetings
    WHERE player_greetings.player_id = (
		SELECT player_info.player_id
        FROM player_info
        WHERE player_info.discord_id = discord_id
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `set_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `set_greeting`(IN discord_id VARCHAR(45), IN greeting VARCHAR(100), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE player_id INT;
    DECLARE greeting_id INT;
    DECLARE return_greeting VARCHAR(100);
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
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
            SET player_greetings.greeting = greeting
            WHERE player_greetings.greeting_id = greeting_id;
        ELSE
			INSERT INTO player_greetings (greeting, player_id)
			VALUES (greeting, player_id);
        END IF;
		CALL get_greeting(discord_id,return_greeting);
        IF greeting = return_greeting THEN
			SET return_message = 'Success';
        ELSE
			SET return_message = 'Failed. greeting did not set correctly.';
        END IF;
	ELSE
		SET return_message = 'Failed. player_id does not exist.';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-15 20:41:08
