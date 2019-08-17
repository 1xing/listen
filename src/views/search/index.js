import React, { useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PersonBackIcon from '@material-ui/icons/PersonOutline';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import { isEmpty, debounce } from 'lodash';
import Loading from '@/components/loading';
import { useMount, useRefMounted, useSessionStorage } from 'react-use';
import fetch from '@/share/fetch';
import Typography from '@material-ui/core/Typography';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import { useTransition, animated } from 'react-spring';
import produce from 'immer';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useUpdateEffect } from 'react-use';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '& svg': {
      fontSize: '1.8rem'
    },
    '& h3': {
      margin: 0
    },
    '& .animated': {
      position: 'absolute',
      left: 14,
      top: '100%',
      width: '70%',
      zIndex: 999,
      '& .item': {
        height: '36px',
        lineHeight: '36px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
        paddingLeft: '12px',
        color: '#999',
        '&>svg': {
          fontSize: '1.6rem',
          verticalAlign: 'middle',
          paddingRight: '4px'
        },
        '& .blue': {
          color: 'blue'
        }
      }
    }
  },
  index: {
    padding: '0 12px',
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
    marginBottom: '48px'
  },
  hot: {
    margin: '0 -12px',
    '& .item': {
      display: 'flex',
      alignItems: 'center',
      margin: '12px 0',
      '&.active': {
        '& .number': {
          color: 'red'
        },
        '& .first': {
          fontWeight: 'bold'
        }
      },
      '& .number': {
        minWidth: '2.5em',
        textAlign: 'center'
      },
      '& .top': {
        '&>:not(:first-child)': {
          padding: '0 4px'
        },
        '&>img': {
          height: '12px'
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
  },
  result: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  tabs: {
    minHeight: '32px',
    '& button': {
      minHeight: '32px'
    },
    '& .indicator': {
      transform: 'scaleX(0.5)'
    }
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '48px'
  },
  song: {
    paddingLeft: '12px',
    marginTop: '12px',
    '& .item': {
      paddingBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& svg': {
        color: '#999'
      }
    }
  },
  album: {
    padding: '0 12px',
    marginTop: '12px',
    '& .item': {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: '12px',
      '& img': {
        width: '15%',
        borderRadius: '6px',
        overflow: 'hidden',
        marginRight: '12px'
      }
    }
  },
  artist: {
    padding: '0 12px',
    marginTop: '12px',
    '& .item': {
      display: 'flex',
      paddingBottom: '12px',
      alignItems: 'center',
      '& img': {
        width: '15%',
        borderRadius: '50%',
        overflow: 'hidden',
        marginRight: '12px'
      }
    }
  },
  playlist: {
    padding: '0 12px',
    marginTop: '12px',
    '& .item': {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: '12px',
      '& img': {
        width: '15%',
        borderRadius: '6px',
        overflow: 'hidden',
        marginRight: '12px'
      }
    }
  },
  video: {
    padding: '0 12px',
    marginTop: '12px',
    '& .item': {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: '12px',
      '& img': {
        width: '30%',
        borderRadius: '6px',
        overflow: 'hidden',
        marginRight: '12px'
      }
    }
  }
}));

const types = [
  {
    type: 1,
    name: '单曲'
  },
  {
    type: 10,
    name: '专辑'
  },
  {
    type: 100,
    name: '歌手'
  },
  {
    type: 1000,
    name: '歌单'
  },
  {
    type: 1014,
    name: '视频'
  }
];

