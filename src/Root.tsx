import React from 'react';
import { Composition } from 'remotion';
import { DemoShowcaseComposition } from '../projects/demo-showcase/05_Code/Composition';
import { DzinrComposition } from '../projects/dzinr/05_Code/Composition';
import { DzinrReferenceVideo } from './shared/components/DzinrReference';
import { DzinrMotionComposition } from '../projects/dzinr_motion/05_Code/Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="dzinr-motion"
        component={DzinrMotionComposition}
        durationInFrames={331}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ disableAudio: false }}
      />
      <Composition
        id="DemoShowcase"
        component={DemoShowcaseComposition}
        durationInFrames={190}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DzinrShowcase"
        component={DzinrComposition}
        durationInFrames={332}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="dzinr"
        component={DzinrComposition}
        durationInFrames={332}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DzinrReference"
        component={DzinrReferenceVideo}
        durationInFrames={332}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

