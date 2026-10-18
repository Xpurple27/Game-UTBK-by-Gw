import {defineConfig} from 'vite';
export default defineConfig({base:'/game/',publicDir:false,build:{outDir:'public/game',emptyOutDir:true,rollupOptions:{output:{manualChunks:(id)=>id.includes('/phaser/')?'phaser':undefined}}}});
