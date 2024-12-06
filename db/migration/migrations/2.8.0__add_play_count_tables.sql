/*
 * Script:      : 2.8.0_add_play_count_tables.sql
 * Description  : Creates new tables for tracking play counts
 */

CREATE TABLE IF NOT EXISTS track_play_counts (
  track_id INT PRIMARY KEY,
  raw_total_play_count INT NOT NULL DEFAULT 0,
  total_play_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_track_play_counts_tracks_id FOREIGN KEY (track_id) REFERENCES tracks (id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS track_play_type_counts (
  track_id INT NOT NULL,
  play_type INT NOT NULL,
  play_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (track_id, play_type),
  CONSTRAINT fk_track_play_type_counts_tracks_id FOREIGN KEY (track_id) REFERENCES tracks (id) ON UPDATE CASCADE
);

-- Update the version and change_log tables
INSERT INTO db_version (version) VALUES ('2.8.0');
INSERT INTO change_log (script_name) VALUES ('2.8.0_add_play_count_tables.sql');