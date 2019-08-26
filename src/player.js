import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { useTransition, animated } from 'react-spring';
import Loading from '@/components/loading';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ShareIcon from '@material-ui/icons/Share';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import GetAppIcon from '@material-ui/icons/GetApp';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import MessageIcon from '@material-ui/icons/Message';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import { useUpdateEffect } from 'react-use';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { parseDuration } from '@/share/utils';
import cx from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';

const modes = [
  {
    mode: 0,
    icon: <RepeatIcon />,
    name: '列表循环'
  },
  {
    mode: 1,
    icon: <RepeatOneIcon />,
    name: '单曲循环'
  },
  {
    mode: 2,
    icon: <ShuffleIcon />,
    name: '随机播放'
  }
];

const useStyles = makeStyles({
  '@keyframes circle': {
    from: {
      transform: `rotate(0deg)`
    },
    to: {
      transform: `rotate(360deg)`
    }
  },
  wrapper: {},
  small: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    height: '48px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    justifyContent: 'space-between',
    '&>h3': {
      margin: 0
    },
    '& .left': {
      display: 'flex',
      '&>img': {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '6px',
        animation: '$circle 8s infinite linear',
        animationPlayState: ({ playing }) => (playing ? 'running' : 'paused'),
        overflow: 'hidden'
      }
    },
    '& .right': {
      '& button': {
        padding: '0 4px',
        '& svg': {
          fontSize: '1.8rem'
        }
      }
    }
  },
  full: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1000,
    backgroundColor: 'white'
  },
  loading: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1301,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    background: `black`,
    '&>img': {
      filter: `blur(60px) opacity(0.6)`,
      height: `120%`,
      width: `150%`,
      marginLeft: `-25%`,
      marginTop: `-10%`,
      maxWidth: 'initial'
    }
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
    '& .left': {
      display: 'flex',
      alignItems: 'center',
      '& .singer': {
        color: '#bbb',
        display: 'flex',
        alignItems: 'center',
        '&>span': {},
        '&>svg': {
          color: 'inherit'
        }
      },
      '& h3': {
        margin: 0
      }
    },
    '& svg': {
      color: 'white',
      fontSize: '1.6rem'
    }
  },
  middle: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  lyric: {
    height: '100%',
    paddingBottom: '12px',
    boxSizing: 'border-box',
    '& .null': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#bbb'
    },
    '& .content': {
      overflowY: 'auto',
      overflowX: 'hidden',
      height: '100%',
      '& .item': {
        color: '#bbb',
        textAlign: 'center',
        transition: 'all 0.25s linear',
        margin: 0,
        padding: '6px 0',
        '&.active': {
          color: 'white',
          transform: 'scale(1.15)'
        }
      }
    }
  },
  noLyric: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '& .image': {
      height: '55vw',
      width: '55vw',
      padding: '4px',
      backgroundColor: `rgba(255,255,255,0.1)`,
      borderRadius: '50%',
      margin: '0 auto',
      marginTop: '20%',
      '&>img': {
        height: '100%',
        width: '100%',
        borderRadius: '50%',
        animation: '$circle 12s infinite linear',
        animationPlayState: ({ playing }) => (playing ? 'running' : 'paused'),
        overflow: 'hidden'
      }
    },
    '& .icons': {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 10%',
      alignItems: 'center',
      '& svg': {
        color: 'white',
        fontSize: '1.6rem'
      }
    }
  },
  bottom: {
    '& .timeline': {
      display: 'flex',
      padding: '0px 6px',
      alignItems: 'center',
      '&>span': {
        padding: '0 6px',
        color: 'white'
      },
      '& .middle': {
        flex: 1,
        position: 'relative',
        padding: '4px 0',
        boxSizing: 'content-box',
        '& .background': {
          height: '1px',
          backgroundColor: '#999'
        },
        '& .content': {
          position: 'absolute',
          display: 'flex',
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
          alignItems: 'center',
          '& .left': {
            height: '1px',
            width: 0,
            backgroundColor: 'white',
            pointerEvents: 'none'
          },
          '& .right': {
            padding: '6px',
            boxSizing: 'border-box',
            transform: 'translateX(-6px)',
            '&>span': {
              height: '8px',
              width: '8px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'block',
              transition: 'transform 0.05s linear',
              transform: ({ isTouch }) => `scale(${isTouch ? 1.5 : 1})`
            }
          }
        }
      }
    },
    '& .icons': {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 10%',
      '& svg': {
        color: 'white',
        fontSize: '1.8rem'
      },
      '& .play': {
        '& svg': {
          fontSize: '2.5rem'
        }
      }
    }
  },
  snackbar: {
    left: '50%',
    bottom: '6%',
    transform: 'translateX(-50%)',
    right: 'initial',
    '& .content': {
      backgroundColor: '#ccc',
      color: 'black',
      '&>div': {
        padding: 0
      }
    }
  },
  drawer: {
    height: '60vh',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    '& .top': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '12px',
      borderBottom: '1px solid #ccc',
      '&>div': {
        display: 'flex',
        alignItems: 'center',
        '&>span': {
          padding: '0 1px',
          '& svg': {
            verticalAlign: 'middle'
          }
        }
      }
    },
    '& .content': {
      flex: 1,
      overflowY: 'auto',
      '& .item': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        minWidth: 0,
        '&.active': {
          color: 'red'
        }
      }
    }
  }
});

