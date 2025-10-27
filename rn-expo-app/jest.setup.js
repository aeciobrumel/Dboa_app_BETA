import '@testing-library/jest-native/extend-expect';

// Mock do expo-av para testes
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      stopAsync: jest.fn(),
      unloadAsync: jest.fn(),
      setIsLoopingAsync: jest.fn(),
      setVolumeAsync: jest.fn()
    })),
    setAudioModeAsync: jest.fn()
  }
}));

