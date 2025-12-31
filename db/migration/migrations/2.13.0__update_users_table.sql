-- Update users table. Remove username and password hash columns. Add discord_avatar_hash column. Make discord_id not nullable.

ALTER TABLE `users`
    MODIFY COLUMN `discord_id` varchar(20) NOT NULL, 
    ADD `discord_avatar_hash` varchar(255) NULL,
    DROP COLUMN `username`,
    DROP COLUMN `password_hash`;
