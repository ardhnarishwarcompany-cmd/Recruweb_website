import { Link } from 'react-router-dom';
import ScrollIndicator from '../components/ScrollIndicator';

const Industry = () => {
  const industries = [
    {
      title: 'Manufacturing',
      icon: '🏭',
      description: 'Complete workforce solutions for manufacturing plants including assembly line workers, quality control inspectors, and production supervisors.',
      roles: ['Assembly Line Workers', 'Machine Operators', 'Quality Control', 'Production Supervisors', 'Maintenance Technicians', 'Warehouse Staff']
    },
    {
      title: 'Construction',
      icon: '🏗️',
      description: 'Skilled and unskilled labor for construction projects of all sizes, from residential to commercial and infrastructure development.',
      roles: ['Masons', 'Carpenters', 'Electricians', 'Plumbers', 'Site Supervisors', 'Safety Officers', 'Engineers']
    },
    {
      title: 'Automotive',
      icon: '🚗',
      description: 'Specialized workforce for automotive manufacturing plants with expertise in assembly, testing, and quality assurance.',
      roles: ['Production Associates', 'Assembly Technicians', 'Quality Inspectors', 'Maintenance Engineers', 'Logistics Staff']
    },
    {
      title: 'Electronics',
      icon: '📱',
      description: 'Skilled workers for electronics manufacturing including SMT operators, testing personnel, and assembly technicians.',
      roles: ['SMT Operators', 'Testing Engineers', 'Assembly Technicians', 'Quality Analysts', 'Packaging Staff']
    },
    {
      title: 'Textile & Garments',
      icon: '👔',
      description: 'Workforce for textile mills and garment manufacturing units with expertise in various production processes.',
      roles: ['Weavers', 'Tailors', 'Cutting Operators', 'Finishing Staff', 'Quality Controllers', 'Machine Operators']
    },
    {
      title: 'Food & Beverages',
      icon: '🍔',
      description: 'Hygiene-certified workforce for food processing and beverage manufacturing with safety compliance.',
      roles: ['Production Workers', 'Machine Operators', 'Quality Analysts', 'Packaging Staff', 'Warehouse Workers']
    }
  ];

  const keyBenefits = [
    {
      icon: '⚡',
      title: 'Quick Deployment',
      description: 'Workforce available within 24-48 hours across all major industrial zones in India.'
    },
    {
      icon: '✓',
      title: 'Skilled Workforce',
      description: 'Pre-screened, trained, and certified workers with relevant industry experience.'
    },
    {
      icon: '🛡️',
      title: 'Compliance Ready',
      description: 'All workers have proper documentation, medical clearance, and safety certifications.'
    },
    {
      icon: '💰',
      title: 'Cost Effective',
      description: 'Competitive pricing with flexible contracts - pay only for what you need.'
    },
    {
      icon: '📊',
      title: 'HRMS Integration',
      description: 'Real-time attendance tracking, payroll management, and performance monitoring.'
    },
    {
      icon: '🔄',
      title: 'Flexible Staffing',
      description: 'Scale your workforce up or down based on production requirements.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Industries Served' },
    { number: '10,000+', label: 'Workers Deployed' },
    { number: '50+', label: 'Cities Covered' },
    { number: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <>
      <section className="hero" style={{ minHeight: '60vh', paddingTop: '140px' }}>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Industry Manpower</span>
            <h1 className="section-title" style={{ fontSize: '52px' }}>Power Your Industry with Skilled Workforce</h1>
            <p className="section-subtitle">
              Comprehensive manpower solutions for manufacturing, construction, and industrial sectors across India. 
              From factory workers to supervisors, we deliver qualified talent within a week.
            </p>
            <div className="hero-actions">
              <Link to="/contact?service=industry" className="btn btn-primary btn-lg">
                Get Workforce Now
              </Link>
              <Link to="/how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </Link>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Industries We Serve</span>
            <h2 className="section-title">Complete Workforce Solutions</h2>
            <p className="section-subtitle">
              We provide trained and certified manpower across all major industrial sectors. 
              Our integrated HRMS ensures seamless management and compliance.
            </p>
          </div>
          <div className="industries-grid">
            {industries.map((industry, index) => (
              <div key={index} className="industry-card">
                <div className="industry-icon">{industry.icon}</div>
                <h3>{industry.title}</h3>
                <p>{industry.description}</p>
                <div className="industry-roles">
                  <h4>Available Roles:</h4>
                  <ul>
                    {industry.roles.map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
                <Link to="/contact?service=industry" className="btn btn-secondary">
                  Request Workforce
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">The Recruweb Advantage</h2>
            <p className="section-subtitle">
              We combine industry expertise with technology to deliver unmatched manpower solutions.
            </p>
          </div>
          <div className="benefits-grid">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Process</span>
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="process-grid">
            <div className="process-card">
              <div className="process-number">1</div>
              <h3>Requirement Analysis</h3>
              <p>Share your workforce requirements including roles,数量, duration, and location.</p>
            </div>
            <div className="process-card">
              <div className="process-number">2</div>
              <h3>Candidate Sourcing</h3>
              <p>We source pre-screened candidates from our extensive database matching your criteria.</p>
            </div>
            <div className="process-card">
              <div className="process-number">3</div>
              <h3>Interview & Selection</h3>
              <p>Candidates undergo skill assessment and interview. You select the best fit.</p>
            </div>
            <div className="process-card">
              <div className="process-number">4</div>
              <h3>Deployment & Management</h3>
              <p>Workers are deployed with full documentation. HRMS tracks attendance and performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Build Your Workforce?</h2>
            <p>Get skilled manpower for your industry within a week. Contact us today for a customized quote.</p>
            <div className="cta-buttons">
              <Link to="/contact?service=industry" className="btn btn-primary btn-lg">
                Get Started Now
              </Link>
              <Link to="/post-job" className="btn btn-outline btn-lg">
                Post Requirements
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQs</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How quickly can you provide workers?</h4>
              <p>For most positions, we can deploy qualified workers within 24-48 hours. Complex roles may take 3-5 days for proper screening.</p>
            </div>
            <div className="faq-item">
              <h4>What industries do you specialize in?</h4>
              <p>We cover manufacturing, construction, automotive, electronics, textile, food processing, and more. Our database includes workers across 50+ cities in India.</p>
            </div>
            <div className="faq-item">
              <h4>Do you handle payroll and compliance?</h4>
              <p>Yes! Our comprehensive HRMS handles payroll processing, statutory compliance (PF, ESIC), attendance tracking, and performance monitoring.</p>
            </div>
            <div className="faq-item">
              <h4>What are the contract terms?</h4>
              <p>We offer flexible contracts ranging from temporary (1-3 months) to long-term (1 year+). Scale your workforce up or down based on your needs.</p>
            </div>
            <div className="faq-item">
              <h4>How do you ensure worker quality?</h4>
              <p>All candidates undergo skill assessment, background verification, medical check-ups, and safety training before deployment.</p>
            </div>
            <div className="faq-item">
              <h4>What if a worker doesn't meet expectations?</h4>
              <p>We offer free replacement within the contract period. Our goal is your complete satisfaction with the workforce quality.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Industry;
