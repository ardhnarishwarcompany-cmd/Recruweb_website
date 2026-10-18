import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Phone, Mail } from 'lucide-react';

const GetStarted = () => {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' or 'recruitment' or 'individual'

  return (
    <div className="getstarted-page-wrapper">
      {/* Live Floating Particles Background */}
      <div className="getstarted-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="getstarted-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '70px 0 60px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', borderRadius: '50px', fontSize: '12px', fontWeight: '800', marginBottom: '14px', border: '1.5px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)' }}>
            <ShieldCheck size={15} /> Official Service Commercials & Pricing (Effective August 2026)
          </div>
          <h1 className="section-title" style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Choose Your <span className="text-gradient" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Recruweb Plan</span>
          </h1>
          <p className="section-subtitle" style={{ fontSize: '15.5px', color: '#334155', maxWidth: '650px', margin: '0 auto 28px', lineHeight: '1.6', fontWeight: '600' }}>
            End-to-end Staffing, HR, Compliance, Payroll, Recruitment, and AI-powered HR Technology Solutions under one platform.
          </p>

          {/* Category Toggle Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('tech')}
              className={`tab-pill-btn ${activeTab === 'tech' ? 'active' : ''}`}
            >
              🚀 HR Tech SaaS Plans
            </button>
            <button 
              onClick={() => setActiveTab('recruitment')}
              className={`tab-pill-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
            >
              💼 Recruitment Partnerships
            </button>
            <button 
              onClick={() => setActiveTab('individual')}
              className={`tab-pill-btn ${activeTab === 'individual' ? 'active' : ''}`}
            >
              ⚡ Individual AI Products
            </button>
          </div>
        </div>

        {/* TAB 1: HR Tech SaaS Subscription Plans */}
        {activeTab === 'tech' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '50px', paddingTop: '15px' }}>
            {[
              { 
                name: 'HR Technology Starter', 
                price: '₹2,000', 
                unit: ' per candidate / month',
                mrp: '₹10,000/mo', 
                desc: 'Ideal for startups & small teams.',
                features: ['For 11 months', 'Hiring support per hired candidate (as per package)', 'Replacement, Payroll & Compliance support', 'Full HRMS access', 'AI interview & screening, Attendance, Employee verification', 'Operational HR support', '₹5,000 commitment charges at the time of agreement'] 
              }
            ].map((plan, idx) => (
              <div key={idx} className={`pricing-3d-card ${plan.popular ? 'popular' : ''}`}>
                <div className="card-bg-light-glow"></div>
                {plan.popular && (
                  <span className="popular-badge-pill">
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', position: 'relative', zIndex: 2 }}>{plan.name}</h3>
                <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', position: 'relative', zIndex: 2, fontWeight: '600' }}>{plan.desc}</p>
                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>{plan.unit || ' / month'}</span>
                  <div style={{ fontSize: '11.5px', color: '#64748b', textDecoration: 'line-through', marginTop: '2px', fontWeight: '700' }}>MRP: {plan.mrp}</div>
                </div>
                <div style={{ flex: 1, marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', fontWeight: '700' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800' }}>
                          <Check size={11} />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#contact" className={`pricing-action-btn ${plan.popular ? 'primary' : 'secondary'}`} style={{ position: 'relative', zIndex: 2 }}>
                  Get Started Now <ArrowRight size={15} style={{ display: 'inline', marginLeft: '4px' }} />
                </a>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Recruitment Partnership Plans */}
        {activeTab === 'recruitment' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '50px', paddingTop: '15px' }}>
            {[
              { 
                name: 'Plan A – Premium Recruitment', 
                fee: '8.33% of Annual CTC', 
                subFee: '(Equivalent to 1 month candidate salary)',
                replacement: '4 Months FREE',
                closure: 'Within 7 working days',
                benefits: ['Fast hiring speed', 'Extended replacement security', 'FREE HRMS access for 4 months', '₹5,000 commitment charges (adjustable)'] 
              },
              { 
                name: 'Plan B – Standard Recruitment', 
                fee: '20 Days Salary', 
                subFee: 'Reduced hiring cost structure',
                replacement: '3 Months FREE',
                closure: 'Within 7 working days',
                benefits: ['Reduced recruitment expense', 'Free replacement support', 'FREE HRMS access for 3 months', '₹5,000 commitment charges (adjustable)'] 
              },
              { 
                name: 'Plan C – Startup Recruitment', 
                fee: '15 Days Salary', 
                subFee: 'Startup-friendly model',
                replacement: '2 Months FREE',
                closure: 'Within 7 working days',
                benefits: ['Lowest recruitment fee', 'Startup-friendly payment model', 'FREE HRMS access for 2 months', '₹5,000 commitment charges (adjustable)'] 
              }
            ].map((plan, idx) => (
              <div key={idx} className="pricing-3d-card">
                <div className="card-bg-light-glow"></div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', position: 'relative', zIndex: 2 }}>{plan.name}</h3>
                <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{plan.fee}</div>
                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{plan.subFee}</div>
                </div>
                <div style={{ background: '#f5f3ff', padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', fontSize: '13px', color: '#5b21b6', fontWeight: '800', border: '1px solid #ddd6fe', position: 'relative', zIndex: 2 }}>
                  🛡️ Replacement: {plan.replacement} <br />
                  ⏱️ Closure: {plan.closure}
                </div>
                <div style={{ flex: 1, marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.benefits.map((b, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', fontWeight: '700' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800' }}>
                          <Check size={11} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#contact" className="pricing-action-btn primary" style={{ position: 'relative', zIndex: 2 }}>
                  Choose Partnership <ArrowRight size={15} style={{ display: 'inline', marginLeft: '4px' }} />
                </a>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Individual AI & HR Products */}
        {activeTab === 'individual' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '50px', paddingTop: '15px' }}>
            {[
              { name: 'AI Automated Attendance', price: '₹99 / employee / mo', mrp: '₹499/emp', desc: 'Geo-tagging, geo-fencing, mobile punch & real-time shift logs.' },
              { name: 'AI Candidate Interview System', price: '₹99 / week', mrp: '₹299/candidate', desc: 'Automated AI screening, scoring, and smart recommendation reports.' },
              { name: 'Employee Verification Portal', price: '₹999 / month', mrp: '₹1,000/emp', desc: 'Unlimited document, ID, and background employment verifications.' },
              { name: 'Standalone HRMS Subscription', price: '₹299 / employee / mo', mrp: '₹1,000/emp', desc: 'Complete attendance, leave management, payroll support & employee database.' }
            ].map((prod, idx) => (
              <div key={idx} className="pricing-3d-card" style={{ padding: '24px' }}>
                <div className="card-bg-light-glow"></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>{prod.name}</h4>
                  <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '14px', lineHeight: '1.5', fontWeight: '600' }}>{prod.desc}</p>
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>{prod.price}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', textDecoration: 'line-through', display: 'block', fontWeight: '700' }}>MRP: {prod.mrp}</span>
                  </div>
                  <a href="#contact" className="pricing-action-btn secondary" style={{ padding: '9px', fontSize: '13px' }}>
                    Subscribe Now
                  </a>
                </div>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        )}

        {/* Commercial Summary Table Section */}
        <div className="commercial-table-card-3d" style={{ marginBottom: '50px', padding: '30px' }}>
          <div className="card-bg-light-glow"></div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', textAlign: 'center', position: 'relative', zIndex: 2 }}>Official Commercial Summary Table</h2>
          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#4f46e5', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.8px' }}>
                  <th style={{ padding: '12px' }}>Service Category</th>
                  <th style={{ padding: '12px' }}>Standard Market Rate (MRP)</th>
                  <th style={{ padding: '12px' }}>Recruweb Offer Price</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { service: 'Recruitment Premium', mrp: 'Standard market rate', offer: '8.33% Annual CTC' },
                  { service: 'Recruitment Standard', mrp: '25 days salary', offer: '20 days salary' },
                  { service: 'Recruitment Startup', mrp: '25 days salary', offer: '15 days salary' },
                  { service: 'HR Tech Starter', mrp: '₹10,000 / month', offer: '₹2,000 / candidate' },
                  { service: 'AI Attendance System', mrp: '₹499 / employee', offer: '₹99 / employee / month' },
                  { service: 'AI Candidate Interview', mrp: '₹299 / candidate', offer: '₹99 / week' },
                  { service: 'Employee Verification', mrp: '₹1,000 / employee', offer: '₹999 / month (Unlimited)' },
                  { service: 'Standalone HRMS', mrp: '₹1,000 / employee', offer: '₹299 / employee / month' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>{row.service}</td>
                    <td style={{ padding: '14px 12px', color: '#475569', fontWeight: '700' }}>{row.mrp}</td>
                    <td style={{ padding: '14px 12px', color: '#059669', fontWeight: '800' }}>{row.offer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Universal Commercial Terms & Contact Info */}
        <div id="contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div className="pricing-3d-card" style={{ padding: '30px' }}>
            <div className="card-bg-light-glow"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Universal Commercial Terms</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155', fontWeight: '700', position: 'relative', zIndex: 2 }}>
              <li>🔹 <strong>Commitment Charges:</strong> ₹5,000 payable at agreement signing (adjustable against final invoice where specified).</li>
              <li>🔹 <strong>Agreement Duration:</strong> Standard agreement period is 11 Months.</li>
              <li>🔹 <strong>Payment Terms:</strong> Recruitment invoices payable within 7 days of candidate joining. Subscriptions in advance.</li>
              <li>🔹 <strong>Replacement Policy:</strong> As per selected recruitment plan terms.</li>
            </ul>
            <div className="card-glow-bar"></div>
          </div>

          <div className="about-cta-inner-card" style={{ background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #311042 100%)', borderRadius: '24px', padding: '30px', textAlign: 'left', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px', color: '#ffffff' }}>Ready to Get Started?</h3>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px', fontWeight: '600' }}>
                Contact our enterprise partnership team for custom commercial discussions, bulk hiring, or multi-location deployment.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#ffffff', fontWeight: '700' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={15} /> +91-9958256785</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={15} /> info@recruweb.com</div>
              </div>
            </div>
            <div style={{ marginTop: '20px', fontSize: '11.5px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', fontWeight: '600' }}>
              Recruweb Resources Pvt. Ltd. • Noida, India • www.recruweb.com
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .getstarted-page-wrapper {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Particles Background */
        .getstarted-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .getstarted-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatGetStartedParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatGetStartedParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .tab-pill-btn {
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .tab-pill-btn.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          border-color: #4f46e5;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25);
          transform: translateY(-2px);
        }

        /* 3D Pricing Cards */
        .pricing-3d-card, .commercial-table-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: visible; /* FIXED: allows badge to display fully without clipping */
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .pricing-3d-card:hover, .commercial-table-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .pricing-3d-card.popular {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          border: 2px solid #6366f1;
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.18);
          margin-top: 10px; /* FIXED: provides extra top breathing room for badge */
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .popular-badge-pill {
          position: absolute;
          top: -16px; /* FIXED: properly positioned above card */
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          padding: 5px 18px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          z-index: 10;
        }

        .pricing-action-btn {
          display: block;
          text-align: center;
          padding: 12px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .pricing-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .pricing-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .pricing-action-btn.secondary {
          background: #f1f5f9;
          color: #0f172a;
          border: 1.5px solid #cbd5e1;
        }

        .pricing-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .pricing-3d-card:hover .card-glow-bar,
        .commercial-table-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default GetStarted;