import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles({
  wrapper: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999
  },
  small: {
    height: '48px',
    backgroundColor: 'white',
  }
});

function Player() {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.small}></div>
    </div>
  );
}

export default Player;
