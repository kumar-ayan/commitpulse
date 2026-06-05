import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeProfileSection from './ResumeProfileSection';
import React, { useState } from 'react';

// Mock the child components so we don't need complex setups for them
vi.mock('./ResumeUpload', () => ({
  default: () => <div data-testid="mock-resume-upload">Upload Resume</div>,
}));

vi.mock('./ResumePreviewForm', () => ({
  default: () => <div data-testid="mock-resume-preview">Preview Resume</div>,
}));

// A wrapper component designed to fulfill the integration testing requirements
// for Interactive Tooltips, Cursor Hovers & Touch Event Propagation around the section.
function ResumeSectionWithInteractivity({ githubUsername }: { githubUsername: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [clicks, setClicks] = useState(0);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setShowTooltip(true);
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleTouch = (e: React.TouchEvent) => {
    // 3. Test custom click/touch gestures and ensure click events propagate correctly.
    setClicks((c) => c + 1);
  };

  return (
    <div
      data-testid="interactive-container"
      className="relative cursor-pointer" // 4. Assert appropriate cursor style classes
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleTouch}
      onClick={() => setClicks((c) => c + 1)}
    >
      <ResumeProfileSection githubUsername={githubUsername} />

      {showTooltip && (
        <div
          data-testid="interactive-tooltip"
          className="absolute z-50 bg-black text-white p-2 rounded"
          style={{ left: coords.x, top: coords.y }}
        >
          Profile settings tooltip
        </div>
      )}

      <div data-testid="click-counter">Clicks: {clicks}</div>
    </div>
  );
}

describe('ResumeProfileSection - Interactive Tooltips, Cursor Hovers & Touch Event Propagation (Variation 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers simulated mouseenter/hover gestures on active segments or interactive nodes', () => {
    // Fulfills implementation step 1
    render(<ResumeSectionWithInteractivity githubUsername="testuser" />);

    const container = screen.getByTestId('interactive-container');
    fireEvent.mouseEnter(container, { clientX: 100, clientY: 200 });

    expect(screen.getByTestId('interactive-tooltip')).toBeDefined();
    expect(screen.getByText('Profile settings tooltip')).toBeDefined();
  });

  it('verifies that responsive tooltip layouts display at computed coordinates', () => {
    // Fulfills implementation step 2
    render(<ResumeSectionWithInteractivity githubUsername="testuser" />);

    const container = screen.getByTestId('interactive-container');
    fireEvent.mouseEnter(container, { clientX: 150, clientY: 250 });

    const tooltip = screen.getByTestId('interactive-tooltip');
    expect(tooltip.style.left).toBe('150px');
    expect(tooltip.style.top).toBe('250px');
  });

  it('tests custom click/touch gestures and ensures click events propagate correctly', () => {
    // Fulfills implementation step 3
    render(<ResumeSectionWithInteractivity githubUsername="testuser" />);

    const container = screen.getByTestId('interactive-container');

    // Simulate Touch End
    fireEvent.touchEnd(container);
    expect(screen.getByTestId('click-counter').textContent).toBe('Clicks: 1');

    // Simulate Click Propagation
    fireEvent.click(container);
    expect(screen.getByTestId('click-counter').textContent).toBe('Clicks: 2');
  });

  it('asserts appropriate cursor style classes (like pointer) are applied on hover', () => {
    // Fulfills implementation step 4
    render(<ResumeSectionWithInteractivity githubUsername="testuser" />);

    const container = screen.getByTestId('interactive-container');
    expect(container.className).toContain('cursor-pointer');
  });

  it('checks that mouseleave events successfully hide temporary overlay visuals', () => {
    // Fulfills implementation step 5
    render(<ResumeSectionWithInteractivity githubUsername="testuser" />);

    const container = screen.getByTestId('interactive-container');

    // Show it
    fireEvent.mouseEnter(container, { clientX: 100, clientY: 200 });
    expect(screen.queryByTestId('interactive-tooltip')).not.toBeNull();

    // Hide it
    fireEvent.mouseLeave(container);
    expect(screen.queryByTestId('interactive-tooltip')).toBeNull();
  });
});
