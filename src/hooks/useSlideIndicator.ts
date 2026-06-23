import { useLayoutEffect, useState, RefObject } from "react";

export interface IndicatorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Measures the active element inside `containerRef` (matched by
 * `activeSelector`) and returns its box relative to the container. Render a
 * single absolutely-positioned indicator at that box with a CSS transition and
 * it will *slide* between items whenever the active one changes — instead of
 * the highlight statically jumping.
 *
 * The container must be `position: relative` (so offsetTop/offsetLeft are
 * measured against it). Returns `null` when nothing is active.
 */
export function useSlideIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeSelector: string,
  deps: unknown[],
): IndicatorRect | null {
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  // useLayoutEffect so the measurement lands before paint — no flash of an
  // un-highlighted active item on first render / route change.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const el = container.querySelector<HTMLElement>(activeSelector);
      if (!el) {
        setRect(null);
        return;
      }
      setRect({
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    };

    measure();
    // Re-measure when the container resizes (sidebar collapse, viewport, the
    // list growing/shrinking) so the indicator stays glued to its item.
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rect;
}
