import { Link } from 'react-router-dom';
import ScrollIndicator from '../components/ScrollIndicator';

const Recruitment = () => {
  const recruitmentServices = [
    { icon: '🎯', title: 'Executive Search', description: 'Find top-level executives who align with your company culture and strategic goals.' },
    { icon: '📋', title: 'Staffing Solutions', description: 'Flexible staffing options to meet your temporary and permanent hiring needs.' },
    { icon: '🌐', title: 'International Recruitment', description: 'Access global talent pools with our extensive international network.' },
    { icon: '👔', title: 'Permanent Staffing', description: 'Long-term hiring solutions for full-time positions across all industries.' },
    { icon: '⏰', title: 'Temporary Staffing', description: 'Quick staffing solutions for seasonal demands and short-term projects.' },
    { icon: '🎓', title: 'Campus Recruitment', description: 'Connect with fresh talent from top colleges and universities.' },
  ];

  const industries = [
    'IT & Software', 'BPO & KPO', 'Manufacturing', 'Retail & Hospitality',
    'Healthcare', 'Finance & Banking', 'Education', 'Real Estate',
    'Automotive', 'Telecommunications'
  ];

  const processSteps = [
    { number: '1', title: 'Requirement Analysis', description: 'We understand your needs, company culture, and role requirements.' },
    { number: '2', title: 'Sourcing', description: 'We tap into our vast network and databases to find suitable candidates.' },
    { number: '3', title: 'Screening', description: 'Rigorous screening including interviews, assessments, and background checks.' },
    { number: '4', title: 'Interview', description: 'We coordinate and facilitate interviews at your convenience.' },
    { number: '5', title: 'Selection', description: 'We help you evaluate and select the best candidate.' },
    { number: '6', title: 'Onboarding', description: 'We assist with offer letters, joining formalities, and onboarding.' },
  ];

  return (
    <>
      {/* Recruitment Hero */}
      <section className="hero" style={{ minHeight: '60vh', paddingTop: '140px' }}>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Recruitment</span>
            <h1 className="section-title" style={{ fontSize: '52px' }}>Expert Recruitment Solutions</h1>
            <img 
              src="/images/recruitment-image.jpg" 
              alt="Recruitment Solutions" 
              style={{ 
                width: '100%', 
                maxWidth: '800px', 
                height: 'auto', 
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }} 
            />
            <p className="section-subtitle" style={{ marginBottom: '32px' }}>
              We specialize in delivering cost-effective, time-efficient, and result-driven recruitment solutions for businesses of all sizes.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
              <span style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', borderRadius: '20px', fontWeight: '500' }}>IT & Non IT</span>
              <span style={{ padding: '8px 16px', background: 'var(--secondary)', color: 'white', borderRadius: '20px', fontWeight: '500' }}>BPO & Non BPO</span>
              <span style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontWeight: '500' }}>Blue Collars & White Collars</span>
              <span style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', borderRadius: '20px', fontWeight: '500' }}>Hospitality</span>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Recruitment Services */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Recruitment Services</span>
            <h2 className="section-title">Comprehensive Staffing Solutions</h2>
            <p className="section-subtitle">
              End-to-end recruitment services tailored to your business needs.
            </p>
          </div>
          <div className="services-grid">
            {recruitmentServices.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Industries We Serve</span>
            <h2 className="section-title">Diverse Industry Expertise</h2>
            <p className="section-subtitle">
              We have successfully placed candidates across a wide range of industries.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {industries.map((industry, index) => (
              <span key={index} style={{ 
                padding: '12px 24px', 
                background: 'white', 
                border: '2px solid var(--highlight)',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'var(--primary)',
                fontSize: '15px'
              }}>
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Process */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Process</span>
            <h2 className="section-title">How We Work</h2>
            <p className="section-subtitle">
              Our proven recruitment process ensures quality hires every time.
            </p>
          </div>
          <div className="process-steps">
            {processSteps.map((step, index) => (
              <div className="process-step" key={index}>
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Companies Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Placements Made</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">48hrs</div>
              <div className="stat-label">Average Turnaround</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need Talent? Let's Connect!</h2>
            <p className="cta-subtitle">
              Whether you need temporary staff or permanent placements, we have the expertise to find the right candidates for your organization.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/get-started" className="btn btn-primary">Get Started</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Recruitment;
