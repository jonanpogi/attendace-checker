const avgPoint = (pts: { x: number; y: number }[]) => {
  const n = pts.length || 1;
  const s = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), {
    x: 0,
    y: 0,
  });

  return { x: s.x / n, y: s.y / n };
};

export default avgPoint;
