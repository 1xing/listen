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

export const parseDuration = (duration) => {
  let time = '';
  let minute = (duration / 60000) | 0;
  let second = (duration / 1000) % 60 | 0;
  if (minute < 10) {
    time += '0';
  }
  time += minute + ':';
  if (second < 10) {
    time += '0';
  }
  time += second;
  return time;
};
