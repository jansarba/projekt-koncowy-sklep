import { useEffect } from "react";
import { ItemHandler } from "./ItemHandler";
import silence from "../bruh/silence.mp3"; // Adjust path as needed

export const ItemsPresenter = () => {
  useEffect(() => {
    const audio = new Audio(silence);
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });

    return () => {
      audio.pause(); // Pause the audio when the component unmounts
      audio.currentTime = 0; // Reset to the beginning
    };
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      <div className="flex-grow">
        <ItemHandler />
      </div>
    </div>
  );
};