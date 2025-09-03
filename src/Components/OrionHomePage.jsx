import { useState, useEffect, useRef } from 'react';
import '/src/styles/style1.css';

// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function OrionHomePage() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [allLinesConnected, setAllLinesConnected] = useState(false);
  const [showServicesCard, setShowServicesCard] = useState(false);
  const [showAboutCard, setShowAboutCard] = useState(false);
  const [showContactCard, setShowContactCard] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState('');
  const starContainerRef = useRef(null);
  const lineRefs = useRef([]);
  const servicesCardRef = useRef(null);
  const sparkRef = useRef(null);
  const orionContainerRef = useRef(null);

  // Star positions using percentages for responsiveness within container
  const stars = [
    { className: 's1', top: '92%', left: '45%', animationDelay: `${Math.random() * 2}s` },
    { className: 's2', top: '70%', left: '46%', animationDelay: `${Math.random() * 2}s` },
    { className: 's3', top: '56%', left: '35%', animationDelay: `${Math.random() * 2}s` },
    { className: 's4', top: '37%', left: '25%', animationDelay: `${Math.random() * 2}s` },
    { className: 's5', top: '15%', left: '35%', animationDelay: `${Math.random() * 2}s` },
    { className: 's6', top: '37%', left: '49%', animationDelay: `${Math.random() * 2}s` },
    { className: 's7', top: '60%', left: '52%', animationDelay: `${Math.random() * 2}s` },
    { className: 's8', top: '77.6%', left: '61.8%', animationDelay: `${Math.random() * 2}s` },
  ];

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

    const numStars = 50; // Reduced for performance
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

  // Calculate star size based on screen width
  const getStarSize = () => {
    if (window.innerWidth <= 480) return 2; // Mobile
    if (window.innerWidth <= 768) return 1.5; // Tablet
    return 1; // Desktop
  };

  // Calculate line properties
  const calculateLineProps = () => {
    if (!orionContainerRef.current) {
      return connections.map(() => ({
        className: '',
        maxWidth: '0px',
        top: '0px',
        left: '0px',
        transform: 'rotate(0deg)',
        height: '0.2vw',
      }));
    }

    const container = orionContainerRef.current.getBoundingClientRect();
    const containerWidth = container.width;
    const containerHeight = container.height;
    const starSize = getStarSize() * (window.innerWidth / 100); // Convert vw to pixels
    const lineHeight = window.innerWidth <= 480 ? 0.4 : window.innerWidth <= 768 ? 0.3 : 0.2; // in vw

    return connections.map(([startIdx, endIdx]) => {
      const startStar = stars[startIdx];
      const endStar = stars[endIdx];
      const startX = (parseFloat(startStar.left) / 100) * containerWidth;
      const startY = (parseFloat(startStar.top) / 100) * containerHeight;
      const endX = (parseFloat(endStar.left) / 100) * containerWidth;
      const endY = (parseFloat(endStar.top) / 100) * containerHeight;

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const adjustedDistance = distance; // Full distance between star centers
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return {
        className: `line${startIdx + 1}${endIdx + 1}`,
        maxWidth: `${adjustedDistance}px`,
        top: `${startY + starSize / 2}px`, // Relative to container
        left: `${startX + starSize / 2}px`, // Relative to container
        transform: `rotate(${angle}deg)`,
        height: `${lineHeight}vw`,
      };
    });
  };

  // Handle scroll for line animations and card transitions
  useEffect(() => {
    const lineStates = connections.map(() => ({ reached: false }));
    let lastScrollTop = 0;

    const handleScroll = debounce(() => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollThreshold = documentHeight - windowHeight * (window.innerWidth <= 480 ? 1.0 : window.innerWidth <= 768 ? 0.5 : 0.6);

      setHasScrolled(scrollY > 0);

      // Calculate progress for lines
      let totalProgress = scrollY / (scrollThreshold * 0.5);
      if (totalProgress > 1) totalProgress = 1;

      const linesToShow = Math.min(Math.floor(totalProgress * connections.length) + 1, connections.length);
      setAllLinesConnected(totalProgress >= 1);

      const lineProps = calculateLineProps();
      lineProps.forEach((line, index) => {
        const lineElement = lineRefs.current[index];
        if (!lineElement) return;

        lineElement.style.top = line.top;
        lineElement.style.left = line.left;
        lineElement.style.transform = line.transform;
        lineElement.style.height = line.height;

        if (index < linesToShow) {
          const lineProgress = Math.min((totalProgress - index / connections.length) * connections.length, 1);
          const currentWidth = parseFloat(line.maxWidth) * lineProgress;
          lineElement.style.width = `${currentWidth}px`;
          if (currentWidth >= parseFloat(line.maxWidth) && !lineStates[index].reached) {
            lineStates[index].reached = true;
            const endStarIdx = connections[index][1];
            const starElement = document.querySelector(`.star.${stars[endStarIdx].className}`);
            if (starElement) {
              starElement.classList.add('pop');
              setTimeout(() => starElement.classList.remove('pop'), 1000);
            }
          }
        } else {
          lineElement.style.width = '0px';
          lineStates[index].reached = false;
        }
      });

      // Spark animation
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const maxSize = window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 15 : 10; // in vw
      const newSize = progress * maxSize;
      const spark = sparkRef.current;
      if (spark) {
        spark.style.width = `${newSize}vw`;
        spark.style.height = `${newSize}vw`;
        spark.style.opacity = progress;
        let glowIntensity = progress < 0.8 ? progress * 50 : 40 - (progress - 0.8) * 30;
        glowIntensity = Math.max(glowIntensity, 8);
        spark.style.filter = `drop-shadow(0 0 ${glowIntensity * 0.5}px rgba(0, 191, 255, 0.6)) drop-shadow(0 0 ${glowIntensity}px rgba(0, 191, 255, 0.4)) drop-shadow(0 0 ${glowIntensity * 1.5}px rgba(0, 191, 255, 0.2))`;
        if (scrollY < lastScrollTop && scrollY === 0) {
          spark.style.width = '0vw';
          spark.style.height = '0vw';
          spark.style.opacity = '0';
          spark.style.filter = 'drop-shadow(0 0 0px rgba(0, 191, 255, 0))';
        }
      }

      // Show/hide services and about cards, respect contact card
      if (!showContactCard) {
        if (totalProgress >= 1 && !showAboutCard) {
          setShowServicesCard(true);
          if (servicesCardRef.current) {
            servicesCardRef.current.scrollTop = 0;
          }
        } else {
          setShowServicesCard(false);
        }

        if (totalProgress < 1 && showAboutCard) {
          setShowAboutCard(false);
          setShowServicesCard(true); // Re-show services card if still in threshold
        }
      }

      lastScrollTop = scrollY;
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showAboutCard, showContactCard]);

  // Handle services card scroll for about card
  useEffect(() => {
    const handleServicesScroll = () => {
      if (servicesCardRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = servicesCardRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setShowAboutCard(true);
          setShowServicesCard(false);
        }
      }
    };

    const card = servicesCardRef.current;
    if (card && showServicesCard) {
      card.addEventListener('scroll', handleServicesScroll);
      return () => card.removeEventListener('scroll', handleServicesScroll);
    }
  }, [showServicesCard]);

  // Validate form inputs
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (!/^[A-Za-z\s'-]+$/.test(value)) return 'Name must contain only letters, spaces, hyphens, or apostrophes';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^\+\d{1,3}\s?\d{6,14}$/.test(value)) return 'Phone number must start with a country code (e.g., +91) followed by 6-14 digits';
        return '';
      case 'message':
        if (!value) return 'Message is required';
        return '';
      default:
        return '';
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      message: validateField('message', formData.message),
    };
    setFormErrors(errors);

    if (Object.values(errors).every((error) => !error)) {
      try {
        const response = await fetch('https://formspree.io/f/mjkoldwe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setFormStatus('Form submitted successfully!');
          setShowContactCard(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
          setFormErrors({ name: '', email: '', phone: '', message: '' });
        } else {
          setFormStatus('Error submitting form. Please try again.');
        }
      } catch (error) {
        setFormStatus('Error submitting form. Please try again.');
      }
    }
  };

  // Close contact card
  const closeContactCard = () => {
    setShowContactCard(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setFormErrors({ name: '', email: '', phone: '', message: '' });
    setFormStatus('');
  };

  // Close services card
  const closeServicesCard = () => {
    setShowServicesCard(false);
  };

  // Close about card
  const closeAboutCard = () => {
    setShowAboutCard(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Navigation handler
  const handleNavigation = (page) => {
    console.log(`Navigating to ${page}`);
    setShowSidebar(false);
    if (page === 'Services') {
      setShowServicesCard(true);
      setShowAboutCard(false);
      setShowContactCard(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'About Us') {
      setShowAboutCard(true);
      setShowServicesCard(false);
      setShowContactCard(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'Contact Us') {
      setShowContactCard(true);
      setShowServicesCard(false);
      setShowAboutCard(false);
    } else if (page === 'Blog') {
      setShowServicesCard(false);
      setShowAboutCard(false);
      setShowContactCard(false);
    }
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="nav-bar">
        <div className="nav-left">
          <button
            className="nav-button menu-button"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
            title="Menu"
          >
            <span><i className="fas fa-bars"></i></span>
          </button>
          <button
            className="nav-button home-button"
            onClick={() => handleNavigation('Home')}
            aria-label="Home"
          >
            <span><i className="fas fa-house"></i></span>
            <span className="nav-text">Home</span>
          </button>
        </div>
        <div className="nav-right-group">
          <div className="nav-right-container">
            <div className="nav-right">
              <button
                className="nav-button services-button"
                onClick={() => handleNavigation('Services')}
                aria-label="Services"
                title="Services"
              >
                <span><i className="fas fa-rocket"></i></span>
                <span className="nav-text">Services</span>
              </button>
              <button
                className="nav-button about-button"
                onClick={() => handleNavigation('About Us')}
                aria-label="About Us"
                title="About Us"
              >
                <span><i className="fas fa-users"></i></span>
                <span className="nav-text">About Us</span>
              </button>
              <button
                className="nav-button blog-button"
                onClick={() => handleNavigation('Blog')}
                aria-label="Blog"
                title="Blog"
              >
                <span><i className="fa-brands fa-rocketchat"></i></span>
                <span className="nav-text">Blog</span>
              </button>
              <button
                className="nav-button contact-button"
                onClick={() => handleNavigation('Contact Us')}
                aria-label="Contact Us"
                title="Contact Us"
              >
                <span><i className="fas fa-phone"></i></span>
                <span className="nav-text">Contact Us</span>
              </button>
            </div>
          </div>
          <div className="search-tips-container">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              aria-label="Search"
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
          aria-label="Close Sidebar"
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="sidebar-buttons">
          <button
            className="nav-button services-button"
            onClick={() => handleNavigation('Services')}
            aria-label="Services"
            title="Services"
          >
            <span><i className="fas fa-rocket"></i></span>
            <span className="nav-text">Services</span>
          </button>
          <button
            className="nav-button about-button"
            onClick={() => handleNavigation('About Us')}
            aria-label="About Us"
            title="About Us"
          >
            <span><i className="fas fa-users"></i></span>
            <span className="nav-text">About Us</span>
          </button>
          <button
            className="nav-button blog-button"
            onClick={() => handleNavigation('Blog')}
            aria-label="Blog"
            title="Blog"
          >
            <span><i className="fa-brands fa-rocketchat"></i></span>
            <span className="nav-text">Blog</span>
          </button>
          <button
            className="nav-button contact-button"
            onClick={() => handleNavigation('Contact Us')}
            aria-label="Contact Us"
            title="Contact Us"
          >
            <span><i className="fas fa-phone"></i></span>
            <span className="nav-text">Contact Us</span>
          </button>
        </div>
      </div>

      <div className="background-stars" ref={starContainerRef}></div>
      <section className="hero-section">
        <div className="orion-constellation" ref={orionContainerRef}>
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
                width: `${getStarSize()}vw`,
                height: `${getStarSize()}vw`,
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
                height: line.height,
                width: '0px', // Initial width
              }}
            />
          ))}
          <div
            className="spark-container"
            style={{
              top: stars[7].top, // Tie to s8 position
              left: stars[7].left,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          >
            <img
              ref={sparkRef}
              src="/spark.png"
              alt="Spark effect"
              className="spark"
              style={{
                width: '0vw',
                height: '0vw',
                opacity: 0,
                transition: 'width 0.7s ease, height 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
              }}
            />
          </div>
        </div>
      </section>
      <div className={`services-card ${showServicesCard ? 'active' : ''}`} ref={servicesCardRef}>
        <button
          className="card-close-button"
          onClick={closeServicesCard}
          aria-label="Close Services Card"
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
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
              <img src="/coding.jpg" alt="Web Design and Development" className="service-image" />
            </div>
          </div>
          <div className="service-section seo">
            <h3><i className="fas fa-search"></i> SEO (Search Engine Optimization)</h3>
            <div className="service-content">
              <img src="/seo.jpg" alt="Search Engine Optimization" className="service-image" />
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
              <img src="/smm.jpg" alt="Social Media Marketing" className="service-image" />
            </div>
          </div>
        </div>
      </div>
      <div className={`about-card ${showAboutCard ? 'active' : ''}`}>
        <button
          className="card-close-button"
          onClick={closeAboutCard}
          aria-label="Close About Card"
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
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
        </div>
      </div>
      <div className={`contact-card ${showContactCard ? 'active' : ''}`}>
        <button
          className="card-close-button"
          onClick={closeContactCard}
          aria-label="Close Contact Card"
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="card-content">
          <h2>Contact Us</h2>
          <p>We're here to help you launch your digital presence. Fill out the form below, and we'll get back to you soon!</p>
          <form action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST" onSubmit={handleContactSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Your Name"
                aria-label="Name"
                className="form-input"
              />
              {formErrors.name && <span className="form-error">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Your Email"
                aria-label="Email"
                className="form-input"
              />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+91 1234567890"
                aria-label="Phone Number"
                className="form-input"
              />
              {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Your Enquiry or Request"
                aria-label="Message"
                className="form-textarea"
              ></textarea>
              {formErrors.message && <span className="form-error">{formErrors.message}</span>}
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Submit</button>
              <button type="button" onClick={closeContactCard} className="close-button" aria-label="Close Contact Card">Close</button>
            </div>
            {formStatus && <p className="form-status">{formStatus}</p>}
          </form>
        </div>
      </div>
      <div style={{ height: '200vh' }} />
    </div>
  );
}

export default OrionHomePage;