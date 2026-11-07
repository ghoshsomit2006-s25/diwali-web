import React from 'react';

/**
 * Permanent YouTube IFrame Player mount container.
 * CRITICAL: Must remain mounted in the DOM and never use display:none
 * so that browsers continue playing audio in the background while the user
 * explores the rest of the application.
 */
export const MiniPlayer: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none select-none z-[-1] opacity-0 overflow-hidden"
      style={{
        width: '2px',
        height: '2px',
        top: '-100px',
        left: '-100px',
      }}
    >
      <div id="youtube-audio-player-host" />
    </div>
  );
};
