"use client";

import React from "react";
import TrackList from "../../components/TrackList";
import tracks from "../../../public/tracks";

const Concept1Page: React.FC = () => {
  return (
    <div>
      <TrackList tracks={tracks} />
    </div>
  );
};

export default Concept1Page;
