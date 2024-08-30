/*
 * Script:      : 2.0.0_change.sql
 * Description  : Adds tables for tracking database version and change_log.
 */

-- Create table to track overall database version
CREATE TABLE IF NOT EXISTS db_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table to log each change script application
CREATE TABLE IF NOT EXISTS change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    script_name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update the db_version table
INSERT INTO db_version (version) VALUES ('2.0.0');

-- Log this change script application
INSERT INTO change_log (script_name) VALUES ('2.0.0_change.sql');
