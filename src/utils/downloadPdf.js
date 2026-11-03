/**
 * Cross-browser reliable PDF downloader
 * Solves download issues on macOS Safari, iOS, Chrome, Edge, Android, and SPA hostings.
 * - Detects and prevents saving SPA 404 HTML fallback as corrupted PDF
 * - Validates PDF binary signature (%PDF-)
 * - Provides graceful direct download on mobile and desktop
 */
export const downloadPdf = async (e, relativeOrAbsoluteUrl, fileName) => {
  // Ensure full URL if relative
  const publicUrl = process.env.PUBLIC_URL || '';
  const url = relativeOrAbsoluteUrl.startsWith('http')
    ? relativeOrAbsoluteUrl
    : `${publicUrl}${relativeOrAbsoluteUrl.startsWith('/') ? '' : '/'}${relativeOrAbsoluteUrl}`;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  // On mobile browsers, allow native anchor event to execute directly.
  // This opens the PDF in iOS Safari's native reader / downloads in Android Chrome cleanly
  // without triggering asynchronous popup blocker warnings.
  if (isMobile) {
    return;
  }

  if (e && e.preventDefault) {
    e.preventDefault();
  }

  try {
    const response = await fetch(url, { method: 'GET', cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();

    // Verify PDF binary signature (%PDF- = 0x25, 0x50, 0x44, 0x46, 0x2D)
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerString = String.fromCharCode(...headerBytes);
    const isPdfBinary = headerString === '%PDF-';

    if (!isPdfBinary || contentType.includes('text/html')) {
      console.warn('Server returned non-PDF or HTML fallback for:', url);
      // Fallback: direct browser navigation
      window.location.assign(url);
      return;
    }

    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName || 'document.pdf');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to direct location assign:', err);
    window.location.assign(url);
  }
};

export default downloadPdf;
