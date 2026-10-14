import { useEffect, useRef, useState } from 'react';

// SVG goo filter: blurred shapes melt together into liquid blobs.
export function GooDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

// Several floating circles merged by the goo filter.
export function BlobField({ blobs, className = '' }) {
  return (
    <div className={`blob-layer ${className}`} aria-hidden="true">
      <div className="goo" style={{ position: 'absolute', inset: 0 }}>
        {blobs.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: b.x, top: b.y, width: b.size, height: b.size, borderRadius: '50%',
              background: b.color || 'var(--ink)',
              animation: `bf-${b.id || i} ${b.duration || 14}s ease-in-out infinite`,
              animationDelay: `${b.delay || 0}s`,
            }}
          />
        ))}
      </div>
      <style>{blobs.map((b, i) => `
        @keyframes bf-${b.id || i} {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(${b.dx1 ?? 60}px, ${b.dy1 ?? -40}px) scale(${b.s1 ?? 1.12}); }
          66% { transform: translate(${b.dx2 ?? -40}px, ${b.dy2 ?? 50}px) scale(${b.s2 ?? 0.9}); }
        }`).join('\n')}</style>
    </div>
  );
}

// A single blob whose outline morphs continuously.
export function MorphBlob({ size = 600, color = 'var(--ink)', className, style, speed = 0.006 }) {
  const [d, setD] = useState(() => blobPath(Math.random() * 10));
  useEffect(() => {
    let t = Math.random() * 10;
    let raf;
    const step = () => {
      t += speed;
      setD(blobPath(t));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} style={style} aria-hidden="true">
      <path d={d} fill={color} />
    </svg>
  );
}

function blobPath(t) {
  const N = 8, cx = 100, cy = 100, R = 70;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = R + Math.sin(t + i * 0.9) * 10 + Math.cos(t * 1.3 + i * 1.7) * 6 + Math.sin(t * 0.5 + i * 2.1) * 4;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + ' Z';
}

// Small blob that trails the cursor and grows over links and buttons.
export function CursorBlob() {
  const ref = useRef(null);
  useEffect(() => {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf;
    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      const hot = e.target.closest?.('a, button, .plan, .tline');
      ref.current?.classList.toggle('big', !!hot);
    };
    addEventListener('mousemove', move);
    const loop = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      if (ref.current) ref.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor-blob" aria-hidden="true" />;
}

export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

export function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}

export function Arrow({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19 19 5" /><path d="M9 5h10v10" />
    </svg>
  );
}

export function Play({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
  );
}
