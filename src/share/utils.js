import React, { lazy, Suspense } from 'react';
import Loading from '@/components/loading';
import { matchPath } from 'react-router-dom';

export const dynamic = (loader) => {
  const Component = lazy(loader);
  return function DynamicComponent(props) {
    return (
      <Suspense fallback={<Loading />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

export const findRouteIndex = (routes, pathname) => {
  return routes.findIndex((r) =>
    matchPath(pathname, {
      path: r.path
    })
  );
};
