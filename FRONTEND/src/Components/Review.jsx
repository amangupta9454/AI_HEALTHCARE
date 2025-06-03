import React, { useState } from 'react';
import axios from 'axios';
import Harish from "../assets/harish.jpg";
import heroImage from "../assets/heroImage.png";
import Sac from "../assets/sac.jpg";
import himanshu from "../assets/himanshu.jpg";
const Review = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'HARISH JAYVEER SINGH',
      description:
        'The care I received at this hospital was exceptional. The doctors were highly skilled, and the nursing staff was compassionate and attentive. From diagnosis to recovery, every step was handled with professionalism. I’m truly grateful for their support during my surgery.',
      photo: Harish,
    },
    {
      id: 2,
      name: 'AMAN GUPTA',
      description:
        'This hospital provided outstanding service during my treatment. The facilities are state-of-the-art, and the staff made me feel comfortable throughout my stay. The doctors took time to explain everything clearly, which helped ease my concerns.',
      photo: heroImage,
    },
    {
      id: 3,
      name: 'HIMANSHU GUPTA',
      description:
        'I had an excellent experience at this hospital. The emergency department was quick to respond, and the care team was incredibly supportive. Their attention to detail and follow-up care made my recovery smooth and stress-free. Highly recommend!',
      photo: himanshu,
    },
    {
      id: 4,
      name: 'SACHCHIDANAND YADAV',
      description:
        'The maternity ward at this hospital is top-notch. The staff was caring and professional, ensuring my wife and newborn were well looked after. The facilities were clean, and the doctors provided excellent guidance throughout the process.',
      photo: Sac,
    },
  ]);

 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // validateForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    // validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return;

    const formSubmission = new FormData();
    formSubmission.append('name', formData.name);
    formSubmission.append('description', formData.description);
    formSubmission.append('photo', formData.photo);

    try {
      await axios.post('https://getform.io/f/bgdllgva', formSubmission, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReviews([
        ...reviews,
        {
          id: reviews.length + 1,
          name: formData.name,
          description: formData.description,
          photo: URL.createObjectURL(formData.photo),
        },
      ]);
      setFormData({ name: '', description: '', photo: null });
      setErrors({});
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 pt-16">
          Share Your Review
        </h1>
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 mb-12 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        >
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-blue-200 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="photo" className="block text-sm font-semibold text-blue-200 mb-2">
              Upload Your Photo
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-4 bg-transparent border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 transition duration-200"
            />
            {errors.photo && <p className="text-red-400 text-sm mt-2">{errors.photo}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-semibold text-blue-200 mb-2">
              Your Experience
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-4 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
              rows="6"
              placeholder="Share your experience (minimum 20 words)"
            ></textarea>
            {errors.description && (
              <p className="text-red-400 text-sm mt-2">{errors.description}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 rounded-lg text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Submit Review
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
            >
              <img
                src={review.photo}
                alt={review.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-blue-300/50"
              />
              <h2 className="text-xl font-bold text-center text-blue-100 mb-3">{review.name}</h2>
              <p className="text-gray-200 text-sm text-center leading-relaxed">{review.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;