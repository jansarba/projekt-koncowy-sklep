import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScrollingTextProps {
  width: number; // Width of the container in pixels
  text: string;  // Text to display
  beatId?: number | null; // Optional ID of the beat for navigation
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ width, text, beatId }) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const navigate = useNavigate();

  // Adjust this factor to control animation speed (higher = slower)
  const speedFactor = 3;

  useEffect(() => {
    // Average width of a single character in pixels (adjust if needed)
    const avgCharWidth = 8; // Approximation based on font size and style
    const textWidth = text.length * avgCharWidth;
    console.log(textWidth, width);

    // Determine if scrolling is needed
    setShouldScroll(textWidth > width);
  }, [text, width]);

  const handleClick = () => {
    if (beatId) {
      navigate(`/beat/${beatId}`); // Navigate to the beat's page if beatId exists
    }
  };

  return (
    <div
      style={{
        width: `${width}px`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        cursor: beatId ? 'pointer' : 'default',
      }}
      onClick={beatId ? handleClick : undefined}
      className="group"
    >
      <div
        ref={textRef}
        className={shouldScroll ? 'scrolling-text' : ''}
        style={{
          display: 'inline-block',
          paddingLeft: shouldScroll ? `${width}px` : '0',
          animation: shouldScroll
            ? `scroll-text ${text.length / 4 * speedFactor}s linear infinite`
            : 'none',
        }}
      >
        {text}
        {shouldScroll && <span style={{ paddingLeft: '2rem' }}>{text}</span>}
      </div>
      {beatId && (
        <div
          className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent group-hover:bg-white transition-all duration-300"
          style={{ marginTop: '2px' }}
        ></div>
      )}
    </div>
  );
};

export default ScrollingText;