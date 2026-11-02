/**
 * Cross-browser reliable PDF downloader
 * Solves download issues on macOS Safari, iOS, Chrome, Edge, and laptops with download restrictions.
 * - Fetches PDF as a blob to bypass browser PDF preview interception and OS download restrictions
 * - Forces direct download via temporary anchor element with blob URL
 * - Graceful fallback: opens cleanly in a new tab if blob fetch fails or is blocked
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

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const blob = await response.blob();
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
    }, 2000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to window.open:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export default downloadPdf;
