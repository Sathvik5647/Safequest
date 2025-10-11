import React from 'react';
import { ArrowRight } from 'lucide-react';

const Dashboard = ({ user, startNewStory, setStage, goToBlog, goToCreateBlog }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, <span className="text-primary">{user.username || user.email}</span>!</h1>
        <p className="text-lg text-muted-foreground">What would you like to do today?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="p-2 flex flex-col items-center">
          <img
            src="/door.png"
            alt="Start New Adventure"
            onClick={startNewStory}
            className="w-[56rem] md:w-[64rem] lg:w-[72rem] h-auto cursor-pointer transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
          <h3 className="text-lg font-bold mt-4">Start New Adventure</h3>
        </div>
        <div className="p-2 flex flex-col items-center">
          <img
            src="/door.png"
            alt="Continue an Adventure"
            onClick={() => setStage('adventures')}
            className="w-[56rem] md:w-[64rem] lg:w-[72rem] h-auto cursor-pointer transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
          <h3 className="text-lg font-bold mt-4">Continue an Adventure</h3>
        </div>
        <div className="p-2 flex flex-col items-center">
          <img
            src="/door.png"
            alt="Share an Experience"
            onClick={goToCreateBlog}
            className="w-full max-w-[22rem] md:max-w-[24rem] lg:max-w-[26rem] h-auto cursor-pointer transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
          <h3 className="text-lg font-bold mt-4">Share an Experience</h3>
        </div>
      </div>

      <div className="text-center">
        <button onClick={goToBlog} className="inline-flex items-center gap-2 text-primary hover:underline font-semibold">
          <span>View Blogs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;