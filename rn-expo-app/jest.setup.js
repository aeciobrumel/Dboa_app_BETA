import '@testing-library/react-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do expo-av para testes
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(undefined),
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined)
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid')
}));
