import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShieldCheck, 
  Brain, 
  LayoutDashboard, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ChevronDown,
  BookOpen
} from 'lucide-react';

export const Landing = () => {
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gov-bg)',
      color: 'var(--gov-text)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top green strip */}
      <div className="gov-top-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px', background: 'var(--gov-navy)' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>
          FarmIntel — Smart Agriculture Decision Support System
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
          Academic Research Project
        </span>
      </div>

      {/* Navigation Header */}
      <header style={{
        background: '#fff',
        borderBottom: '3px solid var(--gov-orange)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--gov-orange)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sprout size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)', lineHeight: 1.1 }}>
              FarmIntel
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gov-text-light)', letterSpacing: '0.3px' }}>
              Decision Support System
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--gov-navy)' }}
          >
            Home
          </button>
          <button 
            onClick={() => scrollTo(aboutRef)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--gov-text-light)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gov-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gov-text-light)'}
          >
            About
          </button>
          <button 
            onClick={() => scrollTo(featuresRef)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--gov-text-light)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gov-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gov-text-light)'}
          >
            Features
          </button>
          <Link 
            to="/login" 
            className="gov-btn gov-btn-primary" 
            style={{ padding: '8px 20px', borderRadius: '4px', fontSize: '14px' }}
          >
            Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #E8F5E9 0%, #D8F3DC 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--gov-border)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'var(--gov-orange)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px'
          }}>
            Next-Gen Agricultural Analytics
          </span>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 800,
            color: 'var(--gov-navy)',
            margin: '0 0 16px',
            lineHeight: 1.2
          }}>
            Optimize Farming Yields & Seamlessly Manage Subsidies
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--gov-text-light)',
            margin: '0 0 32px',
            lineHeight: 1.6
          }}>
            FarmIntel integrates predictive artificial intelligence for crop recommendations, expected yield forecasting, and a secure dashboard system for subsidy eligibility & verification.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button 
              onClick={() => scrollTo(featuresRef)}
              className="gov-btn gov-btn-outline" 
              style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Explore Features <ChevronDown size={18} />
            </button>
            <Link 
              to="/login" 
              className="gov-btn gov-btn-primary" 
              style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Access Portal <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} style={{ padding: '60px 24px', background: '#fff', borderBottom: '1px solid var(--gov-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gov-navy)', margin: 0 }}>
              About FarmIntel
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--gov-text-light)', marginTop: '8px' }}>
              A comprehensive decision support system built to bridge data and farming.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--gov-text-light)', margin: '0 0 16px' }}>
                FarmIntel is an academic initiative designed to modernize agricultural management. By combining data-driven crop analysis with digital workflows, the platform provides actionable insights for every level of the agricultural process.
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--gov-text-light)', margin: 0 }}>
                Farmers gain direct access to state-of-the-art predictive tools to decide what to grow based on regional climate history, while field officers and administrators enjoy automated criteria checking and clean digital application processing.
              </p>
            </div>

            <div style={{ background: 'var(--gov-navy-light)', border: '1px solid var(--gov-border)', padding: '24px', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                System Architecture Flow
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Farmer submits region details (State, District, Season).',
                  'ML pipeline runs historical predictions on climate and soil suitability.',
                  'System renders top recommended crop suggestions and expected yields.',
                  'Farmer reviews eligibility and submits digital subsidy applications.',
                  'Verification rules automatically flag exceptions for fast officer review.'
                ].map((step, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--gov-text)' }}>
                    <span style={{
                      width: '20px', height: '20px', background: 'var(--gov-orange)', color: '#fff',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section ref={featuresRef} style={{ padding: '60px 24px', background: 'var(--gov-bg)', borderBottom: '1px solid var(--gov-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gov-navy)', margin: 0 }}>
              Key Features
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--gov-text-light)', marginTop: '8px' }}>
              Integrated tools built to boost efficiency and agricultural productivity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Feature 1 */}
            <div className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Brain size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Smart Crop AI Advisory
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  Leverage machine learning to predict the most profitable crop categories and specific crop variants based on season and region.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Subsidy Eligibility Engine
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  Automate compliance checks against system-configured rules such as land ownership, regional specifications, and crop categories.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Three-Tier Portal
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  Tailored dashboards for Farmers (applications & advisory), Officers (queues & review verification), and Admins (schemes, users & rule builder).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '60px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gov-navy)', margin: 0 }}>
              Benefits for All Roles
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--gov-text-light)', marginTop: '8px' }}>
              Tailored workspaces to provide distinct, focused value.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Farmer */}
            <div style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Farmers
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Instant predictive crop advisories',
                  'Clean visual layout for subsidy schemes',
                  'Real-time status tracking and notifications',
                  'Simple document upload workflow'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Officer */}
            <div style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Field Officers
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Unified queue for incoming applications',
                  'Clear sectioned display of farmer profiles',
                  'Automatic rule violation flags',
                  'Easy Approve/Reject/Request Info triggers'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin */}
            <div style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Administrators
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Direct management of subsidy schemes',
                  'User role configuration and overview',
                  'Structured form-based rule building',
                  'System-wide metrics and charts'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--gov-navy)',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        padding: '24px 20px',
        fontSize: '13px',
        marginTop: 'auto',
        borderTop: '3px solid var(--gov-orange)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <span>© FarmIntel. All Rights Reserved. | Academic Research Project v1.0</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>Login</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>Vite + Fast API + PyTorch</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
