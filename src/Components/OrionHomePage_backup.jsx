import { useState, useEffect, useRef } from 'react';
import '/src/styles/style1.css';

function OrionHomePage() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [allLinesConnected, setAllLinesConnected] = useState(false);
  const [showServicesCard, setShowServicesCard] = useState(false);
  const [showAboutCard, setShowAboutCard] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // State for sidebar visibility
  const starContainerRef = useRef(null);
  const lineRefs = useRef([]);
  const servicesCardRef = useRef(null);

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
    [4, 5], // s5 to s6
    [5, 6], // s6 to s7
    [6, 7], // s7 to s8
  ];

  // Generate background stars
  useEffect(() => {
    const starContainer = starContainerRef.current;
    if (!starContainer) return;

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
    if (!starContainerRef.current) {
      return connections.map(() => ({
        className: '',
        maxWidth: '0px',
        top: '0px',
        left: '0px',
        transform: 'rotate(0deg)',
      }));
    }

    return connections.map(([startIdx, endIdx]) => {
      const startStar = stars[startIdx];
      const endStar = stars[endIdx];
      const startX = (parseFloat(startStar.left) / 100) * window.innerWidth;
      const startY = (parseFloat(startStar.top) / 100) * window.innerHeight;
      const endX = (parseFloat(endStar.left) / 100) * window.innerWidth;
      const endY = (parseFloat(endStar.top) / 100) * window.innerHeight;

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return {
        className: `line${startIdx + 1}${endIdx + 1}`,
        maxWidth: `${distance}px`,
        top: `${startY}px`,
        left: `${startX}px`,
        transform: `rotate(${angle}deg)`,
      };
    });
  };

  // Handle scroll for line animations and card transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollThreshold = documentHeight - windowHeight;

      setHasScrolled(scrollY > 0);

      // Calculate progress for lines
      let totalProgress = scrollY / (scrollThreshold * 0.5); // Draw lines in first half of scroll
      if (totalProgress > 1) totalProgress = 1;

      const linesToShow = Math.min(Math.floor(totalProgress * connections.length) + 1, connections.length);
      setAllLinesConnected(totalProgress >= 1);

      const lineProps = calculateLineProps();
      lineProps.forEach((line, index) => {
        const lineElement = lineRefs.current[index];
        if (!lineElement) return;

        if (index < linesToShow) {
          const lineProgress = Math.min((totalProgress - index / connections.length) * connections.length, 1);
          const currentWidth = parseFloat(line.maxWidth) * lineProgress;
          lineElement.style.width = `${currentWidth}px`;
        } else {
          lineElement.style.width = '0px';
        }
      });

      // Show/hide services card based on scroll position
      if (totalProgress >= 1) {
        setShowServicesCard(true);
        // Reset services card scroll to top when it appears
        if (servicesCardRef.current) {
          servicesCardRef.current.scrollTop = 0;
        }
      } else {
        setShowServicesCard(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Update lines on resize
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Handle services card scroll for about card visibility
  useEffect(() => {
    const handleServicesScroll = () => {
      if (servicesCardRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = servicesCardRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setShowAboutCard(true);
          setShowServicesCard(false); // Hide services card when about card appears
        }
      }
    };

    const card = servicesCardRef.current;
    if (card && showServicesCard) {
      card.addEventListener('scroll', handleServicesScroll);
      return () => card.removeEventListener('scroll', handleServicesScroll);
    }
  }, [showServicesCard]);

  // Close about card and reset
  const closeAboutCard = () => {
    setShowAboutCard(false);
    setShowServicesCard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Navbar navigation handlers (placeholders)
  const handleNavigation = (page) => {
    console.log(`Navigating to ${page}`);
    setShowSidebar(false); // Close sidebar on navigation
    // Replace with actual navigation logic (e.g., React Router)
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="nav-bar">
        <div className="nav-left">
          <button
            className="nav-button menu-button"
            onClick={toggleSidebar}
            title="Menu"
          >
            <span><i className="fas fa-bars"></i></span>
          </button>
          <button
            className="nav-button home-button"
            onClick={() => handleNavigation('Home')}
          >
            <span><i className="fas fa-house"></i></span>
            <span className="nav-text">Home</span>
          </button>
        </div>
        <div className="nav-right-container">
          <div className="nav-right">
            <button
              className="nav-button services-button"
              onClick={() => handleNavigation('Services')}
              title="Services"
            >
              <span><i className="fas fa-rocket"></i></span>
              <span className="nav-text">Services</span>
            </button>
            <button
              className="nav-button about-button"
              onClick={() => handleNavigation('About Us')}
              title="About Us"
            >
              <span><i className="fas fa-users"></i></span>
              <span className="nav-text">About Us</span>
            </button>
            <button
              className="nav-button blog-button"
              onClick={() => handleNavigation('Blog')}
              title="Blog"
            >
              <span><i className="fa-brands fa-rocketchat"></i></span>
              <span className="nav-text">Blog</span>
            </button>
            <button
              className="nav-button contact-button"
              onClick={() => handleNavigation('Contact Us')}
              title="Contact Us"
            >
              <span><i className="fas fa-phone"></i></span>
              <span className="nav-text">Contact Us</span>
            </button>
          </div>
          <div className="search-tips-container">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'active' : ''}`}>
        <button
          className="sidebar-close-button"
          onClick={toggleSidebar}
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="sidebar-buttons">
          <button
            className="nav-button services-button"
            onClick={() => handleNavigation('Services')}
            title="Services"
          >
            <span><i className="fas fa-rocket"></i></span>
            <span className="nav-text">Services</span>
          </button>
          <button
            className="nav-button about-button"
            onClick={() => handleNavigation('About Us')}
            title="About Us"
          >
            <span><i className="fas fa-users"></i></span>
            <span className="nav-text">About Us</span>
          </button>
          <button
            className="nav-button blog-button"
            onClick={() => handleNavigation('Blog')}
            title="Blog"
          >
            <span><i className="fa-brands fa-rocketchat"></i></span>
            <span className="nav-text">Blog</span>
          </button>
          <button
            className="nav-button contact-button"
            onClick={() => handleNavigation('Contact Us')}
            title="Contact Us"
          >
            <span><i className="fas fa-phone"></i></span>
            <span className="nav-text">Contact Us</span>
          </button>
        </div>
      </div>

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
                width: '0px', // Initial width
              }}
            />
          ))}
        </div>
      </section>
      <div className={`services-card ${showServicesCard ? 'active' : ''}`} ref={servicesCardRef}>
        <div className="card-content">
          <h2>Our Services</h2>
          <div className="service-section web-design">
            <h3><i className="fas fa-globe"></i> Web Design & Development</h3>
            <div className="service-content">
              <div className="text-content">
                <p>Launch your brand into orbit with sleek, responsive websites tailored to your mission.</p>
                <ul className="service-list my-8">
                  <li><i className="fas fa-rocket"></i> Landing Pages that convert visitors into leads.</li>
                  <li><i className="fas fa-briefcase"></i> Business Portfolio Websites that showcase your services with elegance and clarity.</li>
                  <li><i className="fas fa-code"></i> Built with cutting-edge tools, designed with purpose.</li>
                </ul>
              </div>
              <img src="/coding.jpg" alt="Web Design" className="service-image" />
            </div>
          </div>
          <div className="service-section seo">
            <h3><i className="fas fa-search"></i> SEO (Search Engine Optimization)</h3>
            <div className="service-content">
              <img src="/seo.jpg" alt="SEO" className="service-image" />
              <div className="text-content">
                <p>Be found where it matters — on top. Our SEO services help you:</p>
                <ul className="service-list my-8">
                  <li><i className="fas fa-chart-line"></i> Improve Search Rankings with proven strategies.</li>
                  <li><i className="fas fa-check-circle"></i> Ensure Indexing so your pages light up Google.</li>
                  <li><i className="fas fa-user-astronaut"></i> Get Expert Consultation to build a long-term traffic plan.</li>
                </ul>
                <p>Because what’s the point of a great site if no one finds it?</p>
              </div>
            </div>
          </div>
          <div className="service-section smm">
            <h3><i className="fas fa-mobile-alt"></i> Social Media Marketing (SMM)</h3>
            <div className="service-content">
              <div className="text-content">
                <p>Grow your audience, boost engagement, and convert like a boss!</p>
                <ul className="service-list my-8">
                  <li><i className="fas fa-bullhorn"></i> Lead Generation Campaigns tailored to your target audience.</li>
                  <li><i className="fas fa-paint-brush"></i> Graphic Design for scroll-stopping posts and ads.</li>
                  <li><i className="fas fa-calendar-alt"></i> Content Scheduling across platforms (Instagram, Facebook, LinkedIn).</li>
                </ul>
                <p>Let your brand speak loud and clear on every feed.</p>
              </div>
              <img src="/smm.jpg" alt="SMM" className="service-image" />
            </div>
          </div>
        </div>
      </div>
      <div className={`about-card ${showAboutCard ? 'active' : ''}`}>
        <div className="card-content">
          <h2>About Us</h2>
          <p>At OrionSpark, we’re not just building websites — we’re building our dream, one line of code at a time.</p>
          <p>We're a crew of self-taught creators with a shared love for design, tech, and helping ideas come to life online.</p>
          <h3>What we believe in:</h3>
          <ul className="service-list my-4">
            <li><i className="fas fa-star"></i> Clear, thoughtful design</li>
            <li><i className="fas fa-bullseye"></i> Purpose-driven strategy</li>
            <li><i className="fas fa-bolt"></i> Learning fast, delivering faster</li>
          </ul>
          <p>Whether it’s your first website or your next campaign, we bring our full attention, fresh ideas, and collaborative mindset to the table.</p>
          <p>Because at the end of the day, your success is what sparks ours.</p><br />
          <h5>Orion Spark - Transforming your digital constellation.</h5>
          <button className="close-button" onClick={closeAboutCard}>X</button>
        </div>
      </div>
      <div style={{ height: '200vh' }} /> {/* Scroll space */}
    </div>
  );
}

export default OrionHomePage;