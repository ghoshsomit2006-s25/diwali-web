/**
 * Utility to parse various YouTube & YouTube Music URLs
 */

export interface ParsedYouTubeLink {
  videoId: string | null;
  playlistId: string | null;
}

export function parseYouTubeUrl(input: string): ParsedYouTubeLink | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // If user pasted bare 11-char video ID (e.g. kXYiU_JCYtU)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed, playlistId: null };
  }

  try {
    // Add protocol if missing
    const urlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(urlString);

    let videoId: string | null = null;
    let playlistId: string | null = null;

    // Check query param v=
    if (url.searchParams.has('v')) {
      videoId = url.searchParams.get('v');
    }

    // Check query param list=
    if (url.searchParams.has('list')) {
      playlistId = url.searchParams.get('list');
    }

    // Short links: youtu.be/VIDEO_ID
    if (url.hostname.includes('youtu.be')) {
      const pathPart = url.pathname.slice(1).split('/')[0];
      if (pathPart && /^[a-zA-Z0-9_-]{11}$/.test(pathPart)) {
        videoId = pathPart;
      }
    }

    // Embed links: youtube.com/embed/VIDEO_ID
    if (url.pathname.includes('/embed/')) {
      const parts = url.pathname.split('/embed/');
      if (parts[1]) {
        const id = parts[1].split(/[?&/]/)[0];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          videoId = id;
        }
      }
    }

    // Shorts links: youtube.com/shorts/VIDEO_ID
    if (url.pathname.includes('/shorts/')) {
      const parts = url.pathname.split('/shorts/');
      if (parts[1]) {
        const id = parts[1].split(/[?&/]/)[0];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          videoId = id;
        }
      }
    }

    if (videoId || playlistId) {
      return { videoId, playlistId };
    }
  } catch (err) {
    // URL constructor failed, attempt regex matching
    const idMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (idMatch && idMatch[1]) {
      return { videoId: idMatch[1], playlistId: null };
    }
  }

  return null;
}
