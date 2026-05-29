import { describe, it, expect } from 'vitest';
import { stripHash, isValidHex, buildQueryParams } from './utils';
import type { CustomizeOptions } from './types';

describe('Customize Utils', () => {
  describe('stripHash', () => {
    it('removes leading # from hex color', () => {
      expect(stripHash('#ff0000')).toBe('ff0000');
    });

    it('returns unchanged string if no # prefix', () => {
      expect(stripHash('ff0000')).toBe('ff0000');
    });

    it('handles empty string', () => {
      expect(stripHash('')).toBe('');
    });

    it('only removes leading #, not all occurrences', () => {
      expect(stripHash('##ff0000')).toBe('#ff0000');
    });

    it('handles just # character', () => {
      expect(stripHash('#')).toBe('');
    });
  });

  describe('isValidHex', () => {
    describe('valid 6-digit hex colors', () => {
      it('accepts lowercase hex without #', () => {
        expect(isValidHex('ffffff')).toBe(true);
        expect(isValidHex('000000')).toBe(true);
        expect(isValidHex('ff0000')).toBe(true);
      });

      it('accepts uppercase hex without #', () => {
        expect(isValidHex('FFFFFF')).toBe(true);
        expect(isValidHex('FF0000')).toBe(true);
      });

      it('accepts mixed case hex without #', () => {
        expect(isValidHex('FfFfFf')).toBe(true);
        expect(isValidHex('aAbBcC')).toBe(true);
      });

      it('accepts 6-digit hex with # prefix', () => {
        expect(isValidHex('#ffffff')).toBe(true);
        expect(isValidHex('#000000')).toBe(true);
      });
    });

    describe('invalid hex colors', () => {
      it('rejects non-hex characters', () => {
        expect(isValidHex('zzzzzz')).toBe(false);
        expect(isValidHex('gggggg')).toBe(false);
        expect(isValidHex('ff@0000')).toBe(false);
      });

      it('rejects wrong length', () => {
        expect(isValidHex('f')).toBe(false);
        expect(isValidHex('ff')).toBe(false);
        expect(isValidHex('fff')).toBe(false);
        expect(isValidHex('fffff')).toBe(false);
        expect(isValidHex('fffffff')).toBe(false);
        expect(isValidHex('ffffffff')).toBe(false);
      });

      it('rejects hex with # but invalid length', () => {
        expect(isValidHex('#fff')).toBe(false);
        expect(isValidHex('#fffff')).toBe(false);
      });

      it('rejects empty string', () => {
        expect(isValidHex('')).toBe(false);
      });

      it('rejects hex with invalid characters and #', () => {
        expect(isValidHex('#zzzzzz')).toBe(false);
        expect(isValidHex('#ff@000')).toBe(false);
      });
    });
  });

  describe('buildQueryParams', () => {
    const defaultOptions: CustomizeOptions = {
      username: 'testuser',
      theme: 'dark',
      bgHex: '',
      accentHex: '',
      textHex: '',
      scale: 'linear',
      speed: '8s',
      font: '',
      year: '',
      radius: 8,
      size: 'medium',
      hideTitle: false,
      hideBackground: false,
      hideStats: false,
      viewMode: 'default',
      deltaFormat: 'percent',
      badgeWidth: '',
      badgeHeight: '',
      grace: 1,
      language: 'en',
    };

    it('returns minimal params with default values', () => {
      const result = buildQueryParams(defaultOptions);
      expect(result).toBe('user=testuser&theme=dark');
    });

    it('applies custom theme values', () => {
      const options = { ...defaultOptions, theme: 'light' };
      const result = buildQueryParams(options);
      expect(result).toBe('user=testuser&theme=light');
    });

    it('applies custom color overrides and omits theme', () => {
      const options = {
        ...defaultOptions,
        theme: 'dark',
        bgHex: '#ffffff',
        accentHex: 'ff0000',
        textHex: '#000000',
      };
      const result = buildQueryParams(options);
      expect(result).toBe('user=testuser&bg=ffffff&accent=ff0000&text=000000');
    });

    it('forces theme parameter and ignores custom colors for virtual themes (auto/random)', () => {
      const optionsAuto = {
        ...defaultOptions,
        theme: 'auto',
        bgHex: 'ffffff',
      };
      const resultAuto = buildQueryParams(optionsAuto);
      expect(resultAuto).toBe('user=testuser&theme=auto');

      const optionsRandom = {
        ...defaultOptions,
        theme: 'random',
        accentHex: 'ff0000',
      };
      const resultRandom = buildQueryParams(optionsRandom);
      expect(resultRandom).toBe('user=testuser&theme=random');
    });

    it('handles empty username gracefully', () => {
      const options = { ...defaultOptions, username: '   ' };
      const result = buildQueryParams(options);
      expect(result).toBe('theme=dark');
    });

    it('includes all customized options', () => {
      const options = {
        ...defaultOptions,
        scale: 'log' as const,
        speed: '4s',
        font: 'fira' as const,
        year: '2023',
        radius: 12,
        size: 'large' as const,
        hideTitle: true,
        hideBackground: true,
        hideStats: true,
        viewMode: 'monthly' as const,
        deltaFormat: 'absolute' as const,
        badgeWidth: 600,
        badgeHeight: 400,
        grace: 2,
        language: 'es' as const,
      };
      const result = buildQueryParams(options);
      expect(result).toBe(
        'user=testuser&theme=dark&scale=log&speed=4s&font=fira&year=2023&radius=12&size=large&hide_title=true&hide_background=true&hide_stats=true&view=monthly&delta_format=absolute&width=600&height=400&grace=2&lang=es'
      );
    });
  });
});
