import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedinIn, FaArrowUp, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const scrollToTop = () => {
    const heroSection = document.getElementById('hero-title');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    {
      name: 'Aman Gupta',
      role: 'MERN Developer',
      linkedin: 'https://www.linkedin.com/in/amangupta9454',
    },
    {
      name: 'Himanshu Gupta',
      role: 'Frontend Developer',
      linkedin: 'https://www.linkedin.com/in/himanshu561hi/',
    },
    {
      name: 'Manish Dargan',
      role: 'AI Integration',
      linkedin: 'https://www.linkedin.com/in/manishdargan/',
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100 py-8 sm:py-10 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10 animate-subtle-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-purple-900/15 to-blue-900/15 animate-gradient-wave" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {/* Brand Section */}
          <div className="animate-fade-in">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-300 mb-3 tracking-tight bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
              HealthCare Hub
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed max-w-[16rem] sm:max-w-[20rem]" style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
              Delivering compassionate care with cutting-edge technology for a healthier tomorrow.
            </p>
           
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-blue-300 mb-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/doctors', label: 'Doctor' },
                { to: '/contact', label: 'Contact' },
                { to: '/appointment', label: 'Book Appointment' },
                { to: '/review', label: 'Review' },
                { to: '/login', label: 'Login' },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm md:text-base text-gray-200 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                    aria-label={`Navigate to ${link.label}`}
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-blue-300 mb-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
              Contact Us
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm md:text-base text-gray-200" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              <li className="flex items-start">
                <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/5BJ8xWHty9NV9td57"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors duration-200"
                  aria-label="View our location on Google Maps"
                >
                  HIET Ghaziabd
                </a>
              </li>
              <li>
                <span className="font-medium">Phone:</span>{' '}
                <a
                  href="tel:+919560472926"
                  className="hover:text-blue-400 transition-colors duration-200"
                  aria-label="Call us at +1 (234) 567-890"
                >
                  9560472926
                </a>
              </li>
              <li>
                <span className="font-medium">Email:</span>{' '}
                <a
                  href="mailto:ag0567688@gmail.com"
                  className="hover:text-blue-400 transition-colors duration-200"
                  aria-label="Email us at ag0567688@gmail.com"
                >
                  ag0567688@gmail.com
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-blue-300 hover:text-blue-400 transition-colors duration-200"
                  aria-label="Go to contact form"
                >
                  Send us a message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-blue-900/70 text-center animate-fade-in">
          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-3" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            © {new Date().getFullYear()} HealthCare Hub. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 sm:space-x-6 mb-4">
            {[
              { Icon: FaEnvelope, href: 'mailto:ag0567688@gmail.com', label: 'Email' },
              { Icon: FaGithub, href: 'https://github.com/amangupta9454', label: 'Twitter' },
              { Icon: FaInstagram, href: 'https://www.instagram.com/gupta_aman_9161/', label: 'Instagram' },
              { Icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/amangupta9454/', label: 'LinkedIn' },
              { Icon: FaWhatsapp,href: 'https://wa.me/+919560472926', label: 'LinkedIn' },
            ].map(({ Icon, href, label }, index) => (
              <div key={index} className="relative group">
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? '_self' : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="text-gray-200 hover:text-blue-400 transform hover:scale-125 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                  aria-label={label === 'Email' ? 'Send email to ag0567688@gmail.com' : `Follow us on ${label}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </a>
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-100 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-blue-900/70 pt-4">
            <p className="text-xs sm:text-sm md:text-base text-gray-300" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              Created by{' '}
              <button
                onClick={() => setIsPopupOpen(true)}
                className="text-blue-300 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                aria-label="View Code Veda team details"
              >
                Code Veda
              </button>
            </p>
          </div>
        </div>

        {/* Team Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-0 animate-fade-in py-48" role="dialog" aria-labelledby="team-popup-title">
            <div className="bg-gray-900 rounded-xl p-6 sm:p-8 max-w-md w-full mx-4 sm:mx-6 border border-blue-900/70 backdrop-blur-md animate-scale-in">
              <h2 id="team-popup-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 mb-6 text-center " style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
                Meet the Code Veda Team
              </h2>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/60 rounded-lg border border-blue-900/60">
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-100" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-300" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                        {member.role}
                      </p>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm hover:from-blue-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label={`Visit ${member.name}'s LinkedIn profile`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="mt-6 w-full py-2 sm:py-3 rounded-lg bg-gray-800 text-gray-100 font-semibold hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Close team popup"
                style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 p-3 sm:p-4 rounded-full shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.9)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 animate-pulse-glow"
            aria-label="Scroll to top of page"
          >
            <FaArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes subtle-pulse {
          0% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
          100% {
            opacity: 0.1;
          }
        }
        @keyframes gradient-wave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.9);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 8s ease-in-out infinite;
        }
        .animate-gradient-wave {
          animation: gradient-wave 12s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.2s infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;