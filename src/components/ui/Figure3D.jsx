import React, { lazy, Suspense } from 'react';

// three.js is ~900 kB — keep it out of the first paint.
const Figure = lazy(() => import('../../three/Figure'));

const Skeleton = ({ caption, size = 260 }) => (
  <figure className="relative m-0">
    <div
      className="panel ticks relative w-full overflow-hidden"
      style={{ height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_50%_55%,rgba(34,211,197,0.07),transparent_70%)]" />
    </div>
    {caption ? (
      <figcaption className="meta mt-3 flex items-center gap-2 text-dim">
        <span className="inline-block h-1.5 w-1.5 bg-line" />
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

const Figure3D = (props) => (
  <Suspense fallback={<Skeleton {...props} />}>
    <Figure {...props} />
  </Suspense>
);

export default Figure3D;
