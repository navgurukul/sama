/**
 * Cross-browser reliable PDF downloader
 * Solves download issues on macOS Safari, iOS, Chrome, Edge, Android, and SPA hostings.
 * - Detects and prevents saving SPA 404 HTML fallback as corrupted PDF
 * - Validates PDF binary signature (%PDF-)
 * - Provides graceful direct download on mobile and desktop
 */
export const downloadPdf = async (e, relativeOrAbsoluteUrl, fileName) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  // Ensure full URL if relative
  const publicUrl = process.env.PUBLIC_URL || '';
  const url = relativeOrAbsoluteUrl.startsWith('http')
    ? relativeOrAbsoluteUrl
    : `${publicUrl}${relativeOrAbsoluteUrl.startsWith('/') ? '' : '/'}${relativeOrAbsoluteUrl}`;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  // On mobile browsers, direct window navigation triggers native PDF viewer & downloader reliably
  if (isMobile) {
    const mobileLink = document.createElement('a');
    mobileLink.href = url;
    mobileLink.target = '_blank';
    mobileLink.rel = 'noopener noreferrer';
    if (fileName) {
      mobileLink.setAttribute('download', fileName);
    }
    document.body.appendChild(mobileLink);
    mobileLink.click();
    document.body.removeChild(mobileLink);
    return;
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
      // Fallback: try direct window open
      window.open(url, '_blank', 'noopener,noreferrer');
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
    console.warn('Direct blob download failed, falling back to window.open:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export default downloadPdf;
