import { describe, it, expect } from 'vitest';
import { buildTowerPaths } from './generator';
import type { TowerData } from './layout';

describe('buildTowerPaths', () => {
  const baseTower: TowerData = {
    x: 0,
    y: 0,
    h: 10,
    row: 0,
    col: 0,
    isGhost: false,
    faceOpacity: { left: 0.8, right: 0.6, top: 1 },
    strokeOpacity: 0.5,
    strokeWidth: 1,
    tooltip: 'test tower',
    isTodayWithCommits: false,
    contributionCount: 2,
    hasCommits: true,
    isToday: false,
  };

  it('generates expected paths for standard parameters', () => {
    const output = buildTowerPaths(baseTower, 'fill="red"', 'stroke="blue"');

    // Left face
    expect(output).toContain(
      '<path d="M0 0 L0 10 L-16 0 L-16 -10 Z" fill="red" fill-opacity="0.8" stroke="blue" stroke-opacity="0.5" stroke-width="1" />'
    );
    // Right face
    expect(output).toContain(
      '<path d="M0 0 L0 10 L16 0 L16 -10 Z" fill="red" fill-opacity="0.6" stroke="blue" stroke-opacity="0.5" stroke-width="1" />'
    );
    // Top face
    expect(output).toContain(
      '<path d="M0 -10 L16 0 L0 10 L-16 0 Z" fill="red" fill-opacity="1" stroke="blue" stroke-opacity="0.5" stroke-width="1" />'
    );

    // Snow cap should NOT be present
    expect(output).not.toContain('fill="white"');
  });

  it('includes snow cap for high contribution counts (>5)', () => {
    const highTower = { ...baseTower, contributionCount: 6, h: 20 };
    const output = buildTowerPaths(highTower, 'fill="red"', 'stroke="blue"');
    expect(output).toContain(
      '<path d="M0 -20 L16 -10 L0 0 L-16 -10 Z" fill="white" fill-opacity="0.2" />'
    );
  });

  it('handles null, undefined, and empty objects robustly', () => {
    expect(buildTowerPaths(null, null, null)).toBe('');
    expect(buildTowerPaths(undefined, undefined, undefined)).toBe('');

    // @ts-expect-error Testing invalid parameters
    expect(buildTowerPaths({}, null, null)).toBe('');

    // @ts-expect-error Testing invalid parameters
    const output = buildTowerPaths({ h: 15, contributionCount: 0 }, null, null);
    expect(output).toContain(
      '<path d="M0 -5 L0 10 L-16 0 L-16 -15 Z" fill="transparent" fill-opacity="0" stroke="transparent" stroke-opacity="0" stroke-width="0" />'
    );
  });

  it('verifies exact calculation of dimensions', () => {
    // Top point is y: 10 - h
    // Bottom point is y: 10
    // Right point is x: 16, y: 0
    // Left point is x: -16, y: 0
    const t = { ...baseTower, h: 30 };
    const output = buildTowerPaths(t, 'fill="black"', 'stroke="white"');

    // Left face
    expect(output).toContain('d="M0 -20 L0 10 L-16 0 L-16 -30 Z"');
    // Right face
    expect(output).toContain('d="M0 -20 L0 10 L16 0 L16 -30 Z"');
    // Top face
    expect(output).toContain('d="M0 -30 L16 -20 L0 -10 L-16 -20 Z"');
  });

  it('runs within standard timers (performance)', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      buildTowerPaths({ ...baseTower, h: i % 50 }, 'fill="x"', 'stroke="y"');
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should easily finish in less than 100ms
  });
});
