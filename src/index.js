import React, { cloneElement, useMemo } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import { Router, Route, Switch } from 'react-router-dom';
import Entry from './layouts/entry';
import { StoreProvider } from 'easy-peasy';
import store from './store';
import history from './share/history';
import CssBaseline from '@material-ui/core/CssBaseline';
import { dynamic } from '@/share/utils';
import { useTransition, animated } from 'react-spring';
import { findRouteIndex } from '@/share/utils';
import { usePrevious } from 'react-use';
import { isUndefined } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Player from './player';

const slideRightRoutes = [
  {
    path: '/search',
    component: dynamic(() => import('@/views/search'))
  },
  {
    path: '/singer',
    component: dynamic(() => import('@/views/singer'))
  },
  {
    path: '/rank',
    component: dynamic(() => import('@/views/rank'))
  }
];

const useStyles = makeStyles({
  animated: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  }
});

const Root = ({ location }) => {
  const routeIndex = findRouteIndex(slideRightRoutes, location.pathname);

  const prevRouteIndex = usePrevious(routeIndex);

  const notTransition =
    routeIndex < 0 && (isUndefined(prevRouteIndex) || prevRouteIndex < 0);

  const transitions = useTransition(location, (location) => location.pathname, {
    from: {
      transform: `translate3d(100%,0,0)`,
      opacity: 0
    },
    enter: {
      opacity: 1,
      transform: `translate3d(0%,0,0)`
    },
    leave: {
      opacity: 0,
      transform: `translate3d(100%,0,0)`
    }
  });

  const router = (
    <Switch location={location}>
      {slideRightRoutes.map(({ name, ...rest }) => (
        <Route key={rest.path} {...rest} />
      ))}
    </Switch>
  );
  const styles = useStyles();

  const routerImpl = notTransition
    ? router
    : transitions.map(({ item: location, props, key }) => (
        <animated.div style={props} key={key} className={styles.animated}>
          {cloneElement(router, { location })}
        </animated.div>
      ));

  const entryRoute = useMemo(() => <Route path="/" component={Entry} />, [
    location.pathname
  ]);

  return (
    <div>
      <div>
        <div>{routerImpl}</div>
        {entryRoute}
      </div>
      <Player />
    </div>
  );
};

const generateClassName = createGenerateClassName({
  productionPrefix: 'css-',
  disableGlobal: true
});

ReactDOM.render(
  <StoreProvider store={store}>
    <StylesProvider generateClassName={generateClassName} injectFirst>
      <Router history={history}>
        <Route path="/" component={Root} />
      </Router>
      <CssBaseline />
    </StylesProvider>
  </StoreProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
