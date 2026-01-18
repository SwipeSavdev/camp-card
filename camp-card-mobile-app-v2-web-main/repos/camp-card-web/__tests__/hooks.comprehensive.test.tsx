/**
 * Comprehensive Hooks Tests
 *
 * Tests for custom React hooks including:
 * - useIsMobile - viewport detection
 * - useWindowSize - window dimensions
 * - Event listener management
 * - State updates on resize
 */

import { renderHook, act } from '@testing-library/react';
import { useIsMobile, useWindowSize } from '../lib/hooks';

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('useIsMobile Hook', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    mockWindowDimensions(1024, 768);
  });

  afterEach(() => {
    mockWindowDimensions(originalInnerWidth, 768);
  });

  describe('Initial State', () => {
    it('should return false for desktop viewport (>= 768px)', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('should return true for mobile viewport (< 768px)', () => {
      mockWindowDimensions(375, 667);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('should return false for exactly 768px (default breakpoint)', () => {
      mockWindowDimensions(768, 1024);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('should return true for 767px (just below default breakpoint)', () => {
      mockWindowDimensions(767, 1024);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });
  });

  describe('Custom Breakpoint', () => {
    it('should use custom breakpoint when provided', () => {
      mockWindowDimensions(1200, 800);
      const { result } = renderHook(() => useIsMobile(1280));
      expect(result.current).toBe(true);
    });

    it('should return false when viewport is larger than custom breakpoint', () => {
      mockWindowDimensions(1400, 800);
      const { result } = renderHook(() => useIsMobile(1280));
      expect(result.current).toBe(false);
    });

    it('should handle small breakpoint values', () => {
      mockWindowDimensions(320, 568);
      const { result } = renderHook(() => useIsMobile(375));
      expect(result.current).toBe(true);
    });

    it('should handle tablet breakpoint (1024px)', () => {
      mockWindowDimensions(800, 600);
      const { result } = renderHook(() => useIsMobile(1024));
      expect(result.current).toBe(true);
    });
  });

  describe('Resize Events', () => {
    it('should update when window resizes to mobile', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      act(() => {
        mockWindowDimensions(375, 667);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(true);
    });

    it('should update when window resizes to desktop', () => {
      mockWindowDimensions(375, 667);
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      act(() => {
        mockWindowDimensions(1024, 768);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(false);
    });

    it('should handle multiple resize events', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useIsMobile());

      // Desktop -> Mobile
      act(() => {
        mockWindowDimensions(375, 667);
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current).toBe(true);

      // Mobile -> Tablet
      act(() => {
        mockWindowDimensions(768, 1024);
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current).toBe(false);

      // Tablet -> Mobile
      act(() => {
        mockWindowDimensions(600, 800);
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current).toBe(true);
    });
  });

  describe('Breakpoint Updates', () => {
    it('should respond to breakpoint prop changes', () => {
      mockWindowDimensions(800, 600);

      const { result, rerender } = renderHook(
        ({ breakpoint }) => useIsMobile(breakpoint),
        { initialProps: { breakpoint: 768 } }
      );

      expect(result.current).toBe(false);

      rerender({ breakpoint: 1024 });
      expect(result.current).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useIsMobile());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('useWindowSize Hook', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    mockWindowDimensions(1024, 768);
  });

  afterEach(() => {
    mockWindowDimensions(originalInnerWidth, originalInnerHeight);
  });

  describe('Initial State', () => {
    it('should return current window dimensions', () => {
      mockWindowDimensions(1920, 1080);
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });

    it('should return mobile dimensions', () => {
      mockWindowDimensions(375, 667);
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('should return tablet dimensions', () => {
      mockWindowDimensions(768, 1024);
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
    });
  });

  describe('Resize Events', () => {
    it('should update width on resize', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(1024);

      act(() => {
        mockWindowDimensions(1920, 768);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1920);
    });

    it('should update height on resize', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.height).toBe(768);

      act(() => {
        mockWindowDimensions(1024, 1080);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.height).toBe(1080);
    });

    it('should update both dimensions on resize', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        mockWindowDimensions(375, 667);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('should handle rapid resize events', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        mockWindowDimensions(800, 600);
        window.dispatchEvent(new Event('resize'));
        mockWindowDimensions(1200, 900);
        window.dispatchEvent(new Event('resize'));
        mockWindowDimensions(1920, 1080);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });
  });

  describe('Return Value Structure', () => {
    it('should return an object with width and height properties', () => {
      const { result } = renderHook(() => useWindowSize());

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
      expect(typeof result.current.width).toBe('number');
      expect(typeof result.current.height).toBe('number');
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useWindowSize());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('Hooks Integration', () => {
  beforeEach(() => {
    mockWindowDimensions(1024, 768);
  });

  it('should allow using both hooks together', () => {
    const { result } = renderHook(() => {
      const isMobile = useIsMobile();
      const windowSize = useWindowSize();
      return { isMobile, windowSize };
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.windowSize.width).toBe(1024);
  });

  it('should update both hooks on resize', () => {
    const { result } = renderHook(() => {
      const isMobile = useIsMobile();
      const windowSize = useWindowSize();
      return { isMobile, windowSize };
    });

    act(() => {
      mockWindowDimensions(375, 667);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.windowSize.width).toBe(375);
    expect(result.current.windowSize.height).toBe(667);
  });
});

describe('Common Viewport Scenarios', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667, isMobile: true },
    { name: 'iPhone 12 Pro', width: 390, height: 844, isMobile: true },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932, isMobile: true },
    { name: 'iPad Mini', width: 768, height: 1024, isMobile: false },
    { name: 'iPad Pro', width: 1024, height: 1366, isMobile: false },
    { name: 'MacBook Air', width: 1440, height: 900, isMobile: false },
    { name: 'iMac 27"', width: 2560, height: 1440, isMobile: false },
    { name: '4K Display', width: 3840, height: 2160, isMobile: false },
  ];

  viewports.forEach(({ name, width, height, isMobile }) => {
    it(`should correctly detect ${name} (${width}x${height})`, () => {
      mockWindowDimensions(width, height);

      const { result } = renderHook(() => ({
        isMobile: useIsMobile(),
        size: useWindowSize(),
      }));

      expect(result.current.isMobile).toBe(isMobile);
      expect(result.current.size.width).toBe(width);
      expect(result.current.size.height).toBe(height);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle zero dimensions', () => {
    mockWindowDimensions(0, 0);
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });

  it('should handle very large dimensions', () => {
    mockWindowDimensions(10000, 5000);
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(10000);
    expect(result.current.height).toBe(5000);
  });

  it('should treat zero width as mobile', () => {
    mockWindowDimensions(0, 768);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should handle breakpoint of 0', () => {
    mockWindowDimensions(1, 768);
    const { result } = renderHook(() => useIsMobile(0));

    expect(result.current).toBe(false);
  });
});
