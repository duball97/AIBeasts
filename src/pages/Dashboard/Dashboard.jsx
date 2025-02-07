// src/components/Dashboard/Dashboard.jsx
import React from "react";
import "./Dashboard.css"; // Ensure this CSS file contains styles for the dashboard layout

// Import individual components
import MonsterInfo from "./MonsterInfo"; // Import the updated MonsterInfo
import QuickStats from "./QuickStats";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";
import FeaturedContent from "./FeaturedContent";
import NewsUpdates from "./NewsUpdates";
import TrainingChat from "./TrainingChat";

const Dashboard = () => {
  const quickStats = {
    totalMonsters: 1,
    battlesParticipated: 15,
    wins: 15,
    losses: 10,
    cryptoBalance: "2 ETH",
  };

  const recentActivities = [
    { id: 1, type: "Battle", description: "Shadowfang defeated FireDragon", time: "2 hours ago" },
    { id: 2, type: "Marketplace", description: "Sold Mystic Unicorn for 1.5 ETH", time: "5 hours ago" },
    { id: 3, type: "Team", description: 'Joined Guild "Chaos Masters"', time: "1 day ago" },
  ];

  const featuredContent = [
    {
      id: 1,
      title: "Holiday Special Event",
      description: "Join the festive battles and earn exclusive rewards!",
      image: "/featured-event1.png",
    },
    {
      id: 2,
      title: "Top Monster Spotlight",
      description: "Check out the reigning champion, Shadowfang!",
      image: "/featured-event2.png",
    },
  ];

  const newsUpdates = [
    { id: 1, title: "Version 1.2 Released", description: "New environments and abilities added!", time: "3 days ago" },
    { id: 2, title: "Upcoming Tournament", description: "Register now for the Chaos Masters Cup!", time: "1 week ago" },
  ];

  return (
    <div className="dashboard">
      {/* Monster Information Section */}
      <div className="stats-activities-container">
      
      <TrainingChat />
     </div>
      <div className="stats-activities-container">
      {/* News & Updates Section */}
      <NewsUpdates news={newsUpdates} />
      <RecentActivities activities={recentActivities} />
      <QuickStats stats={quickStats} />
      
      </div>
      
    </div>
  );
};

export default Dashboard;
