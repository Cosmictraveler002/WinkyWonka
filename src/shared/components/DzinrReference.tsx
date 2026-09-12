import React from 'react';
import { Video, staticFile } from 'remotion';

export const DzinrReferenceVideo: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#000000',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Video
        src={staticFile('projects/dzinr/dzinr-Old.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};
