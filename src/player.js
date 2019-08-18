import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { useTransition, animated } from 'react-spring';

const useStyles = makeStyles({
  wrapper: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000
  },
  small: {
    height: '48px',
    backgroundColor: 'white',
    // borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    transformOrigin: 'left bottom'
  },
  full: {
    height: '100vh',
    backgroundColor: 'white',
    transformOrigin: 'left bottom'
  }
});

function Player() {
  const { screen } = useStoreState(({ play }) => play);
  const { changeScreen } = useStoreActions(({ play }) => play);
  const styles = useStyles();

  const transitions = useTransition(screen, null, {
    enter: {
      opacity: 1,
      transform: 'scale(1)'
    },
    from: {
      opacity: 0,
      transform: 'scale(0)'
    },
    leave: {
      opacity: 0,
      transform: 'scale(0)'
    }
  });

  return (
    <div className={styles.wrapper}>
      {transitions.map(({ item: screen, props }) => {
        return screen === 'small' ? (
          <animated.div
            className={styles.small}
            onClick={() => changeScreen('full')}
            // style={props}
          ></animated.div>
        ) : (
          <animated.div
            className={styles.full}
            onClick={() => changeScreen('small')}
            style={props}
          ></animated.div>
        );
      })}
    </div>
  );
}

export default Player;
