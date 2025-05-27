import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Required for React

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Changed from '.' to process.cwd()
  
  return {
    // 1. Add React plugin
    plugins: [react()],
    
    // 2. Environment variables
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Removed duplicate API_KEY definition
    },
    
    // 3. Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Better to point to src directory
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'], // Add TypeScript extensions
    },
    
    // 4. Build configuration
    build: {
      outDir: 'dist', // Explicit output directory
      emptyOutDir: true, // Clear output directory before build
      sourcemap: true, // Helpful for debugging
    },
    
    // 5. Server configuration
    server: {
      port: 3000,
      open: true,
    },
  };
});