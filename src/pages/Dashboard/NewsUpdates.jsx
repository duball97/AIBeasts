// src/components/Dashboard/NewsUpdates.jsx
import React from 'react';
import './NewsUpdates.css'; // Ensure this CSS file exists

const NewsUpdates = ({ news }) => {
  return (
    <div className="news-updates">
      <h3>News & Updates</h3>
      <ul>
        {news.map(item => (
          <li key={item.id}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <span className="news-time">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsUpdates;
