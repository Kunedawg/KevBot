"use client";

import React, { useState } from "react";
import { Track } from "../../public/tracks";

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

  const handleRowClick = (trackId: number) => {
    // Toggle selection: if clicked track is already selected, unselect it.
    setSelectedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Track List</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-secondary text-secondary">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">Title</th>
            <th className="px-2 py-2">Play Count</th>
            <th className="px-2 py-2">Duration (s)</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <tr
                key={track.id}
                aria-selected={isSelected ? "true" : "false"}
                onClick={() => handleRowClick(track.id)}
                className={`cursor-pointer ${isSelected ? "bg-track-selected" : "hover:bg-track-hover"}`}
              >
                <td className="px-2 py-2 rounded-l-lg">{index + 1}</td>
                <td className="px-2 py-2 font-medium">{track.title}</td>
                <td className="px-2 py-2">{track.playCount}</td>
                <td className="px-2 py-2 rounded-r-lg">{track.duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;

// "use client";

// import React from "react";
// import { Track } from "../../public/tracks";

// interface TrackListProps {
//   tracks: Track[];
//   selectedTrackId?: number; // Optional prop to indicate which track is selected
// }

// const TrackList: React.FC<TrackListProps> = ({ tracks, selectedTrackId }) => {
//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Track List</h2>
//       <table className="w-full text-left">
//         <thead>
//           <tr className="border-b border-gray-300">
//             <th className="px-2 py-2">#</th>
//             <th className="px-2 py-2">Title</th>
//             <th className="px-2 py-2">Play Count</th>
//             <th className="px-2 py-2">Duration (s)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tracks.map((track, index) => {
//             const isSelected = selectedTrackId === track.id;
//             return (
//               <tr
//                 key={track.id}
//                 aria-selected={isSelected ? "true" : "false"}
//                 className={`border-b border-gray-200 hover:bg-track-hover ${isSelected ? "bg-track-selected" : ""}`}
//               >
//                 <td className="px-2 py-2">{index + 1}</td>
//                 <td className="px-2 py-2 font-medium">{track.title}</td>
//                 <td className="px-2 py-2">{track.playCount}</td>
//                 <td className="px-2 py-2">{track.duration}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TrackList;

//----------

// "use client";

// // components/TrackList.tsx
// import React from "react";
// import { Track } from "../../public/tracks";

// interface TrackListProps {
//   tracks: Track[];
// }

// const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
//   return (
//     <div className="track-list">
//       <h2>Track List</h2>
//       <ul>
//         {tracks.map((track) => (
//           <li key={track.id} className="track-item">
//             <div>
//               <strong>{track.title}</strong> by {track.artist}
//             </div>
//             <div>
//               <span>{track.album}</span> - <span>{track.duration}</span>
//             </div>
//           </li>
//         ))}
//       </ul>
//       <style jsx>{`
//         .track-list {
//           padding: 1rem;
//         }
//         .track-item {
//           margin-bottom: 1rem;
//           padding: 0.5rem;
//           border-bottom: 1px solid #ccc;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TrackList;
