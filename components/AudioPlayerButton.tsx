
import React from 'react';

interface AudioPlayerButtonProps {
  audioUrl: string;
  label: string;
}

const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({ audioUrl, label }) => {
  const play = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  return (
    <button
      onClick={play}
      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition duration-200 text-xs font-medium flex items-center"
      aria-label={`Listen to pronunciation for ${label}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 6.343a1 1 0 010 1.414L13.243 9.414a3 3 0 000 4.243l1.414 1.414a1 1 0 010 1.414 1 1 0 01-1.414 0l-1.414-1.414a5 5 0 010-7.07l1.414-1.414a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {label}
    </button>
  );
};

export default AudioPlayerButton;
