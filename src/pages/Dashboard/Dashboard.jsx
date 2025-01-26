// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import './Dashboard.css'; // Ensure this CSS file contains styles for the dashboard layout

// Import individual components
import MonsterInfo from './MonsterInfo';
import QuickStats from './QuickStats';
import RecentActivities from './RecentActivities';
import QuickActions from './QuickActions';
import FeaturedContent from './FeaturedContent';
import NewsUpdates from './NewsUpdates';
import TrainingChat from './TrainingChat';

const Dashboard = () => {
  // Placeholder data; replace with dynamic data from backend or state management
  const monster = {
    name: 'Shadowfang',
    personality: 'Fearless and cunning.',
    abilities: ['Fire Breath', 'Invisibility'],
    strengths: ['High attack power'],
    weaknesses: ['Vulnerable to ice attacks'],
    image: '/monster-placeholder.png', // Replace with dynamic image source
  };

  const quickStats = {
    totalMonsters: 10,
    battlesParticipated: 25,
    wins: 15,
    losses: 10,
    cryptoBalance: '2 ETH',
  };

  const recentActivities = [
    { id: 1, type: 'Battle', description: 'Shadowfang defeated FireDragon', time: '2 hours ago' },
    { id: 2, type: 'Marketplace', description: 'Sold Mystic Unicorn for 1.5 ETH', time: '5 hours ago' },
    { id: 3, type: 'Team', description: 'Joined Guild "Chaos Masters"', time: '1 day ago' },
    // Add more activities as needed
  ];

  const featuredContent = [
    {
      id: 1,
      title: 'Holiday Special Event',
      description: 'Join the festive battles and earn exclusive rewards!',
      image: '/featured-event1.png',
    },
    {
      id: 2,
      title: 'Top Monster Spotlight',
      description: 'Check out the reigning champion, Shadowfang!',
      image: '/featured-event2.png',
    },
    // Add more featured items as needed
  ];

  const newsUpdates = [
    { id: 1, title: 'Version 1.2 Released', description: 'New environments and abilities added!', time: '3 days ago' },
    { id: 2, title: 'Upcoming Tournament', description: 'Register now for the Chaos Masters Cup!', time: '1 week ago' },
    // Add more news items as needed
  ];

  return (
    <div className="dashboard">
      {/* Monster Information Section */}
      <MonsterInfo monster={monster} />

      {/* Quick Stats Section */}
      <QuickStats stats={quickStats} />

      {/* Recent Activities Section */}
      <RecentActivities activities={recentActivities} />

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Featured Content Section */}
      <FeaturedContent featured={featuredContent} />

      {/* News & Updates Section */}
      <NewsUpdates news={newsUpdates} />

      {/* Training Chat Section */}
      <TrainingChat />
    </div>
  );
};

export default Dashboard;
