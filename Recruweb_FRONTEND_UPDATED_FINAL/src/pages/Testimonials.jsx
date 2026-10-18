import { Link } from 'react-router-dom';
import ScrollIndicator from '../components/ScrollIndicator';

const Testimonials = () => {
  const testimonials = [
    {
      text: 'Recruweb transformed our HR operations completely. Their team is professional, efficient, and truly understands the nuances of modern workforce management. We saw a 40% improvement in employee retention within the first year.',
      author: 'Rajesh Kumar',
      position: 'CEO',
      company: 'TechCorp India',
      rating: 5
    },
    {
      text: 'The recruitment process became seamless thanks to their expertise. We found top-tier talent within weeks, not months. Their strategic approach to talent acquisition saved us significant time and resources.',
      author: 'Priya Sharma',
      position: 'HR Director',
      company: 'Global Solutions Pvt Ltd',
      rating: 5
    },
    {
      text: 'Outstanding payroll management service. They handle everything accurately and on time, allowing us to focus on our core business. The team is responsive and professional at all times.',
      author: 'Amit Patel',
      position: 'Founder',
      company: 'StartUp Ventures',
      rating: 5
    },
    {
      text: 'Their HRMS solution revolutionized how we manage our workforce. The automation and insights have helped us make data-driven decisions. Highly recommended for any organization looking to scale.',
      author: 'Sneha Williams',
      position: 'COO',
      company: 'InnovateTech',
      rating: 5
    },
    {
      text: 'The training programs delivered by Recruweb have significantly improved our team capabilities. The ROI on their training solutions has been exceptional.',
      author: 'Vikram Singh',
      position: 'Training Manager',
      company: 'EduLearn Academy',
      rating: 5
    },
    {
      text: 'Excellent compliance and advisory services. They helped us navigate complex labor laws and ensured our company is fully compliant. Their expertise is invaluable.',
      author: 'Meera Joshi',
      position: 'Legal Head',
      company: 'Corporate Services Inc',
      rating: 5
    }
  ];

  const stats = [
    { number: '4.9/5', label: 'Average Rating' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '500+', label: 'Companies Served' },
    { number: '15+', label: 'Years Experience' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ minHeight: '60vh', paddingTop: '140px' }}>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h1 className="section-title" style={{ fontSize: '52px' }}>What Our Clients Say</h1>
            <p className="section-subtitle">
              Trusted by hundreds of organizations across industries.
            </p>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Client Stories</span>
            <h2 className="section-title">Hear From Our Partners</h2>
            <p className="section-subtitle">
              Real stories from real clients who transformed their HR operations with us.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} style={{ color: '#F59E0B' }}>★</span>
                  ))}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                    <span>{testimonial.position}, {testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Become Our Next Success Story</h2>
            <p className="cta-subtitle">
              Join hundreds of satisfied clients who transformed their HR operations.
            </p>
            <Link to="/get-started" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
