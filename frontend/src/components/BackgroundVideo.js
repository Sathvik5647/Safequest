import React from 'react';

const BackgroundVideo = () => {
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <video
        className="fixed inset-0 w-full h-full object-cover -z-20"
        src="/fianal_background_video.mp4"
        autoPlay
        loop
        muted
        preload="auto"
        playsInline
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
    </div>
  );
};

export default BackgroundVideo;