function Search({ history: globalHistory }) {
  const mountedRef = useRefMounted();

  const styles = useStyles();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hot, setHot] = useSessionStorage('search/hot', []);
  const [history, setHistory] = useSessionStorage('search/history', []);
  const [result, setResult] = useState({});
  const [suggest, setSuggest] = useState([]);
  const [type, setType] = useState(1);

  const getHot = async () => {
    setLoading(true);
    const response = await fetch('/search/hot/detail');
    if (response.code === 200 && mountedRef.current) {
      setHot(response.data);
      setLoading(false);
    }
  };

  const getSuggest = async (text) => {
    const response = await fetch('/search/suggest', {
      params: {
        type: 'mobile',
        keywords: text
      }
    });
    if (response.code === 200 && mountedRef.current) {
      const { allMatch } = response.result;
      if (allMatch) {
        setSuggest(allMatch);
      }
    }
  };

  const callGetSuggest = useCallback(
    debounce((text) => {
      getSuggest(text);
    }, 120),
    []
  );

  const handleChange = (e) => {
    const text = e.target.value;
    setText(text);
    if (text) {
      callGetSuggest(text);
    } else {
      setSuggest([]);
    }
  };

  const search = async (text, reset) => {
    if (!text) {
      return;
    }
    if (reset) {
      setResult({});
    }
    setText(text);
    setSuggest([]);
    if (!history.includes(text)) {
      history.unshift(text);
    } else {
      const t = history.filter((h) => h !== text);
      t.unshift(text);
      setHistory(t);
    }
    setResult(
      produce((draft) => {
        draft[type] = {};
      })
    );
    setLoading(true);
    const response = await fetch('/search', {
      params: {
        keywords: text,
        type
      }
    });
    setResult(
      produce((draft) => {
        draft[type] = response.result;
      })
    );
    setLoading(false);
  };
  useUpdateEffect(() => {
    if (!result[type]) {
      search(text);
    }
  }, [type]);

  if (!text && !isEmpty(suggest)) {
    setSuggest([]);
  }

  useMount(() => {
    isEmpty(hot) && getHot(hot);
  });

  const open = !isEmpty(suggest);

  const transitions = useTransition(open, null, {
    enter: {
      opacity: 1
    },
    from: {
      opacity: 0
    },
    leave: {
      opacity: 0
    }
  });

  const renderContent = (type) => {
    let data = result[type];
    if (!data) {
      return <div key={type} />;
    }
    if (type === 1) {
      const songs = data.songs;
      return (
        <div key={type} className={styles.song}>
          {songs.map((s, i) => (
            <div key={i} className="item">
              <Grid item zeroMinWidth>
                <Typography variant="subtitle1">{s.name} </Typography>
                <Typography component="div" noWrap>
                  <Typography variant="caption" display="inline" noWrap>
                    {s.artists.map((v) => v.name).join('/')}
                  </Typography>
                  {' - '}
                  <Typography variant="caption" display="inline">
                    {s.album.name}
                  </Typography>
                </Typography>
              </Grid>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </div>
          ))}
        </div>
      );
    }
    if (type === 10) {
      const albums = data.albums;
      return (
        <div key={type} className={styles.album}>
          {albums.map((a, i) => (
            <div key={i} className="item">
              <img
                data-expand="-10"
                data-src={`${a.picUrl}?param=100y100`}
                className="lazyload "
                alt=""
                src="./loading.gif"
              />
              <Grid item zeroMinWidth>
                <Typography variant="subtitle1">{a.name} </Typography>
                <Typography component="div" noWrap>
                  <Typography variant="caption" display="inline">
                    {a.artists.map((v) => v.name).join('/')}
                  </Typography>{' '}
                  <Typography variant="caption" display="inline">
                    {new Date(a.publishTime).format('yyyy-MM-dd')}
                  </Typography>
                </Typography>
              </Grid>
            </div>
          ))}
        </div>
      );
    }
    if (type === 100) {
      const artists = data.artists;
      return (
        <div key={type} className={styles.artist}>
          {artists.map((a, i) => (
            <div key={i} className="item">
              <img
                data-expand="-10"
                data-src={`${a.img1v1Url}?param=100y100`}
                className="lazyload"
                alt=""
                src="./loading.gif"
              />
              <Grid item zeroMinWidth>
                <Typography variant="subtitle1" display="inline">
                  {a.name}
                </Typography>
              </Grid>
            </div>
          ))}
        </div>
      );
    }

    if (type === 1000) {
      const playlists = data.playlists;
      return (
        <div key={type} className={styles.playlist}>
          {playlists.map((p, i) => (
            <div key={i} className="item">
              <img
                data-expand="-10"
                data-src={`${p.coverImgUrl}?param=100y100`}
                className="lazyload "
                alt=""
                src="./loading.gif"
              />
              <Grid item zeroMinWidth>
                <Typography variant="subtitle1" noWrap>
                  {p.name}{' '}
                </Typography>
                <Typography component="div" noWrap>
                  <Typography variant="caption" display="inline">
                    {`${p.trackCount}首 `}
                  </Typography>
                  <Typography variant="caption" display="inline">
                    {`by ${p.creator.nickname}，`}
                  </Typography>
                  <Typography variant="caption" display="inline">
                    {`播放${p.playCount}次`}
                  </Typography>
                </Typography>
              </Grid>
            </div>
          ))}
        </div>
      );
    }
    if (type === 1014) {
      const videos = data.videos;
      return (
        <div key={type} className={styles.video}>
          {videos.map((v, i) => (
            <div key={i} className="item">
              <img
                data-expand="-10"
                data-src={`${v.coverUrl}`}
                className="lazyload "
                alt=""
              />
              <Grid item zeroMinWidth xs>
                <Typography variant="subtitle1" noWrap>
                  {v.title}{' '}
                </Typography>
                <Typography component="div" noWrap>
                  <Typography variant="caption" display="inline">
                    {`${v.playTime} `}
                  </Typography>
                  <Typography variant="caption" display="inline">
                    {`by ${v.creator.map((v) => v.userName).join('/')}`}
                  </Typography>
                </Typography>
              </Grid>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>
          <IconButton onClick={() => globalHistory.goBack()}>
            <ArrowBackIcon />
          </IconButton>
          <Input fullWidth autoFocus value={text} onChange={handleChange} />
          <IconButton onClick={() => globalHistory.push('/singer')}>
            <PersonBackIcon />
          </IconButton>

          {transitions.map(
            ({ item: open, props, key }) =>
              open && (
                <animated.div style={props} className="animated" key={key}>
                  <Paper>
                    <div
                      onClick={() => {
                        search(text, true);
                      }}
                      className="item"
                    >
                      搜索<span className="blue">{` "${text}"`}</span>
                    </div>
                    {suggest.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          search(s.keyword, true);
                        }}
                        className="item"
                      >
                        <SearchIcon />
                        <span>{s.keyword}</span>
                      </div>
                    ))}
                  </Paper>
                </animated.div>
              )
          )}
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
                      search(h, true);
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
                  <div
                    className={cx('item', {
                      active: i <= 2
                    })}
                    key={i}
                  >
                    <Typography variant="h6" className="number">
                      {i + 1}
                    </Typography>
                    <Grid
                      zeroMinWidth
                      item
                      onClick={() => {
                        search(h.searchWord, true);
                      }}
                    >
                      <div className="top">
                        <Typography
                          display="inline"
                          variant="subtitle1"
                          className="first"
                        >
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
                        variant="subtitle2"
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
        <div className={styles.result}>
          <Tabs
            value={type}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(_, type) => {
              setType(type);
            }}
            className={styles.tabs}
            classes={{
              indicator: 'indicator'
            }}
          >
            {types.map((t) => (
              <Tab key={t.type} label={t.name} value={t.type}></Tab>
            ))}
          </Tabs>
          <div className={styles.content}>
            {loading ? (
              <Loading />
            ) : (
              <SwipeableViews
                index={types.findIndex((t) => t.type === type)}
                onChangeIndex={(index) => setType(types[index].type)}
                animateHeight
              >
                {types.map((t) => renderContent(t.type))}
              </SwipeableViews>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
