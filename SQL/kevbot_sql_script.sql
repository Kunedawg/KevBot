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
-- Table structure for table `audio`
--

DROP TABLE IF EXISTS `audio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audio` (
  `audio_id` int(11) NOT NULL AUTO_INCREMENT,
  `audio_name` varchar(45) NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`audio_id`),
  UNIQUE KEY `audio_name_UNIQUE` (`audio_name`),
  KEY `player_id_idx` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1331 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio`
--

LOCK TABLES `audio` WRITE;
/*!40000 ALTER TABLE `audio` DISABLE KEYS */;
INSERT INTO `audio` VALUES (1,'20000','0000-00-00 00:00:00',0),(11,'4d3d','0000-00-00 00:00:00',0),(21,'ading','0000-00-00 00:00:00',0),(31,'adoptkevin','0000-00-00 00:00:00',0),(41,'afterdinner','0000-00-00 00:00:00',0),(51,'arnoldcum','0000-00-00 00:00:00',0),(61,'askmaury','0000-00-00 00:00:00',0),(71,'awwami','0000-00-00 00:00:00',0),(81,'awwhell','0000-00-00 00:00:00',0),(91,'baythang','0000-00-00 00:00:00',0),(101,'beatmonkey','0000-00-00 00:00:00',0),(111,'bevcheck','0000-00-00 00:00:00',0),(121,'birdup','0000-00-00 00:00:00',0),(131,'blamethem','0000-00-00 00:00:00',0),(141,'blastin','0000-00-00 00:00:00',0),(151,'blowsup','0000-00-00 00:00:00',0),(161,'bolognasoft','0000-00-00 00:00:00',0),(171,'booyah','0000-00-00 00:00:00',0),(181,'brityes','0000-00-00 00:00:00',0),(191,'byebye','0000-00-00 00:00:00',0),(201,'chrisup','0000-00-00 00:00:00',0),(211,'clicknice','0000-00-00 00:00:00',0),(221,'crunch','0000-00-00 00:00:00',0),(231,'cumdayandnight','0000-00-00 00:00:00',0),(241,'cummin','0000-00-00 00:00:00',0),(251,'dadlike','0000-00-00 00:00:00',0),(261,'depends','0000-00-00 00:00:00',0),(271,'ding','0000-00-00 00:00:00',0),(281,'dodahdoodoo','0000-00-00 00:00:00',0),(291,'dreambitch','0000-00-00 00:00:00',0),(301,'duck','0000-00-00 00:00:00',0),(311,'foryourhealth','0000-00-00 00:00:00',0),(321,'foryourtech','0000-00-00 00:00:00',0),(331,'freaknikbackve','0000-00-00 00:00:00',0),(341,'ghostride','0000-00-00 00:00:00',0),(351,'gimmeshoes','0000-00-00 00:00:00',0),(361,'gohard','0000-00-00 00:00:00',0),(371,'gonnawork','0000-00-00 00:00:00',0),(381,'goodascumming','0000-00-00 00:00:00',0),(391,'goodintentions','0000-00-00 00:00:00',0),(401,'greasindudes','0000-00-00 00:00:00',0),(411,'greatestfeel','0000-00-00 00:00:00',0),(421,'hankbust','0000-00-00 00:00:00',0),(431,'haters','0000-00-00 00:00:00',0),(441,'heard','0000-00-00 00:00:00',0),(451,'hellogov','0000-00-00 00:00:00',0),(461,'heyjoshy','0000-00-00 00:00:00',0),(471,'history','0000-00-00 00:00:00',0),(481,'hmmmm','0000-00-00 00:00:00',0),(491,'holyguac','0000-00-00 00:00:00',0),(501,'icetea','0000-00-00 00:00:00',0),(511,'idk','0000-00-00 00:00:00',0),(521,'imback','0000-00-00 00:00:00',0),(531,'imballsy','0000-00-00 00:00:00',0),(541,'imout','0000-00-00 00:00:00',0),(551,'ismoke','0000-00-00 00:00:00',0),(561,'itshot','0000-00-00 00:00:00',0),(571,'joy','0000-00-00 00:00:00',0),(581,'justdreams','0000-00-00 00:00:00',0),(591,'keeponit','0000-00-00 00:00:00',0),(601,'knowdaddy','0000-00-00 00:00:00',0),(611,'literature','0000-00-00 00:00:00',0),(621,'livealone','0000-00-00 00:00:00',0),(631,'lobsters','0000-00-00 00:00:00',0),(641,'logs','0000-00-00 00:00:00',0),(651,'lordbust','0000-00-00 00:00:00',0),(661,'mad','0000-00-00 00:00:00',0),(671,'mate','0000-00-00 00:00:00',0),(681,'meetdad','0000-00-00 00:00:00',0),(691,'molest','0000-00-00 00:00:00',0),(701,'neversaid','0000-00-00 00:00:00',0),(711,'neversaidlong','0000-00-00 00:00:00',0),(721,'no','0000-00-00 00:00:00',0),(731,'nonathat','0000-00-00 00:00:00',0),(741,'nudetayne','0000-00-00 00:00:00',0),(751,'oldtimes','0000-00-00 00:00:00',0),(761,'pinyonga','0000-00-00 00:00:00',0),(771,'poison','0000-00-00 00:00:00',0),(781,'profanity','0000-00-00 00:00:00',0),(791,'prom','0000-00-00 00:00:00',0),(801,'question','0000-00-00 00:00:00',0),(811,'readykids','0000-00-00 00:00:00',0),(821,'renob','0000-00-00 00:00:00',0),(831,'retarded','0000-00-00 00:00:00',0),(841,'rockbody','0000-00-00 00:00:00',0),(851,'seeyourpenis','0000-00-00 00:00:00',0),(861,'sexykids','0000-00-00 00:00:00',0),(871,'shakeyobuns','0000-00-00 00:00:00',0),(881,'shrimphigh','0000-00-00 00:00:00',0),(891,'six','0000-00-00 00:00:00',0),(901,'skins','0000-00-00 00:00:00',0),(911,'slapfriend','0000-00-00 00:00:00',0),(921,'solong','0000-00-00 00:00:00',0),(931,'sorrycharlie','0000-00-00 00:00:00',0),(941,'sorryforwhat','0000-00-00 00:00:00',0),(951,'soundsexpensi','0000-00-00 00:00:00',0),(961,'spaghett','0000-00-00 00:00:00',0),(971,'spitus','0000-00-00 00:00:00',0),(981,'spottea','0000-00-00 00:00:00',0),(991,'stupidkids','0000-00-00 00:00:00',0),(1001,'tango','0000-00-00 00:00:00',0),(1011,'tayne','0000-00-00 00:00:00',0),(1021,'thatsaman','0000-00-00 00:00:00',0),(1031,'thinkdad','0000-00-00 00:00:00',0),(1041,'triple','0000-00-00 00:00:00',0),(1051,'trumpcum','0000-00-00 00:00:00',0),(1061,'trumpeee','0000-00-00 00:00:00',0),(1071,'urnuts','0000-00-00 00:00:00',0),(1081,'waitjay','0000-00-00 00:00:00',0),(1091,'waka','0000-00-00 00:00:00',0),(1101,'wassup','0000-00-00 00:00:00',0),(1111,'wawoo','0000-00-00 00:00:00',0),(1121,'weewoo','0000-00-00 00:00:00',0),(1131,'whatshap','0000-00-00 00:00:00',0),(1141,'whoyou','0000-00-00 00:00:00',0),(1151,'yadoofus','0000-00-00 00:00:00',0),(1161,'yaturkey','0000-00-00 00:00:00',0),(1171,'yeet','0000-00-00 00:00:00',0),(1181,'yes','0000-00-00 00:00:00',0),(1191,'yourmilk','0000-00-00 00:00:00',0),(1201,'yuhmuh','0000-00-00 00:00:00',0),(1211,'bingo','0000-00-00 00:00:00',0),(1221,'bingo2','2020-12-18 06:12:46',0),(1321,'kindfawn','2020-12-19 22:32:15',351);
/*!40000 ALTER TABLE `audio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audio_category`
--

DROP TABLE IF EXISTS `audio_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audio_category` (
  `audio_categoy_id` int(11) NOT NULL AUTO_INCREMENT,
  `audio_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`audio_categoy_id`),
  KEY `audio_id_idx` (`audio_id`),
  KEY `category_id_idx` (`category_id`),
  KEY `player_id_idx` (`player_id`),
  CONSTRAINT `audio_id` FOREIGN KEY (`audio_id`) REFERENCES `audio` (`audio_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_category`
--

LOCK TABLES `audio_category` WRITE;
/*!40000 ALTER TABLE `audio_category` DISABLE KEYS */;
INSERT INTO `audio_category` VALUES (11,1321,201,'2020-12-19 22:39:31',351);
/*!40000 ALTER TABLE `audio_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audio_play_log`
--

DROP TABLE IF EXISTS `audio_play_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audio_play_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `audio_id` int(11) NOT NULL,
  `dt_played` datetime NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `audio_id_idx` (`audio_id`),
  KEY `audio_log_player_id_fk_idx` (`player_id`),
  CONSTRAINT `audio_log_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `audio_id_fk` FOREIGN KEY (`audio_id`) REFERENCES `audio` (`audio_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_play_log`
--

LOCK TABLES `audio_play_log` WRITE;
/*!40000 ALTER TABLE `audio_play_log` DISABLE KEYS */;
INSERT INTO `audio_play_log` VALUES (1,1321,'2020-12-19 22:32:20',351),(11,1321,'2020-12-19 22:47:42',351);
/*!40000 ALTER TABLE `audio_play_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(45) NOT NULL,
  `dt_created` datetime NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name_UNIQUE` (`category_name`),
  KEY `player_id_fk_idx` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'all','0000-00-00 00:00:00',0),(11,'andre','0000-00-00 00:00:00',0),(21,'aquateen','0000-00-00 00:00:00',0),(31,'arnold','0000-00-00 00:00:00',0),(41,'bayou','0000-00-00 00:00:00',0),(51,'beachfight','0000-00-00 00:00:00',0),(61,'borat','0000-00-00 00:00:00',0),(71,'chapelle','0000-00-00 00:00:00',0),(81,'jones','0000-00-00 00:00:00',0),(91,'kevpick','0000-00-00 00:00:00',0),(101,'meme','0000-00-00 00:00:00',0),(111,'music','0000-00-00 00:00:00',0),(121,'partyboys','0000-00-00 00:00:00',0),(131,'rogan','0000-00-00 00:00:00',0),(141,'seagal','0000-00-00 00:00:00',0),(151,'sunny','0000-00-00 00:00:00',0),(161,'tim&eric','0000-00-00 00:00:00',0),(171,'trailer','0000-00-00 00:00:00',0),(201,'animals','2020-12-19 22:33:14',351);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_play_log`
--

DROP TABLE IF EXISTS `category_play_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category_play_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `dt_played` datetime NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `cat_log_cat_id_fk_idx` (`category_id`),
  KEY `cat_log_player_id_fk_idx` (`player_id`),
  CONSTRAINT `cat_log_cat_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cat_log_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_play_log`
--

LOCK TABLES `category_play_log` WRITE;
/*!40000 ALTER TABLE `category_play_log` DISABLE KEYS */;
INSERT INTO `category_play_log` VALUES (1,201,'2020-12-19 22:33:19',351),(11,201,'2020-12-19 22:47:53',351);
/*!40000 ALTER TABLE `category_play_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_greetings`
--

DROP TABLE IF EXISTS `player_greetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `player_greetings` (
  `greeting_id` int(11) NOT NULL AUTO_INCREMENT,
  `greeting` varchar(100) NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`greeting_id`),
  KEY `player_id_idx` (`player_id`),
  CONSTRAINT `greeting_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player_info` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=361 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_greetings`
--

LOCK TABLES `player_greetings` WRITE;
/*!40000 ALTER TABLE `player_greetings` DISABLE KEYS */;
INSERT INTO `player_greetings` VALUES (201,'hankbust',241),(211,'trumpeee',251),(221,'dreambitch',261),(231,'douchebag',271),(241,'ineedthis',281),(251,'bagular',291),(261,'vicereversa',301),(281,'thatsaman',311),(291,'billions',231),(301,'heybabe',321),(311,'boysareback',331),(321,'triple',361),(331,'thatsaman',371),(341,'allyoudo',381),(351,'bevcheck',391);
/*!40000 ALTER TABLE `player_greetings` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=401 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_info`
--

LOCK TABLES `player_info` WRITE;
/*!40000 ALTER TABLE `player_info` DISABLE KEYS */;
INSERT INTO `player_info` VALUES (231,'***REMOVED***'),(241,'246469589049802753'),(251,'174384811316609024'),(261,'144319354014662657'),(271,'145361690328825857'),(281,'155109245073752065'),(291,'144358795475156992'),(301,'157313798464733184'),(311,'144333334309240832'),(321,'144206566801801225'),(331,'101190799005335552'),(351,'1124'),(361,'189927294968659968'),(371,'144335985373741056'),(381,'106532410291683328'),(391,'141019134409310208');
/*!40000 ALTER TABLE `player_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database '***REMOVED***'
--

--
-- Dumping routines for database '***REMOVED***'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_audio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `add_audio`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), OUT return_message VARCHAR(100))
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
    
	INSERT INTO audio (audio_name, dt_created, player_id)
	VALUES (audio_name, NOW(),  @player_id);
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `add_audio_category`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `add_category`(IN discord_id VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 DROP PROCEDURE IF EXISTS `del_audio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `del_audio`(IN audio_name VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `del_audio_category`(IN audio_name VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `del_category`(IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
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
/*!50003 DROP PROCEDURE IF EXISTS `get_audio_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `get_audio_id`(IN audio_name VARCHAR(45), OUT audio_id INT, OUT return_message VARCHAR(100))
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `get_category_id`(IN category_name VARCHAR(45), OUT category_id INT, OUT return_message VARCHAR(100))
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
/*!50003 DROP PROCEDURE IF EXISTS `get_player_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `get_player_id`(IN discord_id VARCHAR(45), OUT player_id INT, OUT return_message VARCHAR(100))
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `log_audio_play`(IN discord_id VARCHAR(45), IN audio_name VARCHAR(45), OUT return_message VARCHAR(100))
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
    
	INSERT INTO audio_play_log (audio_id, dt_played, player_id)
	VALUES (@audio_id, NOW(), @player_id);
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
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`***REMOVED***`@`%` PROCEDURE `log_category_play`(IN discord_id VARCHAR(45), IN category_name VARCHAR(45), OUT return_message VARCHAR(100))
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

-- Dump completed on 2020-12-24 16:28:43
