import React from 'react';
import { Home } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const AdventuresList = ({ userStories, continueStory, currentStoryId, onNavigate }) => {
  const inProgressAdventures = userStories.filter(s => !s.isComplete);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center p-4 relative">
      <AnimatedBackground />
      
      <div className="max-w-5xl mx-auto animate-fade-in relative z-10 w-full">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <Home size={18} />
            <span>Back to Home</span>
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-6">Your Adventures</h2>
        {inProgressAdventures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressAdventures.map(story => (
              <button
                key={story._id}
                onClick={() => continueStory(story)}
                className={`p-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-left h-40 flex flex-col justify-between hover:bg-white/20 ${currentStoryId === story._id ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}`}
              >
                <div>
                  <h4 className="text-lg font-bold">{story.initialInterests.join(', ')} Adventure</h4>
                  <p className="text-white/70 mt-1 text-sm">
                    Progress: {story.fullStory.length} step(s)
                  </p>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Last played: {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-white bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-lg">You have no adventures in progress. Start a new one from the Home screen!</div>
        )}
      </div>
    </div>
  );
};

export default AdventuresList;