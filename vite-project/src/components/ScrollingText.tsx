import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScrollingTextProps {
  width: number;
  text: string;
  beatId?: number | null;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ width, text, beatId }) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const navigate = useNavigate();

  // This factor can be adjusted to control animation speed (higher value = slower animation)
  const speedFactor = 3;

  useEffect(() => {
    // An approximation for average character width to determine if text overflows
    const avgCharWidth = 8;
    const textWidth = text.length * avgCharWidth;
    setShouldScroll(textWidth > width);
  }, [text, width]);

  const handleClick = () => {
    if (beatId) {
      navigate(`/beat/${beatId}`);
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
          animation: shouldScroll ? `scroll-text ${text.length / 4 * speedFactor}s linear infinite` : 'none',
        }}
      >
        {text}
        {shouldScroll && <span style={{ paddingLeft: '2rem' }}>{text}</span>}
      </div>
      {beatId && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent group-hover:bg-white transition-all duration-300" style={{ marginTop: '2px' }}></div>}
    </div>
  );
};

export default ScrollingText;