// src/components/Dashboard/FeaturedContent.jsx
import React from 'react';
import './FeaturedContent.css'; // Ensure this CSS file exists

const FeaturedContent = ({ featured }) => {
  return (
    <div className="featured-content">
      <h3>Featured Content</h3>
      <div className="featured-grid">
        {featured.map(item => (
          <div key={item.id} className="featured-item">
            <img src={item.image} alt={item.title} className="featured-image" />
            <div className="featured-info">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedContent;
