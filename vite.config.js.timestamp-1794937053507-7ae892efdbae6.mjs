// vite.config.js
import { defineConfig } from "file:///C:/Users/siddh/bharatlingo/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/siddh/bharatlingo/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\siddh\\bharatlingo";
function indicTtsPlugin() {
  const languageCodes = {
    hi: "hi",
    en: "en",
    mr: "mr",
    ta: "ta",
    te: "te",
    bn: "bn",
    pa: "pa",
    gu: "gu"
  };
  const memoryCache = /* @__PURE__ */ new Map();
  return {
    name: "indic-tts-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/tts")) {
          return next();
        }
        try {
          let text = "";
          let language = "hi";
          let rate = 1;
          if (req.method === "GET") {
            const parsedUrl = new URL(req.url, "http://localhost:5173");
            text = parsedUrl.searchParams.get("text") || "";
            language = parsedUrl.searchParams.get("lang") || parsedUrl.searchParams.get("language") || "hi";
            rate = parseFloat(parsedUrl.searchParams.get("rate")) || 1;
          } else if (req.method === "POST") {
            const bodyStr = await new Promise((resolve) => {
              let acc = "";
              req.on("data", (chunk) => {
                acc += chunk;
              });
              req.on("end", () => resolve(acc));
            });
            try {
              const body = JSON.parse(bodyStr);
              text = body.text || "";
              language = body.language || "hi";
              rate = parseFloat(body.rate) || 1;
            } catch {
            }
          }
          if (!text || !text.trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing text parameter" }));
            return;
          }
          const langCode = languageCodes[language.toLowerCase()] || "hi";
          const cacheKey = `${langCode}:${text.trim()}`;
          if (memoryCache.has(cacheKey)) {
            const cachedBuffer = memoryCache.get(cacheKey);
            res.statusCode = 200;
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.setHeader("X-TTS-Source", "memory_cache");
            res.end(cachedBuffer);
            return;
          }
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${langCode}&client=tw-ob`;
          const fetchRes = await fetch(ttsUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": "https://translate.google.com/"
            }
          });
          if (!fetchRes.ok) {
            throw new Error(`TTS upstream error: ${fetchRes.status}`);
          }
          const arrayBuf = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          if (buffer && buffer.length > 100) {
            memoryCache.set(cacheKey, buffer);
            res.statusCode = 200;
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.setHeader("X-TTS-Source", "indic_engine");
            res.end(buffer);
            return;
          }
          throw new Error("Received empty audio payload");
        } catch (err) {
          console.warn("[Indic TTS Dev Middleware Error]", err.message);
          next();
        }
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), indicTtsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-framer";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("lucide-react")) return "vendor-lucide";
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) return "vendor-react";
            return "vendor-misc";
          }
          if (id.includes("uiTranslations")) {
            return "ui-translations";
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzaWRkaFxcXFxiaGFyYXRsaW5nb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2lkZGhcXFxcYmhhcmF0bGluZ29cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NpZGRoL2JoYXJhdGxpbmdvL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbi8vIEhpZ2gtRmlkZWxpdHkgSW5kaWMgQXVkaW8gRW5naW5lIGZvciBMb2NhbCBWaXRlIERldiBTZXJ2ZXJcbmZ1bmN0aW9uIGluZGljVHRzUGx1Z2luKCkge1xuICBjb25zdCBsYW5ndWFnZUNvZGVzID0ge1xuICAgIGhpOiAnaGknLFxuICAgIGVuOiAnZW4nLFxuICAgIG1yOiAnbXInLFxuICAgIHRhOiAndGEnLFxuICAgIHRlOiAndGUnLFxuICAgIGJuOiAnYm4nLFxuICAgIHBhOiAncGEnLFxuICAgIGd1OiAnZ3UnLFxuICB9XG5cbiAgY29uc3QgbWVtb3J5Q2FjaGUgPSBuZXcgTWFwKClcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdpbmRpYy10dHMtZGV2LXBsdWdpbicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKCFyZXEudXJsPy5zdGFydHNXaXRoKCcvYXBpL3R0cycpKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKVxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgdGV4dCA9ICcnXG4gICAgICAgICAgbGV0IGxhbmd1YWdlID0gJ2hpJ1xuICAgICAgICAgIGxldCByYXRlID0gMS4wXG5cbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycpXG4gICAgICAgICAgICB0ZXh0ID0gcGFyc2VkVXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3RleHQnKSB8fCAnJ1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBwYXJzZWRVcmwuc2VhcmNoUGFyYW1zLmdldCgnbGFuZycpIHx8IHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuZ2V0KCdsYW5ndWFnZScpIHx8ICdoaSdcbiAgICAgICAgICAgIHJhdGUgPSBwYXJzZUZsb2F0KHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuZ2V0KCdyYXRlJykpIHx8IDEuMFxuICAgICAgICAgIH0gZWxzZSBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICBjb25zdCBib2R5U3RyID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgbGV0IGFjYyA9ICcnXG4gICAgICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuaykgPT4geyBhY2MgKz0gY2h1bmsgfSlcbiAgICAgICAgICAgICAgcmVxLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKGFjYykpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoYm9keVN0cilcbiAgICAgICAgICAgICAgdGV4dCA9IGJvZHkudGV4dCB8fCAnJ1xuICAgICAgICAgICAgICBsYW5ndWFnZSA9IGJvZHkubGFuZ3VhZ2UgfHwgJ2hpJ1xuICAgICAgICAgICAgICByYXRlID0gcGFyc2VGbG9hdChib2R5LnJhdGUpIHx8IDEuMFxuICAgICAgICAgICAgfSBjYXRjaCB7fVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghdGV4dCB8fCAhdGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNaXNzaW5nIHRleHQgcGFyYW1ldGVyJyB9KSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGxhbmdDb2RlID0gbGFuZ3VhZ2VDb2Rlc1tsYW5ndWFnZS50b0xvd2VyQ2FzZSgpXSB8fCAnaGknXG4gICAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBgJHtsYW5nQ29kZX06JHt0ZXh0LnRyaW0oKX1gXG5cbiAgICAgICAgICBpZiAobWVtb3J5Q2FjaGUuaGFzKGNhY2hlS2V5KSkge1xuICAgICAgICAgICAgY29uc3QgY2FjaGVkQnVmZmVyID0gbWVtb3J5Q2FjaGUuZ2V0KGNhY2hlS2V5KVxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDBcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhdWRpby9tcGVnJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHVibGljLCBtYXgtYWdlPTg2NDAwJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1gtVFRTLVNvdXJjZScsICdtZW1vcnlfY2FjaGUnKVxuICAgICAgICAgICAgcmVzLmVuZChjYWNoZWRCdWZmZXIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGZXRjaCBuYXR1cmFsIEluZGljIGF1ZGlvIGZyb20gaGlnaC1maWRlbGl0eSBJbmRpYyBlbmdpbmVcbiAgICAgICAgICBjb25zdCB0dHNVcmwgPSBgaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbS90cmFuc2xhdGVfdHRzP2llPVVURi04JnE9JHtlbmNvZGVVUklDb21wb25lbnQodGV4dC50cmltKCkpfSZ0bD0ke2xhbmdDb2RlfSZjbGllbnQ9dHctb2JgXG4gICAgICAgICAgY29uc3QgZmV0Y2hSZXMgPSBhd2FpdCBmZXRjaCh0dHNVcmwsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMC4wLjAuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgICAgICAgJ1JlZmVyZXInOiAnaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbS8nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKCFmZXRjaFJlcy5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUVFMgdXBzdHJlYW0gZXJyb3I6ICR7ZmV0Y2hSZXMuc3RhdHVzfWApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgYXJyYXlCdWYgPSBhd2FpdCBmZXRjaFJlcy5hcnJheUJ1ZmZlcigpXG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oYXJyYXlCdWYpXG5cbiAgICAgICAgICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgIG1lbW9yeUNhY2hlLnNldChjYWNoZUtleSwgYnVmZmVyKVxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDBcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhdWRpby9tcGVnJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHVibGljLCBtYXgtYWdlPTg2NDAwJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1gtVFRTLVNvdXJjZScsICdpbmRpY19lbmdpbmUnKVxuICAgICAgICAgICAgcmVzLmVuZChidWZmZXIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlY2VpdmVkIGVtcHR5IGF1ZGlvIHBheWxvYWQnKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tJbmRpYyBUVFMgRGV2IE1pZGRsZXdhcmUgRXJyb3JdJywgZXJyLm1lc3NhZ2UpXG4gICAgICAgICAgbmV4dCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgaW5kaWNUdHNQbHVnaW4oKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZyYW1lci1tb3Rpb24nKSkgcmV0dXJuICd2ZW5kb3ItZnJhbWVyJ1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc3VwYWJhc2UnKSkgcmV0dXJuICd2ZW5kb3Itc3VwYWJhc2UnXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2x1Y2lkZS1yZWFjdCcpKSByZXR1cm4gJ3ZlbmRvci1sdWNpZGUnXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbScpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXItZG9tJykpIHJldHVybiAndmVuZG9yLXJlYWN0J1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbWlzYydcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd1aVRyYW5zbGF0aW9ucycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3VpLXRyYW5zbGF0aW9ucydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdRLFNBQVMsb0JBQW9CO0FBQ3JTLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsU0FBUyxpQkFBaUI7QUFDeEIsUUFBTSxnQkFBZ0I7QUFBQSxJQUNwQixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsRUFDTjtBQUVBLFFBQU0sY0FBYyxvQkFBSSxJQUFJO0FBRTVCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFRO0FBQ3RCLGFBQU8sWUFBWSxJQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDL0MsWUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLFVBQVUsR0FBRztBQUNwQyxpQkFBTyxLQUFLO0FBQUEsUUFDZDtBQUVBLFlBQUk7QUFDRixjQUFJLE9BQU87QUFDWCxjQUFJLFdBQVc7QUFDZixjQUFJLE9BQU87QUFFWCxjQUFJLElBQUksV0FBVyxPQUFPO0FBQ3hCLGtCQUFNLFlBQVksSUFBSSxJQUFJLElBQUksS0FBSyx1QkFBdUI7QUFDMUQsbUJBQU8sVUFBVSxhQUFhLElBQUksTUFBTSxLQUFLO0FBQzdDLHVCQUFXLFVBQVUsYUFBYSxJQUFJLE1BQU0sS0FBSyxVQUFVLGFBQWEsSUFBSSxVQUFVLEtBQUs7QUFDM0YsbUJBQU8sV0FBVyxVQUFVLGFBQWEsSUFBSSxNQUFNLENBQUMsS0FBSztBQUFBLFVBQzNELFdBQVcsSUFBSSxXQUFXLFFBQVE7QUFDaEMsa0JBQU0sVUFBVSxNQUFNLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDN0Msa0JBQUksTUFBTTtBQUNWLGtCQUFJLEdBQUcsUUFBUSxDQUFDLFVBQVU7QUFBRSx1QkFBTztBQUFBLGNBQU0sQ0FBQztBQUMxQyxrQkFBSSxHQUFHLE9BQU8sTUFBTSxRQUFRLEdBQUcsQ0FBQztBQUFBLFlBQ2xDLENBQUM7QUFDRCxnQkFBSTtBQUNGLG9CQUFNLE9BQU8sS0FBSyxNQUFNLE9BQU87QUFDL0IscUJBQU8sS0FBSyxRQUFRO0FBQ3BCLHlCQUFXLEtBQUssWUFBWTtBQUM1QixxQkFBTyxXQUFXLEtBQUssSUFBSSxLQUFLO0FBQUEsWUFDbEMsUUFBUTtBQUFBLFlBQUM7QUFBQSxVQUNYO0FBRUEsY0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssR0FBRztBQUN6QixnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxnQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8seUJBQXlCLENBQUMsQ0FBQztBQUMzRDtBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxXQUFXLGNBQWMsU0FBUyxZQUFZLENBQUMsS0FBSztBQUMxRCxnQkFBTSxXQUFXLEdBQUcsUUFBUSxJQUFJLEtBQUssS0FBSyxDQUFDO0FBRTNDLGNBQUksWUFBWSxJQUFJLFFBQVEsR0FBRztBQUM3QixrQkFBTSxlQUFlLFlBQVksSUFBSSxRQUFRO0FBQzdDLGdCQUFJLGFBQWE7QUFDakIsZ0JBQUksVUFBVSxnQkFBZ0IsWUFBWTtBQUMxQyxnQkFBSSxVQUFVLGlCQUFpQix1QkFBdUI7QUFDdEQsZ0JBQUksVUFBVSxnQkFBZ0IsY0FBYztBQUM1QyxnQkFBSSxJQUFJLFlBQVk7QUFDcEI7QUFBQSxVQUNGO0FBR0EsZ0JBQU0sU0FBUyx5REFBeUQsbUJBQW1CLEtBQUssS0FBSyxDQUFDLENBQUMsT0FBTyxRQUFRO0FBQ3RILGdCQUFNLFdBQVcsTUFBTSxNQUFNLFFBQVE7QUFBQSxZQUNuQyxTQUFTO0FBQUEsY0FDUCxjQUFjO0FBQUEsY0FDZCxXQUFXO0FBQUEsWUFDYjtBQUFBLFVBQ0YsQ0FBQztBQUVELGNBQUksQ0FBQyxTQUFTLElBQUk7QUFDaEIsa0JBQU0sSUFBSSxNQUFNLHVCQUF1QixTQUFTLE1BQU0sRUFBRTtBQUFBLFVBQzFEO0FBRUEsZ0JBQU0sV0FBVyxNQUFNLFNBQVMsWUFBWTtBQUM1QyxnQkFBTSxTQUFTLE9BQU8sS0FBSyxRQUFRO0FBRW5DLGNBQUksVUFBVSxPQUFPLFNBQVMsS0FBSztBQUNqQyx3QkFBWSxJQUFJLFVBQVUsTUFBTTtBQUNoQyxnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLFVBQVUsZ0JBQWdCLFlBQVk7QUFDMUMsZ0JBQUksVUFBVSxpQkFBaUIsdUJBQXVCO0FBQ3RELGdCQUFJLFVBQVUsZ0JBQWdCLGNBQWM7QUFDNUMsZ0JBQUksSUFBSSxNQUFNO0FBQ2Q7QUFBQSxVQUNGO0FBRUEsZ0JBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUFBLFFBQ2hELFNBQVMsS0FBSztBQUNaLGtCQUFRLEtBQUssb0NBQW9DLElBQUksT0FBTztBQUM1RCxlQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQztBQUFBLEVBQ25DLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsZ0JBQUksR0FBRyxTQUFTLGVBQWUsRUFBRyxRQUFPO0FBQ3pDLGdCQUFJLEdBQUcsU0FBUyxXQUFXLEVBQUcsUUFBTztBQUNyQyxnQkFBSSxHQUFHLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFDeEMsZ0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxLQUFLLEdBQUcsU0FBUyxrQkFBa0IsRUFBRyxRQUFPO0FBQ2hHLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLGdCQUFnQixHQUFHO0FBQ2pDLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
