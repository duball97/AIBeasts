// src/components/Dashboard/RecentActivities.jsx
import React from 'react';
import './RecentActivities.css';

const RecentActivities = ({ activities }) => {
  return (
    <div className="recent-activities">
      <h3>Recent Activities</h3>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            <span className={`activity-type ${activity.type.toLowerCase()}`}>
              {activity.type}
            </span>
            <span className="activity-description">{activity.description}</span>
            <span className="activity-time">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivities;
