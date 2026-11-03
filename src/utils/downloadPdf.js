/**
 * Cross-browser reliable PDF downloader
 * Solves download issues on macOS Safari, iOS, Chrome, Edge, Android, and SPA hostings.
 * - Validates PDF binary signature (%PDF-)
 * - Prevents saving SPA HTML fallbacks as corrupted PDFs
 * - Automatically falls back to the backend streaming endpoint (https://sama-api.thesama.in)
 */
export const downloadPdf = async (e, relativeOrAbsoluteUrl, fileName) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  const cleanName = (fileName || relativeOrAbsoluteUrl || 'document.pdf')
    .split('/')
    .pop()
    .replace(/\.pdf$/i, '');
  
  const apiUrl = `https://sama-api.thesama.in/api/public/download-report?report=${encodeURIComponent(cleanName)}`;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  // On mobile browsers, direct navigation to the streaming API triggers native PDF download/viewing
  if (isMobile) {
    window.location.href = apiUrl;
    return;
  }

  const publicUrl = process.env.PUBLIC_URL || '';
  const url = relativeOrAbsoluteUrl.startsWith('http')
    ? relativeOrAbsoluteUrl
    : `${publicUrl}${relativeOrAbsoluteUrl.startsWith('/') ? '' : '/'}${relativeOrAbsoluteUrl}`;

  try {
    const response = await fetch(url, { method: 'GET', cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();

    // Verify PDF binary signature (%PDF- = 0x25, 0x50, 0x44, 0x46, 0x2D)
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerString = String.fromCharCode(...headerBytes);
    const isPdfBinary = headerString === '%PDF-';

    if (!isPdfBinary || contentType.includes('text/html')) {
      console.warn('SPA rewrite detected (HTML returned instead of PDF). Streaming from API fallback:', apiUrl);
      window.location.href = apiUrl;
      return;
    }

    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName || `${cleanName}.pdf`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.warn('Direct fetch failed, redirecting to streaming API:', err);
    window.location.href = apiUrl;
  }
};

export default downloadPdf;
