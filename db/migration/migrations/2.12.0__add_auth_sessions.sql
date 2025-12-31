-- Add session tables

-- Note, specifying the engine, charset, and collation is good practice, but not required.

CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NOT NULL,
    `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
    `user_agent` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user` (`user_id`),
    KEY `idx_sessions_expires_at` (`expires_at`),
    CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;