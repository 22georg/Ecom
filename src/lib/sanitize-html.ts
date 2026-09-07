/**
 * Lightweight, zero-dependency HTML Sanitizer for XSS Protection.
 * Whitelists standard text formatting tags and strips script/event-handler attributes.
 */
export function sanitizeHtml(rawHtml?: string | null): string {
  if (!rawHtml) return '';

  let sanitized = rawHtml;

  // 1. Remove dangerous blocks: <script>, <style>, <iframe>, <object>, <embed>, <form>
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // 2. Remove self-closing dangerous tags
  sanitized = sanitized.replace(/<(script|iframe|object|embed|input|form)[^>]*\/?>/gi, '');

  // 3. Remove inline event handlers (e.g., onload=..., onerror=..., onclick=...)
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(['"])[^'"]*\1/gi, '');
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*[^>\s]+/gi, '');

  // 4. Neutralize pseudo-protocol links (javascript:, data:text/html)
  sanitized = sanitized.replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'src=""');

  return sanitized.trim();
}
