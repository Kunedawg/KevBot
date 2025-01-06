-- MySQL dump 10.13  Distrib 8.3.0, for macos13.6 (arm64)
--
-- Host: ******.db.ondigitalocean.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audio`
--

DROP TABLE IF EXISTS `audio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio` (
  `audio_id` int NOT NULL AUTO_INCREMENT,
  `audio_name` varchar(45) NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int NOT NULL,
  `duration` float NOT NULL DEFAULT '10',
  PRIMARY KEY (`audio_id`),
  UNIQUE KEY `audio_name_UNIQUE` (`audio_name`),
  KEY `fk_audio_player_id_idx` (`player_id`),
  CONSTRAINT `fk_audio_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audio_category`
--

DROP TABLE IF EXISTS `audio_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_category` (
  `audio_categoy_id` int NOT NULL AUTO_INCREMENT,
  `audio_id` int NOT NULL,
  `category_id` int NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`audio_categoy_id`),
  KEY `fk_audiocat_player_id_idx` (`player_id`),
  KEY `fk_audiocat_audio_id_idx` (`audio_id`),
  KEY `fk_audiocat_cat_id_idx` (`category_id`),
  CONSTRAINT `fk_audiocat_audio_id` FOREIGN KEY (`audio_id`) REFERENCES `audio` (`audio_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_audiocat_cat_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_audiocat_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5801 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audio_play_log`
--

DROP TABLE IF EXISTS `audio_play_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_play_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `audio_id` int NOT NULL,
  `dt_played` datetime NOT NULL,
  `player_id` int NOT NULL,
  `play_type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`log_id`),
  KEY `fk_audiolog_player_id_idx` (`player_id`),
  KEY `fk_audiolog_audio_id_idx` (`audio_id`),
  CONSTRAINT `fk_audiolog_audio_id` FOREIGN KEY (`audio_id`) REFERENCES `audio` (`audio_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_audiolog_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=631535 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(45) NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name_UNIQUE` (`category_name`),
  KEY `fk_cat_player_id_idx` (`player_id`),
  CONSTRAINT `fk_cat_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=788 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category_play_log`
--

DROP TABLE IF EXISTS `category_play_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_play_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `dt_played` datetime NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `fk_catlog_player_id_idx` (`player_id`),
  CONSTRAINT `fk_catlog_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65338 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_farewells`
--

