// data/tracks.ts

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
}

const tracks: Track[] = [
  {
    id: 1,
    title: "Song A",
    artist: "Artist 1",
    album: "Album X",
    duration: "3:45",
  },
  {
    id: 2,
    title: "Song B",
    artist: "Artist 2",
    album: "Album Y",
    duration: "4:20",
  },
  {
    id: 3,
    title: "Song C",
    artist: "Artist 3",
    album: "Album Z",
    duration: "2:50",
  },
];

export default tracks;
