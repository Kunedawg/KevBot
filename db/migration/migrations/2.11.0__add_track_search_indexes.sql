-- Adds supporting indexes for track search and suggestion features.

ALTER TABLE `tracks`
  ADD INDEX `idx_tracks_name` (`name`);

ALTER TABLE `tracks`
  ADD FULLTEXT INDEX `ftx_tracks_name` (`name`);
