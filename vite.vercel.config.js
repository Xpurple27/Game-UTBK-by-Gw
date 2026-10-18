import {defineConfig} from 'vite';
export default defineConfig({define:{'import.meta.env.VITE_GUEST_ONLY':'true'},publicDir:false,build:{outDir:'dist-vercel',rollupOptions:{output:{manualChunks:id=>id.includes('/phaser/')?'phaser':undefined}}}});
