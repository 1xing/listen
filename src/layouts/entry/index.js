import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Switch,
  Route,
  Redirect,
  NavLink,
  matchPath,
  Link
} from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { dynamic } from '@/share/utils';
import { useTransition, animated } from 'react-spring';
import { usePrevious } from 'react-use';
import { isUndefined } from 'lodash';
import { findRouteIndex } from '@/share/utils';

const useStyles = makeStyles(({ palette }) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontSize: '14px'
  },
  top: {
    height: '48px',
    display: 'flex',
    alignItems: 'center'
  },
  drawer: {
    backgroundColor: 'white',
    width: '85vw'
  },
  navWrapper: {
    flex: 1,
    textAlign: 'center',
    color: palette.action.active
  },
  navLink: {
    padding: '0 6px'
  },
  activeNavLink: {
    color: 'black',
    fontWeight: 'bold',
    transform: 'scale(1.10)',
    transition: 'transform 0.25s linear'
  },
  router: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '48px',
    '& .animated': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      zIndex: 1,
      WebkitOverflowScrolling: 'touch',
    }
  }
}));

const routes = [
  { path: '/my', name: '我的', component: dynamic(() => import('@/views/my')) },
  {
    path: '/find',
    name: '发现',
    component: dynamic(() => import('@/views/find'))
  }
  // {
  //   path: '/village',
  //   name: '云村',
  //   component: dynamic(() => import('@/views/village'))
  // },
  // {
  //   path: '/video',
  //   name: '视频',
  //   component: dynamic(() => import('@/views/video'))
  // }
];

function Entry({ location }) {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const routeIndex = findRouteIndex(routes, location.pathname);

  const prevRouteIndex = usePrevious(routeIndex);

  const isNext = routeIndex > prevRouteIndex;

  const notTransform =
    routeIndex < 0 || isUndefined(prevRouteIndex) || prevRouteIndex < 0;
  const transitions = useTransition(location, (location) => location.pathname, {
    from: {
      transform: `translate3d(${
        !notTransform ? (isNext ? 100 : -100) : 0
      }%,0,0)`,
      opacity: 0
    },
    enter: {
      opacity: 1,
      transform: `translate3d(0%,0,0)`
    },
    leave: {
      opacity: 0,
      transform: `translate3d(${
        !notTransform ? (!isNext ? 100 : -100) : 0
      },0,0)`
    }
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <IconButton onClick={() => setOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Drawer open={open} onClose={() => setOpen(false)}>
          <div className={styles.drawer}></div>
        </Drawer>
        <div className={styles.navWrapper}>
          {routes.map(({ name, path }) => (
            <NavLink
              activeClassName={styles.activeNavLink}
              className={styles.navLink}
              to={path}
              key={path}
              replace={
                !!matchPath(location.pathname, {
                  path
                })
              }
            >
              {name}
            </NavLink>
          ))}
        </div>
        <Link to="/search">
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Link>
      </div>
      <div className={styles.router}>
        {transitions.map(({ item: location, props, key }) => (
          <animated.div style={props} key={key} className="animated">
            <Switch location={location}>
              {routes.map(({ name, ...rest }) => (
                <Route key={rest.path} {...rest} />
              ))}
              <Redirect exact from="/" to="/find" />
            </Switch>
          </animated.div>
        ))}
      </div>
    </div>
  );
}

export default Entry;
