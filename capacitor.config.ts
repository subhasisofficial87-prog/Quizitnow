import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quizitnow.app',
  appName: 'QuizItNow',
  // `next build` with `output: 'export'` writes static HTML to `out/`.
  webDir: 'out',
  server: {
    // `https` scheme is required so Supabase's localStorage-backed auth
    // persists across app restarts (WebView treats `http://localhost` as
    // an insecure origin and clears storage).
    androidScheme: 'https',
  },
};

export default config;
