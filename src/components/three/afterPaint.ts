/**
 * Resolves once the page's own content has painted WITH its fonts (the text is the LCP), then after
 * an idle slice, so a 3D chunk and its models never compete with the content for bandwidth or CPU.
 * Used by the landing's Scene3D and the /works RelicViewer before they fetch three.js.
 */
export async function afterContentPaint(): Promise<void> {
  if (document.readyState !== 'complete')
    await new Promise((r) => addEventListener('load', r, { once: true }));
  await document.fonts.ready;
  // the browser's own Largest Contentful Paint entry (buffered: already there after a page swap)
  await new Promise<void>((resolve) => {
    if (!PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint'))
      return resolve();
    const cap = setTimeout(resolve, 3000);
    const po = new PerformanceObserver(() => {
      po.disconnect();
      clearTimeout(cap);
      resolve();
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise<void>((resolve) =>
    'requestIdleCallback' in window
      ? requestIdleCallback(() => resolve(), { timeout: 1500 })
      : setTimeout(resolve, 200),
  );
}