function Player() {
  const {
    init,
    screen,
    loading,
    song,
    playing,
    mode,
    list,
    index
  } = useStoreState(({ play }) => play);
  const {
    initSuccess,
    setScreen,
    setPlaying,
    toggleMode,
    next,
    prev,
    playSingle,
    empty,
    delete: globalDelete
  } = useStoreActions(({ play }) => play);

  const audioRef = useRef(null);
  const scrollRef = useRef(null);
  const canplay = useRef(false);
  const [isLyric, setIsLyric] = useState(false);
  const [modeMessage, setModeMessage] = useState('');
  const [time, setTime] = useState(0);
  const [isTouch, setIsTouch] = useState(false);
  const [lyricIndex, setLyricIndex] = useState(-1);
  const styles = useStyles({ playing, isTouch });

  useEffect(() => {
    if (!song || !song.lyric) {
      return;
    }
    setLyricIndex(song.lyric.findIndex(time));
  }, [time]);

  const scrollLyric = (behavior = 'smooth') => {
    const dom = scrollRef.current;
    if (!dom) {
      return;
    }
    const h = dom.clientHeight;
    const sh = dom.children[0].clientHeight;
    const mid = h / sh / 2 - 1;
    if (lyricIndex < mid && dom.scrollTop > mid * sh) {
      dom.scrollTo({
        top: 0,
        behavior
      });
      return;
    }
    if (
      dom.children.length - lyricIndex < mid &&
      dom.scrollTop < (dom.children.length - mid) * h
    ) {
      dom.scrollTo({
        top: (dom.children.length - mid) * h,
        behavior
      });
      return;
    }
    dom.scrollTo({
      top: sh * lyricIndex - h / 2 + sh,
      behavior
    });
  };

  useEffect(() => {
    scrollLyric();
  }, [lyricIndex, isLyric]);
  useEffect(() => {
    if (screen === 'full') {
      scrollLyric('auto');
    }
  }, [screen]);

  const play = () => {
    setPlaying(true);
    audioRef.current && audioRef.current.play();
  };
  const pause = () => {
    setPlaying(false);
    audioRef.current && audioRef.current.pause();
  };

  const _next = () => {
    if (loading) {
      return;
    }
    if (list.length === 1) {
      audioRef.current.currentTime = 0;
      return;
    }
    next();
  };
  const _prev = () => {
    if (loading) {
      return;
    }
    if (list.length === 1) {
      audioRef.current.currentTime = 0;
      return;
    }
    prev();
  };

  const initAudio = () => {
    const handler = () => {
      audioRef.current && audioRef.current.play();
      initSuccess(() => {
        document.body.removeEventListener('click', handler);
        canplay.current = false;
      });
    };
    document.body.addEventListener('click', handler);
  };

  const handleCanPlay = () => {
    canplay.current = true;
    if (!init) {
      initAudio();
    } else {
      song && play();
    }
  };
  const handleTimeUpdate = () => {
    !isTouch && setTime(audioRef.current.currentTime * 1000);
  };

  const handleEnded = () => {
    if (mode === 1) {
      audioRef.current.currentTime = 0;
    } else {
      _next();
    }
  };

  useUpdateEffect(() => {
    const name = modes.find((m) => m.mode === mode).name;
    setModeMessage(name);
  }, [mode]);

  const transitions = useTransition(screen, null, {
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

  const lyricTransitions = useTransition(isLyric, null, {
    enter: {
      opacity: 1,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    },
    from: {
      opacity: 0
    },
    leave: {
      opacity: 0
    }
  });

  const touchObjRef = useRef({});

  const [open, setOpen] = useState(false);

  const _empty = () => {
    pause();
    setOpen(false);
    empty();
  };
  const _delete = (id) => {
    if (list.length === 1) {
      _empty();
      return;
    }
    globalDelete(id);
  };

  return (
    <div className={styles.wrapper}>
      {transitions.map(({ item: screen, props, key }) => {
        return screen === 'full' && song ? (
          <animated.div className={styles.full} style={props} key={key}>
            <div className={styles.background}>
              <img src={song.image} alt="" />
            </div>
            <div className={styles.content}>
              <div className={styles.title}>
                <div className="left">
                  <IconButton onClick={() => setScreen('small')}>
                    <ArrowBackIcon />
                  </IconButton>
                  <div>
                    <h3>{song.name}</h3>
                    <span className="singer">
                      <span>{song.singer}</span>
                      <ChevronRightIcon />
                    </span>
                  </div>
                </div>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </div>
              <div
                className={styles.middle}
                onClick={() => setIsLyric((v) => !v)}
              >
                {lyricTransitions.map(({ item: isLyric, props, key }) => (
                  <animated.div style={props} key={key}>
                    {isLyric ? (
                      <div className={styles.lyric}>
                        {!song.lyric ? (
                          <div className="null">
                            <h3>纯音乐，请欣赏</h3>
                          </div>
                        ) : (
                          <div className="content" ref={scrollRef}>
                            {song.lyric.lines.map((l, i) => {
                              return (
                                <p
                                  key={i}
                                  className={cx('item', {
                                    active: i === lyricIndex
                                  })}
                                >
                                  {l.txt}
                                </p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.noLyric}>
                        <div className="image">
                          <img src={song.image} alt="" />
                        </div>
                        <div
                          className="icons"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>
                            <FavoriteBorderIcon />
                          </span>
                          <span>
                            <GetAppIcon />
                          </span>
                          <span>
                            <InvertColorsIcon />
                          </span>
                          <span>
                            <MessageIcon />
                          </span>
                          <span>
                            <MoreVertIcon />
                          </span>
                        </div>
                      </div>
                    )}
                  </animated.div>
                ))}
              </div>
              <div
                className={styles.bottom}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="timeline">
                  <span>{parseDuration(time)}</span>
                  <div
                    className="middle"
                    onTouchStart={(e) => {
                      const { left } = e.target.getBoundingClientRect();
                      const width = e.target.clientWidth;
                      const { clientX } = e.touches[0];
                      const offsetX = clientX - left;
                      const percent = offsetX / width;
                      const time = song.duration * percent;
                      audioRef.current.currentTime = time / 1000;
                      setTime(time);
                    }}
                  >
                    <div className="background" />
                    <div className="content">
                      <div
                        style={{ width: `${(time / song.duration) * 100}%` }}
                        className="left"
                      ></div>
                      <div
                        className="right"
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setIsTouch(true);
                          const target = e.target.parentElement.parentElement;
                          const { left } = target.getBoundingClientRect();
                          const width = target.clientWidth;
                          touchObjRef.current = {
                            left,
                            width
                          };
                        }}
                        onTouchMove={(e) => {
                          e.stopPropagation();
                          if (!isTouch) {
                            return;
                          }
                          const { clientX } = e.touches[0];
                          const { left, width } = touchObjRef.current;
                          if (clientX < left || clientX > width + left) {
                            return;
                          }
                          const offsetX = clientX - left;
                          const percent = offsetX / width;
                          const time = song.duration * percent;
                          setTime(time);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          if (!isTouch) {
                            return;
                          }
                          setIsTouch(false);
                          audioRef.current.currentTime = time / 1000;
                        }}
                      >
                        <span></span>
                      </div>
                    </div>
                  </div>
                  <span>{parseDuration(song.duration)}</span>
                </div>
                <div className="icons">
                  <span onClick={() => toggleMode()}>
                    {modes.find((m) => m.mode === mode).icon}
                  </span>
                  <span onClick={_prev}>
                    <SkipPreviousIcon />
                  </span>
                  <span
                    className="play"
                    onClick={() => {
                      playing ? pause() : play();
                    }}
                  >
                    {playing ? (
                      <PauseCircleOutlineIcon />
                    ) : (
                      <PlayCircleOutlineIcon />
                    )}
                  </span>
                  <span onClick={_next}>
                    <SkipNextIcon />
                  </span>
                  <span onClick={() => setOpen(true)}>
                    <QueueMusicIcon />
                  </span>
                </div>
              </div>
            </div>
          </animated.div>
        ) : (
          <animated.div
            className={styles.small}
            onClick={() => song && setScreen('full')}
            key={key}
            style={props}
          >
            {song ? (
              <React.Fragment>
                <div className="left">
                  <img src={song.image} alt="" />
                  <div>
                    <Typography variant="body1">{song.name}</Typography>
                    <Typography variant="caption">
                      {!song.lyric
                        ? '纯音乐，请欣赏'
                        : song.lyric.lines[lyricIndex]
                        ? song.lyric.lines[lyricIndex].txt
                        : ''}
                    </Typography>
                  </div>
                </div>
                <div className="right">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      playing ? pause() : play();
                    }}
                  >
                    {playing ? (
                      <PauseCircleOutlineIcon />
                    ) : (
                      <PlayCircleOutlineIcon />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                  >
                    <QueueMusicIcon />
                  </IconButton>
                </div>
              </React.Fragment>
            ) : (
              <h3>听见好音乐~</h3>
            )}
          </animated.div>
        );
      })}
      {loading && (
        <div className={styles.loading}>
          <Loading />
        </div>
      )}
      <audio
        ref={audioRef}
        src={song ? song.url : './slience.mp3'}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={() => {
          setTime(0);
          canplay.current = false;
        }}
      />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={!!modeMessage}
        autoHideDuration={1200}
        onClose={() => setModeMessage('')}
        className={styles.snackbar}
        
      >
        <SnackbarContent
          className="content"
          message={<span>{modeMessage}</span>}
        ></SnackbarContent>
      </Snackbar>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
      >
        <div className={styles.drawer}>
          <div className="top">
            <div>
              <span onClick={() => toggleMode()}>
                {modes.find((m) => m.mode === mode).icon}
              </span>
              <span>{modes.find((m) => m.mode === mode).name}</span>
              <span>{` (${list.length})`}</span>
            </div>
            <IconButton onClick={_empty}>
              <DeleteIcon />
            </IconButton>
          </div>
          <div className="content">
            {list.map((s, i) => (
              <div
                key={i}
                className={cx('item', {
                  active: i === index
                })}
              >
                <Typography
                  noWrap
                  component="div"
                  onClick={() => playSingle(s)}
                >
                  <Typography
                    display="inline"
                    variant="subtitle1"
                  >{`${s.name} - `}</Typography>
                  <Typography display="inline" variant="caption">
                    {s.singer || s.artists.map((a) => a.name).join('/')}
                  </Typography>
                </Typography>
                <IconButton onClick={() => _delete(s.id)}>
                  <CloseIcon />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default Player;
