import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    height: '100%',
    backgroundColor: 'white'
  }
}));
function Rank() {
  const styles = useStyles();
  return <div className={styles.wrapper}></div>;
}

export default Rank;
