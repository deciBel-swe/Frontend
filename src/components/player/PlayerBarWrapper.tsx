"use client";

import { useState } from "react";
import PlayerBar from "./PlayerBar";

export default function PlayerBarWrapper() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [queueVisible, setQueueVisible] = useState(false);

  return (
    <PlayerBar
      track="Faded away faded away faded away"
      artist="Alan Walker Mohamed Osman Hamada Aly"
      artwork="/images/default_song_image.png"
      duration={180}
      currentTime={currentTime}
      isPlaying={isPlaying}
      
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onNext={() => console.log("Next track")}
      onPrev={() => console.log("Previous track")}
      onScrub={(t) => setCurrentTime(t)}

      volume={volume}
      onVolumeChange={setVolume}
      
      queue={{
        visible: queueVisible,
        items: [
          { title: "Faded", artist: "Alan Walker" },
          { title: "Spectre", artist: "Alan Walker" }
        ]
      }}
      onQueueToggle={() => setQueueVisible(!queueVisible)}
    />
  );
}