import { chromium } from 'playwright';

async function measureProductionPerformance() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set up CDPSession for performance metrics
  const client = await context.newCDPSession(page);
  await client.send('Performance.enable');

  const requests = [];
  page.on('response', async (res) => {
    const url = res.url();
    const headers = res.headers();
    const contentLength = headers['content-length'] ? parseInt(headers['content-length']) : 0;
    try {
      const buffer = await res.buffer().catch(() => null);
      const size = buffer ? buffer.length : contentLength;
      requests.push({ url, status: res.status(), size, contentType: headers['content-type'] || '' });
    } catch (e) {
      requests.push({ url, status: res.status(), size: contentLength, contentType: headers['content-type'] || '' });
    }
  });

  const startTime = Date.now();
  await page.goto('http://localhost:4173/dashboard', { waitUntil: 'networkidle' });

  // Evaluate browser Performance API metrics
  const metrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const fcpEntry = paint.find(p => p.name === 'first-contentful-paint');
    
    // Measure LCP using PerformanceObserver
    let lcp = 0;
    let cls = 0;
    const resources = performance.getEntriesByType('resource');

    return {
      fcp: fcpEntry ? fcpEntry.startTime : 0,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadTime: nav.loadEventEnd - nav.startTime,
      duration: nav.duration,
      transferSize: nav.transferSize || 0,
      decodedBodySize: nav.decodedBodySize || 0,
      resourceCount: resources.length,
      resources: resources.map(r => ({ name: r.name, duration: r.duration, transferSize: r.transferSize, initiatorType: r.initiatorType })),
    };
  });

  // Get CDP Performance Metrics
  const cdpMetrics = await client.send('Performance.getMetrics');
  const metricsObj = {};
  for (const m of cdpMetrics.metrics) {
    metricsObj[m.name] = m.value;
  }

  await browser.close();

  console.log('=== PRODUCTION PREVIEW PERFORMANCE REPORT ===');
  console.log('FCP (First Contentful Paint):', (metrics.fcp).toFixed(2), 'ms');
  console.log('DOM Content Loaded:', (metrics.domContentLoaded).toFixed(2), 'ms');
  console.log('Page Load Duration:', (metrics.loadTime).toFixed(2), 'ms');
  console.log('CDP Task Duration (Main-Thread Work):', (metricsObj.TaskDuration * 1000).toFixed(2), 'ms');
  console.log('CDP JS Heap Used:', (metricsObj.JSHeapUsedSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('CDP Layout Duration:', (metricsObj.LayoutDuration * 1000).toFixed(2), 'ms');
  console.log('CDP Recalc Style Duration:', (metricsObj.RecalculateStyleDuration * 1000).toFixed(2), 'ms');
  console.log('CDP Script Duration:', (metricsObj.ScriptDuration * 1000).toFixed(2), 'ms');

  console.log('\n=== TRANSFERRED RESOURCE BREAKDOWN ===');
  let totalBytes = 0;
  requests.forEach(r => {
    totalBytes += r.size;
    const filename = r.url.split('/').pop().split('?')[0];
    if (r.size > 5000) {
      console.log(`- ${filename || r.url}: ${(r.size / 1024).toFixed(2)} KB`);
    }
  });
  console.log(`TOTAL TRANSFERRED: ${(totalBytes / 1024).toFixed(2)} KB`);
}

measureProductionPerformance().catch(err => console.error('Error running performance audit:', err));
