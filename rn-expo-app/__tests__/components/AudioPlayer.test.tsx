import React from 'react';
import { render } from '@testing-library/react-native';
import AudioPlayer from '../../src/app/components/AudioPlayer';

describe('AudioPlayer', () => {
  it('mounts without crashing', () => {
    render(<AudioPlayer />);
  });
});

