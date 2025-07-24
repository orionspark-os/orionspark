import { useState, useEffect, useRef } from 'react';
import '/src/styles/style1.css';

function OrionHomePage() {
  const [popup, setPopup] = useState({ visible: false, message: '' });
  const starContainerRef = useRef(null);
  const lineRefs = useRef([]);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Star positions using vw/vh for responsiveness
  const stars = [
    { className: 's1', top: '92vh', left: '45vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's2', top: '70vh', left: '46vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's3', top: '56vh', left: '35vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's4', top: '37vh', left: '25vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's5', top: '15vh', left: '35vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's6', top: '37vh', left: '49vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's7', top: '60vh', left: '52vw', animationDelay: `${Math.random() * 2}s` },
    { className: 's8', top: '77.6vh', left: '61.8vw', animationDelay: `${Math.random() * 2}s` },
  ];

  // Define connections between stars (indices of stars to connect)
  const connections = [
    [0, 1], // s1 to s2
    [1, 2], // s2 to s3
    [2, 3], // s3 to s4
    [3, 4], // s4 to s5
    [4, 5], // s4 to s6
    [5, 6], // s6 to s7
    [6, 7], // s7 to s8
  ];

  // Generate background stars
  useEffect(() => {
    const starContainer = starContainerRef.current;
    const numStars = 100;

    starContainer.innerHTML = '';

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'bg-star';
      const size = Math.random() * 0.3 + 0.1;
      star.style.width = `${size}vw`;
      star.style.height = `${size}vw`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      starContainer.appendChild(star);
    }
  }, []);

  // Calculate line properties based on star positions
  const calculateLineProps = () => {
    return connections.map(([startIdx, endIdx]) => {
      const startStar = stars[startIdx];
      const endStar = stars[endIdx];
      const startX = parseFloat(startStar.left) / 100 * window.innerWidth;
      const startY = parseFloat(startStar.top) / 100 * window.innerHeight;
      const endX = parseFloat(endStar.left) / 100 * window.innerWidth;
      const endY = parseFloat(endStar.top) / 100 * window.innerHeight;

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy); // Pythagorean theorem
      const angle = Math.atan2(dy, dx) * 180 / Math.PI; // Angle in degrees

      return {
        className: `line${startIdx + 1}${endIdx + 1}`,
        maxWidth: `${distance}px`, // Use pixel distance for accuracy
        top: `${startY}px`,
        left: `${startX}px`,
        transform: `rotate(${angle}deg)`,
      };
    });
  };

  // Scroll handler for line animations
  useEffect(() => {
    const scrollThreshold = document.documentElement.scrollHeight - window.innerHeight;
    const lineStates = connections.map(() => ({ reached: false }));

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasScrolled(scrollY > 0);

      let totalProgress = scrollY / scrollThreshold;
      if (totalProgress > 1) totalProgress = 1;

      const linesToShow = Math.min(Math.floor(totalProgress * connections.length) + 1, connections.length);

      const lineProps = calculateLineProps();
      lineProps.forEach((line, index) => {
        const lineElement = lineRefs.current[index];
        if (!lineElement) return;

        if (index < linesToShow) {
          const lineProgress = Math.min((totalProgress - index / connections.length) * connections.length, 1);
          const currentWidth = parseFloat(line.maxWidth) * lineProgress;
          lineElement.style.width = `${currentWidth}px`;
          if (currentWidth >= parseFloat(line.maxWidth) && !lineStates[index].reached) {
            lineStates[index].reached = true;
            setPopup({ visible: true, message: `Line ${index + 1} reached max` });
          }
        } else {
          lineElement.style.width = '0px';
          lineStates[index].reached = false;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Popup close handler
  const closePopup = () => {
    setPopup({ visible: false, message: '' });
  };

  return (
    <div className="container">
      <div className="background-stars" ref={starContainerRef}></div>
      <section className="hero-section">
        <div className="orion-constellation">
          {stars.map((star, index) => (
            <div
              key={`star-${index}`}
              className={`star ${star.className}`}
              style={{
                top: star.top,
                left: star.left,
                animation: hasScrolled ? 'none' : `twinkle 2s infinite alternate`,
                animationDelay: star.animationDelay,
                opacity: hasScrolled ? 1 : 0.7,
                width: '1vw',
                height: '1vw',
              }}
            />
          ))}
          {calculateLineProps().map((line, index) => (
            <div
              key={`line-${index}`}
              className={`line ${line.className}`}
              ref={(el) => (lineRefs.current[index] = el)}
              style={{
                top: line.top,
                left: line.left,
                transform: line.transform,
              }}
            />
          ))}
        </div>
      </section>
      <div
        className={`popup ${popup.visible ? 'active' : ''}`}
        role="dialog"
        aria-labelledby="popup-message"
      >
        <p id="popup-message">{popup.message}</p>
        <button onClick={closePopup} aria-label="Close popup">Close</button>
      </div>
    </div>
  );
}

export default OrionHomePage;