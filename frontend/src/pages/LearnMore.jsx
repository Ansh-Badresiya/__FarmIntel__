import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sprout, Brain, Database, Shield, LayoutDashboard,
  Server, Smartphone, LineChart, Code, ArrowRight,
  ChevronRight, Users, CheckCircle, Activity, Map, 
  Cpu, Leaf, FileText, Bell, Globe, ArrowDown, Settings, Play, Cloud, Sun, FileCode2, Terminal
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LearnMore = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden">
      
      {/* Navbar Minimal for Landing/LearnMore */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-green-600">
              FarmIntel
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1 - Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white -z-10" />
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-emerald-400/20 blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-6 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The Future of Agriculture
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gray-900">
              Empowering Farmers with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Intelligent</span> Decision Support
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              FarmIntel is an end-to-end Farmer Subsidy Management System integrated with cutting-edge Machine Learning for Crop Recommendation and Yield Prediction.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#features" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 flex items-center gap-2 group">
                Explore Features <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center gap-2">
                <Code className="w-5 h-5" /> View GitHub
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.2} className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Abstract Illustration representation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-full animate-spin-slow opacity-50 blur-3xl"></div>
              
              <div className="relative z-10 w-full h-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Activity className="w-6 h-6"/></div>
                     <div>
                       <div className="font-bold text-gray-800">Farm Analytics</div>
                       <div className="text-xs text-gray-500">Real-time ML Insights</div>
                     </div>
                   </div>
                   <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Yield Prediction</div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border border-gray-100 p-4 flex flex-col justify-end gap-2">
                  <div className="w-full h-32 flex items-end gap-2 justify-between px-2">
                     <motion.div initial={{height:0}} animate={{height:'40%'}} transition={{duration:1, delay:0.5}} className="w-full bg-emerald-200 rounded-t-md"></motion.div>
                     <motion.div initial={{height:0}} animate={{height:'60%'}} transition={{duration:1, delay:0.7}} className="w-full bg-emerald-300 rounded-t-md"></motion.div>
                     <motion.div initial={{height:0}} animate={{height:'45%'}} transition={{duration:1, delay:0.9}} className="w-full bg-blue-200 rounded-t-md"></motion.div>
                     <motion.div initial={{height:0}} animate={{height:'80%'}} transition={{duration:1, delay:1.1}} className="w-full bg-emerald-500 rounded-t-md"></motion.div>
                     <motion.div initial={{height:0}} animate={{height:'70%'}} transition={{duration:1, delay:1.3}} className="w-full bg-green-400 rounded-t-md"></motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                    <Sprout className="text-green-500 w-5 h-5"/>
                    <div className="text-sm font-bold text-gray-700">Crop Health</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                    <Cloud className="text-blue-500 w-5 h-5"/>
                    <div className="text-sm font-bold text-gray-700">Weather Sync</div>
                  </div>
                </div>

              </div>

              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
              >
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Brain className="w-6 h-6"/></div>
                <div>
                  <div className="text-xs text-gray-500">AI Model</div>
                  <div className="font-bold text-gray-800">Active</div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
              >
                <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle className="w-6 h-6"/></div>
                <div>
                  <div className="text-xs text-gray-500">Subsidy Status</div>
                  <div className="font-bold text-gray-800">Approved</div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 2 - Problem Statement */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Real-world challenges faced by farmers</h2>
            <p className="text-lg text-gray-600">Agriculture is the backbone of our economy, yet farmers struggle with outdated systems, lack of awareness, and unpredictable crop outcomes.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Complex Paperwork", desc: "Difficult and tedious subsidy application processes requiring endless physical documentation.", icon: FileText, color: "text-orange-500", bg: "bg-orange-100" },
              { title: "Lack of Awareness", desc: "Many farmers remain unaware of beneficial government schemes designed for them.", icon: Bell, color: "text-blue-500", bg: "bg-blue-100" },
              { title: "Crop Selection", desc: "Choosing the right crop without scientific soil or weather data leads to lower yields.", icon: Sprout, color: "text-green-500", bg: "bg-green-100" },
              { title: "Yield Uncertainty", desc: "Inability to predict harvest volumes makes financial planning almost impossible.", icon: Activity, color: "text-red-500", bg: "bg-red-100" },
              { title: "Limited Digital Support", desc: "Absence of intuitive digital platforms tailored for the agricultural community.", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-100" },
              { title: "Scattered Data", desc: "Farming data is highly fragmented, making it hard to draw actionable insights.", icon: Database, color: "text-teal-500", bg: "bg-teal-100" }
            ].map((problem, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className={`w-14 h-14 ${problem.bg} ${problem.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <problem.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{problem.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{problem.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - Our Solution */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">How <span className="text-emerald-600">FarmIntel</span> Solves This</h2>
            <p className="text-lg text-gray-600">A seamless, digital-first journey from onboarding to intelligent predictions and subsidy approvals.</p>
          </FadeIn>

          <div className="relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-100 via-emerald-400 to-blue-200 -translate-y-1/2 rounded-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
              {[
                { title: "Authentication", icon: Shield, step: 1 },
                { title: "Profile & Farm", icon: Map, step: 2 },
                { title: "Subsidy Check", icon: CheckCircle, step: 3 },
                { title: "ML Predictions", icon: Brain, step: 4 },
                { title: "Admin Review", icon: Settings, step: 5 },
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 0.15} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shadow-lg mb-4 relative z-10 hover:border-emerald-500 hover:scale-110 transition-all cursor-pointer">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 text-center w-full max-w-[200px]">
                    <span className="text-xs font-bold text-emerald-500 block mb-1">Step 0{step.step}</span>
                    <h4 className="font-bold text-gray-800">{step.title}</h4>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - Machine Learning Pipeline */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Machine Learning</span> Pipeline</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                We leverage state-of-the-art algorithms to process historical agricultural data, empowering farmers with highly accurate insights.
              </p>
              
              <div className="space-y-6">
                {[
                  { stage: "Stage 1", title: "Predict Top Crop Categories", desc: "Using XGBoost to analyze N, P, K, temperature, humidity, and rainfall.", color: "from-blue-500 to-blue-600" },
                  { stage: "Stage 2", title: "Historical Context Analysis", desc: "Retrieving historically suitable crops for the specific region.", color: "from-emerald-500 to-emerald-600" },
                  { stage: "Stage 3", title: "Expected Yield Prediction", desc: "Random Forest Regressor forecasts the expected crop yield in quintals.", color: "from-purple-500 to-purple-600" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                       <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center font-bold shadow-lg`}>
                         {i + 1}
                       </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl flex items-center justify-center gap-3">
                    <Database className="text-blue-400 w-6 h-6" /> <span className="font-semibold text-gray-200">Historical Agricultural Data</span>
                  </div>
                  <ArrowDown className="text-gray-500 w-5 h-5 animate-bounce" />
                  
                  <div className="w-full flex gap-4">
                    <div className="flex-1 bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
                      <span className="font-semibold text-gray-300 text-sm">Data Cleaning</span>
                    </div>
                    <div className="flex-1 bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
                      <span className="font-semibold text-gray-300 text-sm">Feature Engineering</span>
                    </div>
                  </div>
                  <ArrowDown className="text-gray-500 w-5 h-5 animate-bounce" />

                  <div className="w-full bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border border-emerald-700/50 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2"><Brain className="text-emerald-400 w-8 h-8 opacity-50"/></div>
                    <h4 className="text-center font-bold text-lg mb-4">Model Training</h4>
                    <div className="flex gap-4">
                       <div className="flex-1 bg-gray-900/80 p-3 rounded-lg border border-emerald-600/30 text-center">
                         <div className="text-emerald-400 font-bold mb-1">XGBoost</div>
                         <div className="text-xs text-gray-400">Crop Recommendation</div>
                       </div>
                       <div className="flex-1 bg-gray-900/80 p-3 rounded-lg border border-blue-600/30 text-center">
                         <div className="text-blue-400 font-bold mb-1">Random Forest</div>
                         <div className="text-xs text-gray-400">Yield Prediction</div>
                       </div>
                    </div>
                  </div>
                  <ArrowDown className="text-gray-500 w-5 h-5 animate-bounce" />

                  <div className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl flex items-center justify-center gap-3">
                    <Server className="text-purple-400 w-6 h-6" /> <span className="font-semibold text-gray-200">FastAPI Integration (Real-Time)</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 5 - Core Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Comprehensive <span className="text-emerald-600">Feature Set</span></h2>
            <p className="text-lg text-gray-600">Everything needed to manage agricultural subsidies and predict outcomes in one unified platform.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Role Dashboards", desc: "Dedicated views for Farmers, Officers, and Admins.", icon: LayoutDashboard },
              { title: "JWT Auth", desc: "Secure role-based access control with token rotation.", icon: Shield },
              { title: "Eligibility Engine", desc: "Automated subsidy qualification matching.", icon: CheckCircle },
              { title: "Crop Recs", desc: "AI-driven suggestions for optimal crop selection.", icon: Sprout },
              { title: "Yield Prediction", desc: "Accurate forecasting based on environmental inputs.", icon: LineChart },
              { title: "App Tracking", desc: "Real-time status updates for subsidy applications.", icon: Activity },
              { title: "Dockerized", desc: "Containerized deployment for seamless scalability.", icon: Server },
              { title: "Responsive", desc: "Flawless experience across all device sizes.", icon: Smartphone },
            ].map((feat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer hover:-translate-y-1">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{feat.title}</h3>
                  <p className="text-sm text-gray-600">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - Technology Stack */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Powered by Modern <span className="text-blue-600">Technology</span></h2>
            <p className="text-lg text-gray-600">Built using industry-standard tools ensuring performance, security, and scalability.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { category: "Frontend", color: "border-blue-200 bg-blue-50/50", items: ["React", "Tailwind CSS", "Framer Motion", "Axios"] },
              { category: "Backend", color: "border-emerald-200 bg-emerald-50/50", items: ["FastAPI", "SQLAlchemy", "Alembic", "JWT"] },
              { category: "Machine Learning", color: "border-purple-200 bg-purple-50/50", items: ["Scikit-learn", "XGBoost", "Random Forest", "Pandas"] },
              { category: "Infrastructure", color: "border-orange-200 bg-orange-50/50", items: ["PostgreSQL", "Docker", "Render", "Vercel"] },
            ].map((stack, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className={`p-6 rounded-3xl border ${stack.color} h-full`}>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">{stack.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item, j) => (
                      <span key={j} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - System Architecture */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <FadeIn mb-12>
            <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-gray-900">System <span className="text-emerald-600">Architecture</span></h2>
          </FadeIn>
          
          <FadeIn className="relative max-w-3xl mx-auto">
             <div className="flex flex-col items-center gap-4">
                <div className="w-64 bg-white p-4 rounded-xl shadow-md border-t-4 border-blue-500 font-bold text-gray-800">React Frontend (Vercel)</div>
                <ArrowDown className="text-emerald-500 w-6 h-6 animate-pulse" />
                <div className="w-64 bg-white p-4 rounded-xl shadow-md border-t-4 border-emerald-500 font-bold text-gray-800">FastAPI Backend (Render)</div>
                
                <div className="flex gap-8 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <ArrowDown className="text-emerald-500 w-6 h-6 animate-pulse" />
                    <div className="w-48 bg-white p-4 rounded-xl shadow-md border-t-4 border-purple-500 font-bold text-gray-800 text-sm">Hugging Face ML Models</div>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <ArrowDown className="text-emerald-500 w-6 h-6 animate-pulse" />
                    <div className="w-48 bg-white p-4 rounded-xl shadow-md border-t-4 border-orange-500 font-bold text-gray-800 text-sm">PostgreSQL Database</div>
                  </div>
                </div>
             </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 8 - Screenshots */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Platform <span className="text-emerald-600">Sneak Peek</span></h2>
            <p className="text-lg text-gray-600">A glimpse into the intuitive and modern interfaces built for all user roles.</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Home Page", "Farmer Dashboard", "Officer Dashboard", 
              "Admin Dashboard", "Crop Recommendation", "Yield Prediction", 
              "Subsidy Application", "Notification Panel"
            ].map((screen, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="bg-gray-100 p-2 rounded-2xl shadow-lg border border-gray-200 group overflow-hidden cursor-pointer relative h-full">
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 z-10 shadow-sm">
                     {screen}
                   </div>
                   {/* Browser Mockup Header */}
                   <div className="w-full h-6 bg-gray-200 rounded-t-lg flex items-center px-2 gap-1.5 border-b border-gray-300">
                     <div className="w-2 h-2 rounded-full bg-red-400"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                     <div className="w-2 h-2 rounded-full bg-green-400"></div>
                     <div className="ml-2 bg-white w-full max-w-[100px] h-2 rounded-full opacity-50"></div>
                   </div>
                   {/* Mockup Body */}
                   <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-emerald-50 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500 rounded-b-lg border border-t-0 border-gray-200">
                      <LayoutDashboard className="w-8 h-8 text-emerald-300" />
                      <span className="text-emerald-700/50 font-bold tracking-widest uppercase text-[10px]">Preview</span>
                   </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 - Project Statistics */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "3", label: "User Roles" },
              { num: "2", label: "ML Models" },
              { num: "15+", label: "Major Features" },
              { num: "100%", label: "Responsive UI" },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-5xl font-extrabold mb-2 tracking-tight">{stat.num}</div>
                <div className="text-emerald-100 font-medium">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 - Development Journey */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
         <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Development <span className="text-blue-600">Journey</span></h2>
            <p className="text-lg text-gray-600">From concept to deployment, building a comprehensive solution.</p>
          </FadeIn>

          <div className="relative border-l-4 border-emerald-200 ml-4 md:ml-0 md:border-l-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-1 h-[90%] md:bg-emerald-200" />
          
          <div className="space-y-8 relative">
            {[
              "Idea & Concept", "Requirement Analysis", "Backend Development", 
              "Database Design", "Machine Learning Pipeline", "Frontend Development", 
              "Dockerization", "Deployment", "Testing"
            ].map((step, i) => (
              <FadeIn key={i} direction={i % 2 === 0 ? "right" : "left"} className={`relative flex items-center md:justify-${i % 2 === 0 ? 'end' : 'start'}`}>
                <div className={`md:w-1/2 flex ${i % 2 === 0 ? 'justify-end pr-8' : 'justify-start pl-8'} items-center ml-8 md:ml-0`}>
                   <div className="absolute left-[-8px] md:left-1/2 md:-translate-x-1/2 w-6 h-6 bg-white border-4 border-emerald-500 rounded-full shadow-lg z-10" />
                   <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full max-w-sm">
                      <div className="text-xs font-bold text-emerald-500 mb-1">Phase {i + 1}</div>
                      <h4 className="font-bold text-gray-800">{step}</h4>
                   </div>
                </div>
              </FadeIn>
            ))}
          </div>
         </div>
      </section>

      {/* SECTION 11 - Future Scope */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Future <span className="text-blue-600">Scope</span></h2>
            <p className="text-lg text-gray-600">Our vision doesn't stop here. Here is what we are planning for the next phase of FarmIntel.</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Satellite Image Analysis", "Real-Time Weather Integration", 
              "IoT Sensor Data Sync", "Multilingual Support", 
              "AI Chatbot for Farmers", "Government API Integrations"
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                 <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex items-center gap-4 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5"/>
                    </div>
                    <div className="font-semibold text-gray-800">{feature}</div>
                 </div>
              </FadeIn>
            ))}
          </div>
         </div>
      </section>

      {/* SECTION 12 - Footer CTA */}
      <footer className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <FadeIn>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 tracking-tight">Building Smarter Agriculture with <span className="text-emerald-400">AI</span></h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join us in revolutionizing the agricultural landscape by empowering farmers with data-driven insights and streamlined access to subsidies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2">
                <Code className="w-5 h-5" /> View GitHub
              </a>
              <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2">
                <Play className="w-5 h-5" /> Live Demo
              </Link>
            </div>
            
            <div className="mt-20 pt-8 border-t border-gray-800 text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>© 2026 FarmIntel. Designed for the Future.</div>
               <div className="flex gap-6">
                 <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy</span>
                 <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms</span>
                 <span className="hover:text-emerald-400 cursor-pointer transition-colors">Contact</span>
               </div>
            </div>
          </FadeIn>
        </div>
      </footer>

    </div>
  );
};
