import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pointer-driven rotation for a small 3D figure.
 *
 * - drag rotates on both axes and keeps momentum on release
 * - momentum decays, then the tilt eases back to its resting angle
 * - hover is reported as a 0..1 ramp the model can use for lift / glow / speed
 *
 * Rotation lives in refs so dragging never re-renders React.
 */
export function useDragRotate({ restX = 0.22, restY = 0.5 } = {}) {
  const rot = useRef({ x: restX, y: restY });
  const vel = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const hover = useRef(0);

  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    setIsDragging(true);
    last.current = { x: e.clientX, y: e.clientY };
    vel.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    rot.current.y += dx * 0.011;
    rot.current.x = Math.max(-1.1, Math.min(1.1, rot.current.x + dy * 0.009));
    vel.current.y = dx * 0.011;
    vel.current.x = dy * 0.009;
  }, []);

  const release = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    e?.currentTarget?.releasePointerCapture?.(e.pointerId);
  }, []);

  const onPointerEnter = useCallback(() => setIsHover(true), []);
  const onPointerLeave = useCallback((e) => {
    setIsHover(false);
    release(e);
  }, [release]);

  useEffect(() => {
    const stop = () => {
      dragging.current = false;
      setIsDragging(false);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  /** Called from useFrame — advances spin, momentum and the hover ramp. */
  const step = useCallback(
    (delta, { hovered, frozen }) => {
      const h = hover.current + ((hovered ? 1 : 0) - hover.current) * Math.min(1, delta * 6);
      hover.current = h;

      if (frozen) return { rot: rot.current, hover: h };

      if (dragging.current) return { rot: rot.current, hover: h };

      // momentum, then decay
      rot.current.y += vel.current.y;
      rot.current.x = Math.max(-1.1, Math.min(1.1, rot.current.x + vel.current.x));
      const damp = Math.pow(0.9, delta * 60);
      vel.current.y *= damp;
      vel.current.x *= damp;
      if (Math.abs(vel.current.y) < 0.0004) vel.current.y = 0;
      if (Math.abs(vel.current.x) < 0.0004) vel.current.x = 0;

      // idle spin + tilt easing back to rest
      rot.current.y += delta * (0.28 + h * 0.55);
      rot.current.x += (restX - rot.current.x) * Math.min(1, delta * 1.4);

      return { rot: rot.current, hover: h };
    },
    [restX],
  );

  return {
    rot,
    hover,
    step,
    isHover,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerEnter,
      onPointerLeave,
    },
  };
}
