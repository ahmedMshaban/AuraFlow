import { defineConfig, createSystem, defaultConfig } from '@chakra-ui/react';

export const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

export default createSystem(defaultConfig, config);
