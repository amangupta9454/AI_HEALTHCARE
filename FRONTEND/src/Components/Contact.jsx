import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    preferredDate: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!formData.dob.trim()) {
      newErrors.dob = 'Date of Birth is required';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSending(true);
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      formData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
      .then(() => {
        setStatus('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          dob: '',
          preferredDate: '',
          subject: '',
          message: ''
        });
        setIsSending(false);
      })
      .catch(() => {
        setStatus('Failed to send message. Please try again.');
        setIsSending(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-cyan-900 to-green-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl bg-gray-700/90 backdrop-blur-md border border-blue-500 rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl">
        <h2 className="text-4xl md:text-5xl font-bold text-yellow-500 text-center mb-6">
          Patient Contact Form
        </h2>
        <p className="text-center text-white mb-10">
          Please fill out the form below. We’ll get in touch with you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-white mb-1">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 placeholder-blue-400 focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 placeholder-blue-400 focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-white mb-1">Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 placeholder-blue-400 focus:ring-2 focus:ring-blue-500"
              placeholder="+1 234 567 8900"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="block text-white mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label htmlFor="preferredDate" className="block text-white mb-1">Preferred Appointment Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-white mb-1">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 text-blue-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Appointment Request">Appointment Request</option>
              <option value="Medical Concern">Medical Concern</option>
              <option value="Billing Question">Billing Question</option>
            </select>
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-white mb-1">Message</label>
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your request or concern..."
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSending}
              className={`w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 transition duration-300 flex items-center justify-center ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                'Submit Form'
              )}
            </button>

            {status && (
              <p
                className={`text-center mt-4 text-sm font-medium ${
                  status.includes('successfully') ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {status}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
