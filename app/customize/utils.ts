import type { CustomizeOptions, ExportFormat } from './types';
const BADGE_BASE_URL = 'https://commitpulse.vercel.app/api/streak';

/**
 * Removes the leading # from a hex color string.
 * Used specifically for color picker handling in the customize interface.
 */
export function stripHash(val: string): string {
  return val.replace(/^#/, '');
}

/**
 * Validates if a string is a valid 6-digit hex color for the color picker.
 * Intentionally strict (6-digit only) for color customization.
 * Note: lib/svg/sanitizer.ts has a more flexible version supporting 3,4,6,8 digits for SVG theming.
 */
export function isValidHex(value: string): boolean {
  return /^[0-9a-fA-F]{6}$/.test(stripHash(value));
}

export function getBadgeUrl(queryString: string): string {
  return `${BADGE_BASE_URL}?${queryString}`;
}

export function getExportSnippet(format: ExportFormat, queryString: string): string {
  const badgeUrl = getBadgeUrl(queryString);

  if (format === 'html') {
    return `<img src="${badgeUrl}" alt="CommitPulse" />`;
  }

  return `![CommitPulse](${badgeUrl})`;
}

export function getPlaceholderSnippet(format: ExportFormat): string {
  return getExportSnippet(format, 'user=your-github-username');
}

export function buildQueryParams(options: CustomizeOptions): string {
  const params = new URLSearchParams();

  const trimmedUsername = options.username.trim();
  const hasUsername = trimmedUsername.length > 0;

  if (hasUsername) {
    params.set('user', trimmedUsername);
  }

  const isAutoTheme = options.theme === 'auto';
  const isRandomTheme = options.theme === 'random';
  const skipsCustomColors = isAutoTheme || isRandomTheme;

  if (skipsCustomColors) {
    // Virtual themes always emit theme=<name> and skip custom color params.
    params.set('theme', options.theme);
  } else {
    const hasCustomColors = options.bgHex || options.accentHex || options.textHex;

    // Custom hex colors take priority over theme
    if (!hasCustomColors) {
      params.set('theme', options.theme);
    }
    if (options.bgHex) params.set('bg', stripHash(options.bgHex));
    if (options.accentHex) params.set('accent', stripHash(options.accentHex));
    if (options.textHex) params.set('text', stripHash(options.textHex));
  }

  if (options.scale !== 'linear') params.set('scale', options.scale);
  if (options.speed !== '8s') params.set('speed', options.speed);
  if (options.font) params.set('font', options.font);
  if (options.year) params.set('year', options.year);
  if (options.radius !== 8) params.set('radius', options.radius.toString());
  if (options.size !== 'medium') params.set('size', options.size);

  if (options.hideTitle) params.set('hide_title', 'true');
  if (options.hideBackground) params.set('hide_background', 'true');
  if (options.hideStats) params.set('hide_stats', 'true');
  if (options.viewMode !== 'default') params.set('view', options.viewMode);
  if (options.deltaFormat !== 'percent') params.set('delta_format', options.deltaFormat);
  if (options.badgeWidth !== '') params.set('width', options.badgeWidth.toString());
  if (options.badgeHeight !== '') params.set('height', options.badgeHeight.toString());
  if (options.grace !== 1) params.set('grace', options.grace.toString());
  if (options.language !== 'en') params.set('lang', options.language);

  return params.toString();
}
