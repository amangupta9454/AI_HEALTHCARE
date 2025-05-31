import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Typed from 'typed.js';
import hospitalLogo from '../Images/mains.png';
import aboutImage from '../Images/Hospital.jpg';
import care from '../Images/care.jpg';
import infra from '../Images/infra.jpg';
import online from '../Images/online.jpg';
import qualified from '../Images/qualified.jpg';

const Home = () => {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ['Care You Trust', 'Health First', 'Healing Lives'],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
      showCursor: false, // Remove the cursor
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="font-['Inter'] bg-gray-950 text-gray-100 overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-indigo-950 via-gray-900 to-black relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-5 animate-subtle-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-30 transform -translate-y-20 animate-parallax" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 z-0 animate-slide-in-up">
          <div className="lg:w-1/2 text-center lg:text-left ">
            <h1 id="hero-title" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight pt-36">
              <span ref={typedRef} className="block min-h-[1.5em]"></span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-md sm:max-w-lg lg:max-w-xl mx-auto lg:mx-0 text-gray-300 font-light leading-relaxed">
              Experience compassionate care with cutting-edge technology, dedicated to your well-being.
            </p>
            <Link
              to="/appointement"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 relative overflow-hidden group"
              aria-label="Get started with your appointment"
            >
              Get Started
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity duration-300 transform scale-0 group-hover:scale-100 origin-center rounded-full" />
            </Link>
          </div>
          <div className="lg:w-1/2 flex justify-center lg:pt-24">
            <img
              src={hospitalLogo}
              alt="Hospital Logo"
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full object-cover shadow-2xl border-4 border-blue-500/40 hover:scale-110 transition-transform duration-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-fade-in"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-900" aria-labelledby="about-title">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 animate-slide-in-up">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h2 id="about-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-400 mb-6 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              About Us
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light leading-relaxed max-w-prose text-justify">
              We are committed to delivering exceptional healthcare with a patient-first approach. Our cutting-edge facilities, expert medical professionals, and compassionate staff provide personalized care, from advanced diagnostics to innovative treatments, fostering a healthier community.
            </p>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative group">
              <img
                src={aboutImage}
                alt="About Our Hospital"
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full object-cover shadow-2xl border-2 border-gray-800/60 group-hover:scale-105 transition-transform duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-fade-in"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Speciality Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-950" aria-labelledby="speciality-title">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 id="speciality-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-400 text-center mb-10 sm:mb-12 lg:mb-14 xl:mb-16 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            Our Specialities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {[
              { title: 'Best Infrastructure', image: infra, description: 'State-of-the-art facilities designed to enhance patient comfort and care.' },
              { title: 'Qualified Doctors', image: qualified, description: 'Expert physicians delivering world-class medical expertise and compassion.' },
              { title: 'Emergency Care', image: care, description: '24/7 emergency services for prompt and effective treatment.' },
              { title: 'Online Appointment', image: online, description: 'Seamless online booking for your convenience and ease.' },
            ].map((speciality, index) => (
              <div
                key={index}
                className="bg-gray-900/70 rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-3 hover:rotate-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-gray-800/60 backdrop-blur-md animate-slide-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  <img
                    src={speciality.image}
                    alt={speciality.title}
                    className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                </div>
                <div className="p-5 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-400 mb-3">{speciality.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-400">{speciality.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-indigo-950 to-gray-900 relative overflow-hidden" aria-labelledby="cta-title">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-5 animate-subtle-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-30 transform -translate-y-20 animate-parallax" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center z-0 animate-slide-in-up">
          <h2 id="cta-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-400 mb-6 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            Ready to Take the Next Step?
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto text-gray-300 font-light">
            Book an appointment or contact us for personalized healthcare solutions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8">
            <Link
              to="/appointement"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 relative overflow-hidden group animate-pulse-hover"
              aria-label="Book an appointment"
            >
              Book Appointment
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity duration-300 transform scale-0 group-hover:scale-100 origin-center rounded-full" />
            </Link>
            <Link
              to="/contact"
              className="bg-gray-800 text-gray-100 px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 relative overflow-hidden group"
              aria-label="Contact us"
            >
              Contact Us
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity duration-300 transform scale-0 group-hover:scale-100 origin-center rounded-full" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes subtle-pulse {
          0% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
          100% {
            opacity: 0.05;
          }
        }
        @keyframes parallax {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.7s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.9s ease-out forwards;
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 8s ease-in-out infinite;
        }
        .animate-parallax {
          animation: parallax 10s ease-in-out infinite alternate;
        }
        .animate-pulse-hover:hover {
          animation: pulse-glow 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;