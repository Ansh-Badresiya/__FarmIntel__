import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero_bg.png';
import { motion } from 'framer-motion';
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

const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

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
          FarmIntel — Empowering Farmers with Intelligent Agriculture
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
          Crop Recommendation • Yield Prediction • Digital Subsidy Management
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 24px',
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
            Unified Agriculture Platform
          </span>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 16px',
            lineHeight: 1.2,
            textShadow: '0 2px 4px rgba(0,0,0,0.4)'
          }}>
            Smarter Farming. Better Decisions. Greater Benefits.
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '0 0 32px',
            lineHeight: 1.6,
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            An end-to-end farmer platform combining subsidy management, crop recommendation, and yield prediction using machine learning.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo(featuresRef)}
              className="gov-btn gov-btn-outline" 
              style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Explore Features <ChevronDown size={18} />
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/login" 
                className="gov-btn gov-btn-primary" 
                style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}
              >
                Access Portal <ChevronRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} style={{ padding: '60px 24px', background: '#fff', borderBottom: '1px solid var(--gov-border)' }}>
        <FadeInUp>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gov-navy)', margin: 0 }}>
              About FarmIntel
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--gov-text-light)', marginTop: '8px' }}>
              Empowering farmers with data-driven decisions through intelligent subsidy management and predictive agriculture.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--gov-text-light)', margin: '0 0 16px' }}>
                FarmIntel is an end-to-end smart agriculture platform that combines farmer subsidy management with machine learning-powered crop recommendation and yield prediction. It simplifies agricultural decision-making by integrating digital services, predictive models, and a secure role-based management system into one unified platform.              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--gov-text-light)', margin: 0 }}>
                Farmers receive personalized crop recommendations and expected yield forecasts, while officers and administrators can efficiently manage subsidy verification, application processing, and eligibility evaluation through an automated workflow, ensuring transparency and faster service delivery.              
              </p>
            </div>

            <div style={{ background: 'var(--gov-navy-light)', border: '1px solid var(--gov-border)', padding: '24px', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                System Architecture Flow
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  // 'Enter farm location and season.',
                  // 'ML analyzes historical agricultural data.',
                  // 'Generate crop and yield predictions.',
                  // 'Submit subsidy applications digitally.',
                  // 'Officer verifies and processes requests.',
                  // -------------------------------------------------
                  // 'Farmer submits farm location and cultivation details.',
                  // 'Machine learning identifies the most suitable crops.',
                  // 'The platform forecasts expected crop yields.',
                  // 'Farmers apply for eligible subsidy schemes online.',
                  // 'Officers validate applications through a secure workflow.',
                  // -------------------------------------------------
                  'Farmers register their agricultural details, including location and seasonal information, to receive personalized recommendations.',
                  'FarmIntel uses machine learning models to identify suitable crop categories from historical agricultural datasets.',
                  'The system recommends the best crops and forecasts their expected yields for better cultivation planning.',
                  'Farmers can discover eligible subsidy schemes, complete digital applications, and track their application status.',
                  'Officers verify applications using an automated eligibility engine, while administrators manage schemes and platform operations.'
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
        </FadeInUp>
      </section>

      {/* Key Features Section */}
      <section ref={featuresRef} style={{ padding: '60px 24px', background: 'var(--gov-bg)', borderBottom: '1px solid var(--gov-border)' }}>
        <FadeInUp>
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
            <motion.div whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Brain size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Intelligent Farming Advisor
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  Empower farmers with personalized crop recommendations and yield predictions powered by machine learning and historical insights.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Smart Subsidy Evaluation
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  Digitally verify subsidy eligibility through automated validation rules, reducing manual effort and improving transparency.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--gov-orange-light)', color: 'var(--gov-orange)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                  Unified User Portal
                </h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--gov-text-light)' }}>
                  A centralized platform connecting Farmers, Officers, and Admins through streamlined dashboards and efficient digital workflows.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        </FadeInUp>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '60px 24px', background: '#fff' }}>
        <FadeInUp>
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
            <motion.div whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Farmers
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Personalized crop recommendations',
                  'Expected yield predictions',
                  'Online subsidy applications',
                  'Live status notifications'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Officer */}
            <motion.div whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Field Officers
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Application verification dashboard',
                  'Rule-based eligibility checks',
                  'Secure document review',
                  'Faster approval workflow'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Admin */}
            <motion.div whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} transition={{ duration: 0.2 }} style={{ padding: '20px', border: '1px solid var(--gov-border)', borderRadius: '6px', background: 'var(--gov-bg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gov-orange)" /> Administrators
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Manage users and subsidy schemes',
                  'Configure eligibility policies',
                  'Monitor system performance',
                  'Access operational insights'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--gov-text-light)' }}>
                    <CheckCircle2 size={16} color="var(--gov-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0F172A",
          color: "#E5E7EB",
          padding: "60px 0 25px",
          marginTop: "80px",
          borderTop: "4px solid #16A34A",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 30px",
          }}
        >

          {/* Top Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "50px",
            }}
          >

            {/* Brand */}
            <div>
              <h2
                style={{
                  color: "#fff",
                  marginBottom: "15px",
                }}
              >
                🌱 FarmIntel
              </h2>

              <p
                style={{
                  lineHeight: 1.8,
                  color: "#CBD5E1",
                }}
              >
                An intelligent agriculture platform combining
                machine learning, crop recommendation,
                yield prediction, and digital subsidy
                management into one unified ecosystem.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: "#fff", marginBottom: 20 }}>
                Quick Links
              </h4>

              <p><a href="/learn-more">About</a></p>
              <p><a href="/login">Login</a></p>
              <p><a href="/">Home</a></p>
              <p><a href="/dashboard">Dashboard</a></p>
            </div>

            {/* Technologies */}
            <div>
              <h4 style={{ color: "#fff", marginBottom: 20 }}>
                Technologies
              </h4>

              <p>React</p>
              <p>FastAPI</p>
              <p>PostgreSQL</p>
              <p>Scikit-learn</p>
              <p>Docker</p>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: "#fff", marginBottom: 20 }}>
                Connect
              </h4>

              <p>
                <a
                  href="https://github.com/Ansh-Badresiya"
                  target="_blank"
                >
                  GitHub
                </a>
              </p>

              <p>
                <a
                  href="https://www.linkedin.com/in/ansh-badresiya/"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </p>

              <p>
                <a href="mailto:anshbadresiya284@gmail.com">
                  info@farmintel.com
                </a>
              </p>
            </div>

          </div>

          {/* Bottom */}
          <hr
            style={{
              borderColor: "#334155",
              margin: "35px 0 20px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              color: "#94A3B8",
              fontSize: "14px",
            }}
          >
            <span>
              © {new Date().getFullYear()} FarmIntel. All rights reserved.
            </span>

            <span>
              Built with React • FastAPI • PostgreSQL • Docker • Machine Learning
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
};
