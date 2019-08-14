import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PersonBackIcon from '@material-ui/icons/PersonOutline';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import { isEmpty } from 'lodash';
import Loading from '@/components/loading';
import { useMount, useRefMounted, useSessionStorage } from 'react-use';
import fetch from '@/share/fetch';
import Typography from '@material-ui/core/Typography';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& svg': {
      fontSize: '1.8rem'
    },
    '& h3': {
      margin: 0
    }
  },
  index: {
    padding: '0 12px',
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
    marginBottom: '48px',
    
  },
  hot: {
    margin: '0 -12px',
    '& .item': {
      display: 'flex',
      alignItems: 'center',
      margin: '12px 0',
      '& .number': {
        minWidth: '2.5em',
        textAlign: 'center',
        '&.active': {
          color: 'red'
        }
      },
      '& .top': {
        '&>:not(:first-child)': {
          padding: '0 4px'
          // verticalAlign: 'super'
        },
        '&>img': {
          // height:'24px'
          height: '14px'
        }
      }
    }
  },
  history: {
    '& $title': {
      '& svg': {
        fontSize: '1.5rem'
      }
    },
    '& .item': {
      margin: '6px',
      height: '28px'
    }
  }
}));

function Search({ history: globalHistory }) {
  const mountedRef = useRefMounted();

  const styles = useStyles();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hot, setHot] = useSessionStorage('search/hot', []);
  const [history, setHistory] = useSessionStorage('search/history', []);
  const [result, setResult] = useState({});

  const getHot = async () => {
    setLoading(true);
    const response = await fetch('/search/hot/detail');
    if (response.code === 200 && mountedRef.current) {
      setHot(response.data);
      setLoading(false);
    }
  };

  const search = (text) => {
    if (!text) {
      return;
    }
    setText(text);
    if (!history.includes(text)) {
      history.unshift(text);
    } else {
      const t = history.filter((h) => h !== text);
      t.unshift(text);
      setHistory(t);
    }
  };

  useMount(() => {
    isEmpty(hot) && getHot(hot);
  });

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>
          <IconButton onClick={() => globalHistory.goBack()}>
            <ArrowBackIcon />
          </IconButton>
          <Input
            fullWidth
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <IconButton onClick={() => globalHistory.push('/singer')}>
            <PersonBackIcon />
          </IconButton>
        </div>
      </div>
      {isEmpty(result) ? (
        <div className={styles.index}>
          {isEmpty(history) ? null : (
            <div className={styles.history}>
              <div className={styles.title}>
                <h3>历史记录</h3>
                <IconButton onClick={() => setHistory([])}>
                  <DeleteIcon />
                </IconButton>
              </div>
              <div>
                {history.map((h, i) => (
                  <Chip
                    label={h}
                    onClick={() => {
                      search(h);
                    }}
                    key={i}
                    className="item"
                  ></Chip>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <Loading />
          ) : (
            <div>
              <h3>热搜榜</h3>
              <div className={styles.hot}>
                {hot.map((h, i) => (
                  <div className="item" key={i}>
                    <Typography
                      variant="h6"
                      className={cx('number', {
                        active: i <= 2
                      })}
                    >
                      {i + 1}
                    </Typography>
                    <Grid
                      zeroMinWidth
                      item
                      onClick={() => {
                        search(h.searchWord);
                      }}
                    >
                      <div className="top">
                        <Typography display="inline" variant="h6">
                          {h.searchWord}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          display="inline"
                          variant="body1"
                        >
                          {h.score}
                        </Typography>
                        {!!h.iconUrl && <img alt="" src={h.iconUrl} />}
                      </div>
                      <Typography
                        color="textPrimary"
                        display="block"
                        variant="subtitle1"
                        noWrap
                      >
                        {h.content}
                      </Typography>
                    </Grid>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Search;