DROP TABLE IF EXISTS `player_farewells`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_farewells` (
  `farewell_id` int NOT NULL AUTO_INCREMENT,
  `farewell` varchar(100) NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`farewell_id`),
  UNIQUE KEY `player_id_UNIQUE` (`player_id`),
  CONSTRAINT `fk_farewell_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=277 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_greetings`
--

DROP TABLE IF EXISTS `player_greetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_greetings` (
  `greeting_id` int NOT NULL AUTO_INCREMENT,
  `greeting` varchar(100) NOT NULL,
  `player_id` int NOT NULL,
  `greeting_type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`greeting_id`),
  UNIQUE KEY `player_id_UNIQUE` (`player_id`),
  CONSTRAINT `fk_greeting_player_id` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=668 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_info`
--

DROP TABLE IF EXISTS `player_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_info` (
  `player_id` int NOT NULL AUTO_INCREMENT,
  `discord_id` varchar(45) NOT NULL,
  `discord_user_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `discord_id_UNIQUE` (`discord_id`)
) ENGINE=InnoDB AUTO_INCREMENT=808 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'defaultdb'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_audio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `add_audio`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), IN duration FLOAT, OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE audio_name_look_up VARCHAR(45);

    CALL get_player_id(discord_id, @player_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;
    
    SELECT audio.audio_name
    INTO audio_name_look_up
    FROM audio
    WHERE audio.audio_name = audio_name;
    
    IF audio_name_look_up IS NOT NULL THEN
		SET return_message = 'Failed. Please specify a unique audio_name';
		LEAVE sp;		
    END IF;
    
	INSERT INTO audio (audio_name, dt_created, player_id, duration)
	VALUES (audio_name, NOW(),  @player_id, duration);
    SET return_message = 'Success';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_audio_category` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `add_audio_category`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE audio_category_id_look_up VARCHAR(45);

	CALL get_audio_id(audio_name, @audio_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get audio id';
		LEAVE sp;
	END IF;
    
	CALL get_category_id(category_name, @category_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get category id';
		LEAVE sp;
	END IF;    
	
    CALL get_player_id(discord_id, @player_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;
    
    SELECT audio_category.audio_id
    INTO audio_category_id_look_up
    FROM audio_category
    WHERE audio_category.audio_id = @audio_id AND audio_category.category_id= @category_id;
    
    IF audio_category_id_look_up IS NOT NULL THEN
		SET return_message = 'Success'; /*The audio category link already exists, so just return Success.*/
		LEAVE sp;		
    END IF;
    
	INSERT INTO audio_category (audio_id, category_id, dt_created, player_id)
	VALUES (@audio_id, @category_id, NOW(), @player_id);
    SET return_message = 'Success';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_category` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `add_category`(IN discord_id VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE category_name_look_up VARCHAR(45);

    CALL get_player_id(discord_id, @player_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;
    
    SELECT categories.category_name
    INTO category_name_look_up
    FROM categories
    WHERE categories.category_name = category_name;
    
    IF category_name_look_up IS NOT NULL THEN
		SET return_message = 'Failed. Please specify a unique category_name';
		LEAVE sp;		
    END IF;
    
	INSERT INTO categories (category_name, dt_created, player_id)
	VALUES (category_name, NOW(),  @player_id);
    SET return_message = 'Success';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
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
CREATE DEFINER=`doadmin`@`%` PROCEDURE `add_new_player`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 DROP PROCEDURE IF EXISTS `del_audio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `del_audio`(IN audio_name VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE audio_name_look_up VARCHAR(45);
	
	DELETE FROM audio
    WHERE audio.audio_name = audio_name;
    
    SELECT audio.audio_name 
    INTO audio_name_look_up
    FROM audio
    WHERE audio.audio_name = audio_name;
    
    IF audio_name_look_up IS NULL THEN
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
/*!50003 DROP PROCEDURE IF EXISTS `del_audio_category` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `del_audio_category`(IN audio_name VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE audio_category_id_look_up VARCHAR(45);

	CALL get_audio_id(audio_name, @audio_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get audio id';
		LEAVE sp;
	END IF;
    
	CALL get_category_id(category_name, @category_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get category id';
		LEAVE sp;
	END IF;    
    
	DELETE FROM audio_category
    WHERE audio_category.audio_id = @audio_id AND audio_category.category_id= @category_id; 
    
    SELECT audio_category.audio_id
    INTO audio_category_id_look_up
    FROM audio_category
    WHERE audio_category.audio_id = @audio_id AND audio_category.category_id= @category_id;
    
    IF audio_category_id_look_up IS NULL THEN
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
/*!50003 DROP PROCEDURE IF EXISTS `del_category` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `del_category`(IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE category_name_look_up  VARCHAR(45);
	
	DELETE FROM categories
    WHERE categories.category_name = category_name;
    
    SELECT categories.category_name 
    INTO category_name_look_up
    FROM categories
    WHERE categories.category_name = category_name;
    
    IF category_name_look_up IS NULL THEN
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
/*!50003 DROP PROCEDURE IF EXISTS `del_farewell` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `del_farewell`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
BEGIN
	DECLARE player_id INT;
	
	DELETE FROM player_farewells
    WHERE player_farewells.player_id = (
		SELECT player_info.player_id 
		FROM player_info
		WHERE player_info.discord_id = discord_id  
    );
    
    SELECT player_farewells.player_id 
    INTO player_id
    FROM player_farewells
    WHERE player_farewells.player_id = (
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
CREATE DEFINER=`doadmin`@`%` PROCEDURE `del_greeting`(IN discord_id VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 DROP PROCEDURE IF EXISTS `get_audio_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `get_audio_id`(IN audio_name VARCHAR(45), OUT audio_id INT, OUT return_message VARCHAR(100))
sp: BEGIN
	SELECT audio.audio_id 
    INTO audio_id
    FROM audio
    WHERE audio.audio_name = audio_name;
    
    IF audio_id IS NOT NULL THEN
		SET return_message = 'Success';
	ELSE
		SET return_message = 'Failed. audio_id does not exist for given audio_name';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_category_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `get_category_id`(IN category_name VARCHAR(45), OUT category_id INT, OUT return_message VARCHAR(100))
sp: BEGIN
	SELECT categories.category_id 
    INTO category_id
    FROM categories
    WHERE categories.category_name = category_name;
    
    IF category_id IS NOT NULL THEN
		SET return_message = 'Success';
	ELSE
		SET return_message = 'Failed. category_id does not exist for given category_name';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_farewell` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `get_farewell`(IN discord_id VARCHAR(45), OUT farewell VARCHAR(100))
BEGIN
	SELECT player_farewells.farewell
	INTO farewell
	FROM player_farewells
    WHERE player_farewells.player_id = (
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
/*!50003 DROP PROCEDURE IF EXISTS `get_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `get_greeting`(IN discord_id VARCHAR(45), OUT greeting VARCHAR(100), OUT greeting_type INT)
BEGIN
	SELECT player_greetings.greeting, player_greetings.greeting_type
	INTO greeting, greeting_type
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
/*!50003 DROP PROCEDURE IF EXISTS `get_player_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `get_player_id`(IN discord_id VARCHAR(45), OUT player_id INT, OUT return_message VARCHAR(100))
sp: BEGIN
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
/*!50003 DROP PROCEDURE IF EXISTS `log_audio_play` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `log_audio_play`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), IN play_type INT(11), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE audio_category_id_look_up VARCHAR(45);

	CALL get_audio_id(audio_name, @audio_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get audio id';
		LEAVE sp;
	END IF;
	
    CALL get_player_id(discord_id, @player_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;
    
	INSERT INTO audio_play_log (audio_id, dt_played, player_id, play_type)
	VALUES (@audio_id, NOW(), @player_id, play_type);
    SET return_message = 'Success';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `log_category_play` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `log_category_play`(IN discord_id VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE audio_category_id_look_up VARCHAR(45);

	CALL get_category_id(category_name, @category_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get category id';
		LEAVE sp;
	END IF;   
	
    CALL get_player_id(discord_id, @player_id, @return_message);
	IF NOT @return_message = 'Success' THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;
    
	INSERT INTO category_play_log (category_id, dt_played, player_id)
	VALUES (@category_id, NOW(), @player_id);
    SET return_message = 'Success';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `set_farewell` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `set_farewell`(IN discord_id VARCHAR(45), IN farewell VARCHAR(100), OUT return_message VARCHAR(100))
sp: BEGIN
	DECLARE player_id INT;
    DECLARE farewell_id INT;
    DECLARE return_farewell VARCHAR(100);
    
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
    
	SELECT player_farewells.farewell_id
	INTO farewell_id
	FROM player_farewells
	WHERE player_farewells.player_id = player_id;
    
	IF player_id IS NOT NULL THEN
		IF farewell_id IS NOT NULL THEN
			UPDATE player_farewells
            SET player_farewells.farewell = farewell
            WHERE player_farewells.farewell_id = farewell_id;
        ELSE
			INSERT INTO player_farewells (farewell, player_id)
			VALUES (farewell, player_id);
        END IF;
		CALL get_farewell(discord_id, return_farewell);
        IF farewell = return_farewell THEN
			SET return_message = 'Success';
        ELSE
			SET return_message = 'Failed. Farewell did not set correctly.';
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
/*!50003 DROP PROCEDURE IF EXISTS `set_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `set_greeting`(IN discord_id VARCHAR(45), IN greeting VARCHAR(100), IN greeting_type INT, OUT return_message VARCHAR(100))
sp: BEGIN
	
	DECLARE player_id INT;
    DECLARE greeting_id INT;
    DECLARE return_greeting VARCHAR(100);
    DECLARE return_greeting_type INT;
    
    SELECT player_info.player_id 
    INTO player_id
    FROM player_info
    WHERE player_info.discord_id = discord_id;
    
    IF greeting_type IS NULL OR greeting_type < 0 OR greeting_type > 1 THEN
		SET return_message = 'Failed, greeeting_type was not provided, or was not 0 or 1.';
		LEAVE sp;
    END IF;
    
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
            SET player_greetings.greeting = greeting, player_greetings.greeting_type = greeting_type
            WHERE player_greetings.greeting_id = greeting_id;
        ELSE
			INSERT INTO player_greetings (greeting, player_id, greeting_type)
			VALUES (greeting, player_id, greeting_type);
        END IF;
		CALL get_greeting(discord_id, return_greeting, return_greeting_type);
        IF greeting = return_greeting AND greeting_type = return_greeting_type THEN
			SET return_message = 'Success';
        ELSE
			SET return_message = 'Failed. Greeting did not set correctly.';
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
/*!50003 DROP PROCEDURE IF EXISTS `update_discord_user_name` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`doadmin`@`%` PROCEDURE `update_discord_user_name`(IN discord_id VARCHAR(45), IN discord_user_name VARCHAR(45), OUT return_message VARCHAR(100))
sp: BEGIN

	CALL get_player_id(discord_id, @player_id, @return_message);
	IF @return_message <> 'Success' OR @player_id IS NULL THEN
		SET return_message = 'Failed. Could not get player id';
		LEAVE sp;
	END IF;

	UPDATE player_info
	SET player_info.discord_user_name = discord_user_name
	WHERE player_info.player_id = @player_id;
	SET return_message = 'Success';
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

-- Dump completed on 2024-06-09 21:23:31
