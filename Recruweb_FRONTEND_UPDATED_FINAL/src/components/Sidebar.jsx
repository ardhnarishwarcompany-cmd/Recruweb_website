import { useState, useEffect } from 'react';

const Sidebar = ({ sections = [] }) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (sections.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '30px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 1000,
    }}>
      {sections.map((section) => (
        <div
          key={section}
          onClick={() => scrollToSection(section)}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: activeSection === section ? 'var(--accent)' : 'rgba(13, 27, 42, 0.3)',
            border: '2px solid ' + (activeSection === section ? 'var(--accent)' : 'rgba(13, 27, 42, 0.5)'),
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
          title={section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
        >
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            opacity: activeSection === section ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
          }}>
            {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
