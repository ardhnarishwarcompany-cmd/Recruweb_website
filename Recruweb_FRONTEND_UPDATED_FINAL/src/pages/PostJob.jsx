import { useState } from 'react';
import ScrollIndicator from '../components/ScrollIndicator';
import { api } from '../utils/api';

const emptyForm = {
  companyName: '',
  companyLogo: '',
  companyWebsite: '',
  contactName: '',
  email: '',
  phone: '',
  jobTitle: '',
  location: '',
  jobType: 'full-time',
  experience: '',
  salaryMin: '',
  salaryMax: '',
  department: '',
  description: '',
  requirements: '',
  responsibilities: '',
  skills: '',
  benefits: '',
  openings: 1
};

const PostJob = () => {
  const [formData, setFormData] = useState(emptyForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const jobData = {
      title: formData.jobTitle,
      company: formData.companyName,
      companyWebsite: formData.companyWebsite,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      jobType: formData.jobType,
      experience: formData.experience,
      department: formData.department,
      description: formData.description,
      openings: Number(formData.openings) || 1,
      salary: {
        min: parseInt(formData.salaryMin, 10) || 0,
        max: parseInt(formData.salaryMax, 10) || 0,
        currency: 'INR'
      },
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      benefits: formData.benefits.split('\n').filter(b => b.trim())
    };

    try {
      const data = await api.jobs.request(jobData);

      if (data.success) {
        setSuccessMessage(
          data.message || 'Job posted successfully! We will review it shortly.',
        );
        setFormData(emptyForm);
      } else {
        setErrorMessage(data.message || 'Failed to post job');
      }
    } catch {
      setErrorMessage(
        'Could not reach the server. Please check your connection and try again.',
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="post-job-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="pj-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="pj-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <section className="pj-hero-section-light">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="pj-badge">
            <span className="pj-badge-dot"></span>
            <span>For Employers</span>
          </div>
          <h1 className="pj-hero-title">
            Post a <span className="gradient-text">Job Opening</span>
          </h1>
          <p className="pj-hero-subtitle">
            Find the perfect candidate for your organization. Post your job opening and reach thousands of job seekers.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ paddingTop: '30px', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        <div className="container">
          <div className="post-job-container">
            
            {/* Form Card */}
            <div className="pj-card-3d post-job-form-card">
              <div className="card-bg-light-glow"></div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', position: 'relative', zIndex: 2 }}>Job Details</h2>
              <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
                
                <div className="form-section">
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>Company Information</h3>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group-custom">
                      <label>Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Company Website</label>
                      <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group-custom">
                      <label>Contact Person Name *</label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '24px' }}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>Job Information</h3>
                  <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group-custom">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Noida, Uttar Pradesh"
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Job Type *</label>
                      <select name="jobType" value={formData.jobType} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', fontWeight: '700' }}>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group-custom">
                      <label>Experience Required *</label>
                      <select name="experience" value={formData.experience} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', fontWeight: '700' }}>
                        <option value="">Select experience</option>
                        <option value="fresher">Fresher</option>
                        <option value="1-2 years">1-2 Years</option>
                        <option value="3-5 years">3-5 Years</option>
                        <option value="5-10 years">5-10 Years</option>
                        <option value="10+ years">10+ Years</option>
                      </select>
                    </div>
                    <div className="form-group-custom">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group-custom">
                      <label>Min Salary (INR)</label>
                      <input
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        placeholder="e.g., 50000"
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Max Salary (INR)</label>
                      <input
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        placeholder="e.g., 100000"
                      />
                    </div>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '24px' }}>
                    <label>Number of Openings</label>
                    <input
                      type="number"
                      name="openings"
                      value={formData.openings}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>Job Description</h3>
                  <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                    <label>Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows="4"
                      required
                    ></textarea>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                    <label>Requirements (one per line)</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="5+ years of experience&#10;Strong communication skills&#10;Bachelor's degree"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                    <label>Responsibilities (one per line)</label>
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      placeholder="Lead development projects&#10;Mentor junior team members&#10;Collaborate with cross-functional teams"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                    <label>Required Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., JavaScript, React, Node.js, SQL"
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '24px' }}>
                    <label>Benefits (one per line)</label>
                    <textarea
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      placeholder="Health Insurance&#10;Flexible Working Hours&#10;Professional Development"
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                {successMessage && (
                  <div className="form-success" style={{ padding: '12px 16px', background: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', borderRadius: '12px', fontWeight: '700', marginBottom: '16px' }}>{successMessage}</div>
                )}
                {errorMessage && (
                  <div className="form-error" style={{ padding: '12px 16px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fecaca', borderRadius: '12px', fontWeight: '700', marginBottom: '16px' }}>{errorMessage}</div>
                )}

                <button type="submit" className="cv-action-btn primary glow-btn" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                  {isSubmitting ? 'Posting...' : 'Post Job ✨'}
                </button>
              </form>
              <div className="card-glow-bar"></div>
            </div>

            {/* Sidebar */}
            <div className="post-job-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="pj-card-3d info-card" style={{ padding: '26px' }}>
                <div className="card-bg-light-glow"></div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Why Post with Recruweb?</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#475569', fontWeight: '700', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 2 }}>
                  <li>✓ Reach 50,000+ active job seekers</li>
                  <li>✓ Featured listings for better visibility</li>
                  <li>✓ Advanced candidate matching</li>
                  <li>✓ Real-time application notifications</li>
                  <li>✓ Detailed analytics dashboard</li>
                  <li>✓ Dedicated support team</li>
                </ul>
                <div className="card-glow-bar"></div>
              </div>

              <div className="pj-card-3d info-card" style={{ padding: '26px' }}>
                <div className="card-bg-light-glow"></div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', position: 'relative', zIndex: 2 }}>Contact Us</h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '14px', position: 'relative', zIndex: 2, fontWeight: '600' }}>Have questions? We're here to help!</p>
                <div className="contact-info" style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', zIndex: 2, fontWeight: '600' }}>
                  <p style={{ margin: 0 }}><strong>Email:</strong> info@recruweb.com</p>
                  <p style={{ margin: 0 }}><strong>Phone:</strong> +91 9336532636</p>
                  <p style={{ margin: 0 }}><strong>Address:</strong> H-107, Noida Sector 63, Nearby Electronic City Metro Station</p>
                </div>
                <div className="card-glow-bar"></div>
              </div>

              <div className="pj-card-3d info-card pricing" style={{ padding: '26px' }}>
                <div className="card-bg-light-glow"></div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Pricing Plans</h3>
                <div className="pricing-plan" style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#334155', margin: '0 0 4px' }}>Basic</h4>
                  <p className="price" style={{ fontSize: '20px', fontWeight: '800', color: '#059669', margin: '0 0 6px' }}>Free</p>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12.5px', color: '#64748b', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Post 1 job</li>
                    <li>30 days validity</li>
                    <li>Basic visibility</li>
                  </ul>
                </div>
                <div className="pricing-plan featured" style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '14px', position: 'relative', zIndex: 2 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#5b21b6', margin: '0 0 4px' }}>Premium</h4>
                  <p className="price" style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5', margin: '0 0 6px' }}>&#8377;2,999<span style={{ fontSize: '12px', fontWeight: '600' }}>/month</span></p>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12.5px', color: '#4b5563', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Unlimited job posts</li>
                    <li>Featured listings</li>
                    <li>Priority support</li>
                    <li>Analytics dashboard</li>
                  </ul>
                </div>
                <div className="card-glow-bar"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .post-job-wrapper-light {
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

        .pj-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .pj-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatPjParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatPjParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .pj-hero-section-light {
          position: relative;
          padding: 110px 0 60px;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .pj-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .pj-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .pj-hero-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 14px;
          letter-spacing: -1px;
          color: #0f172a;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pj-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
        }

        .post-job-container {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          max-width: 1050px;
          margin: 0 auto;
        }

        .pj-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 22px;
          padding: 36px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .pj-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
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

        .form-group-custom label {
          display: block;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          margin-bottom: 6px;
        }

        .form-group-custom input,
        .form-group-custom textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          font-size: 14px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group-custom input:focus,
        .form-group-custom textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
        }

        .cv-action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
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

        .pj-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media (max-width: 1024px) {
          .post-job-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PostJob;