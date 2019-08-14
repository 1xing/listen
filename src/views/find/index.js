import React, { useState } from 'react';
import { useSessionStorage, useMount, useRefMounted } from 'react-use';
import { isEmpty, sampleSize } from 'lodash';
import fetch from '@/share/fetch';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import { virtualize, autoPlay } from 'react-swipeable-views-utils';
import { mod } from 'react-swipeable-views-core';
import cx from 'classnames';
import Divider from '@material-ui/core/Divider';
import StoreIcon from '@material-ui/icons/Store';
import TodayIcon from '@material-ui/icons/Today';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import RadioIcon from '@material-ui/icons/Radio';
import MovieIcon from '@material-ui/icons/Movie';
import ChevronRight from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const VirtualizeSwipeableViews = autoPlay(virtualize(SwipeableViews));

const useStyles = makeStyles(({ palette }) => ({
  banner: {
    margin: '0 12px',
    position: 'relative',
    '& .item': {
      fontSize: 0,
      '&>img': {
        borderRadius: '4px',
        overflow: 'hidden'
      }
    },
    '& .dots': {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '6px',
      textAlign: 'center',
      '&>span': {
        display: 'inline-block',
        width: '6px',
        height: '6px',
        margin: '0 2px',
        borderRadius: '50%',
        backgroundColor: palette.action.disabledBackground
      },
      '& .active': {
        backgroundColor: palette.secondary.main
      }
    }
  },
  nav: {
    display: 'flex',
    padding: '12px',
    justifyContent: 'space-between',
    '& .item': {
      textAlign: 'center',
      fontSize: '12px',
      '& .top': {
        height: '42px',
        width: '42px',
        backgroundColor: palette.secondary.main,
        borderRadius: '50%',
        margin: '0 auto',
        marginBottom: '6px',
        color: 'white',
        '&>a': {
          fontSize: '24px',
          lineHeight: '42px',
          width: '100%',
          '&>svg': {
            verticalAlign: 'sub',
            fontSize: 'inherit'
          }
        }
      }
    }
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& h4': {
      margin: 0
    }
  },
  personalized: {
    padding: '0 12px',
    overflow: 'hidden',
    '& .item': {
      '&>img': {
        borderRadius: '4px',
        overflow: 'hidden'
      },
      '& .name': {
        fontSize: '14px',
        lineHeight: 1.2,
        display: 'inline-block'
      }
    }
  },
  album: {
    padding: '0 12px',
    overflow: 'hidden',
    '& .item': {
      '&>img': {
        borderRadius: '4px',
        overflow: 'hidden'
      },
      '& .name': {
        fontSize: '14px',
        lineHeight: 1.2,
        display: 'inline-block'
      },
      '& .artist': {
        fontSize: '12px',
        color: palette.action.active
      }
    }
  }
}));

const navs = [
  // {
  //   path: '/#',
  //   name: '每日推荐',
  //   icon: <TodayIcon />
  // },
  // {
  //   path: '/#',
  //   name: '歌单',
  //   icon: <StoreIcon />
  // },
  {
    path: '/rank',
    name: '排行榜',
    icon: <EqualizerIcon />
  }
  // {
  //   path: '/#',
  //   name: '电台',
  //   icon: <RadioIcon />
  // },
  // {
  //   path: '/#',
  //   name: '直播',
  //   icon: <MovieIcon />
  // }
];

function Find() {
  const mountedRef = useRefMounted();

  const [banners, setBanners] = useSessionStorage('banners', []);
  const getBanners = async () => {
    const response = await fetch('/banner');
    if (response.code === 200 && mountedRef.current) {
      setBanners(response.banners);
    }
  };
  const [personalized, setPersonalized] = useSessionStorage('personalized', []);
  const getPersonalized = async () => {
    const response = await fetch('/personalized');
    if (response.code === 200 && mountedRef.current) {
      setPersonalized(sampleSize(response.result, 6));
    }
  };

  const [album, setAlbum] = useSessionStorage('album', []);
  const getAlbum = async () => {
    const response = await fetch('/album/newest');
    if (response.code === 200 && mountedRef.current) {
      setAlbum(sampleSize(response.albums, 6));
    }
  };

  const [index, setIndex] = useState(0);
  const handleChangeIndex = (index) => {
    const length = banners.length;
    if (index >= length) {
      index = index % length || 0;
    }
    if (index < 0) {
      const n = Math.abs(index) % length || 0;
      index = n && length - n;
    }
    setIndex(index);
  };
  const slideRenderer = (params) => {
    if (isEmpty(banners)) {
      return <div />;
    }
    const { index } = params;
    const banner = banners[mod(index, banners.length)];
    return (
      <a key={index} href="/#" className="item">
        <img src={banner.imageUrl.replace(/^http:/, 'https:')} alt="" />
      </a>
    );
  };
  useMount(() => {
    isEmpty(banners) && getBanners();
    isEmpty(personalized) && getPersonalized();
    isEmpty(album) && getAlbum();
  });
  const styles = useStyles();

  return (
    <div>
      <div className={styles.banner}>
        <VirtualizeSwipeableViews
          // index={index}
          onChangeIndex={handleChangeIndex}
          slideRenderer={slideRenderer}
        />
        <div className="dots">
          {banners.map((_, i) => {
            return (
              <span
                key={i}
                className={cx({
                  active: i === index
                })}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.nav}>
        {navs.map((nav, i) => (
          <div className="item" key={i}>
            <div className="top">
              <Link to={nav.path}>{nav.icon}</Link>
            </div>
            <span>{nav.name}</span>
          </div>
        ))}
      </div>
      <Divider />
      <div className={styles.personalized}>
        <div className={styles.title}>
          <h4>推荐歌单</h4>
          <IconButton>
            <ChevronRight />
          </IconButton>
        </div>
        <Grid container spacing={1}>
          {personalized.map((p, i) => (
            <Grid item xs={4} className="item" key={i}>
              <img
                data-expand="-10"
                src={`${p.picUrl}?param=200y200`}
                className="lazyload"
                alt=""
              />
              <Typography variant="subtitle2" display="block">
                {p.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={styles.album}>
        <div className={styles.title}>
          <h4>新碟</h4>
          <IconButton>
            <ChevronRight />
          </IconButton>
        </div>
        <Grid container spacing={1}>
          {album.map((s, i) => (
            <Grid item xs={4} className="item" key={i}>
              <img
                data-expand="-10"
                data-src={`${s.picUrl}?param=200y200`}
                className="lazyload"
                alt=""
              />
              <Grid item zeroMinWidth>
                <Typography noWrap variant="subtitle2">
                  {s.name}
                </Typography>
                <Typography noWrap variant="caption" display="block">
                  {s.artists.map((v) => v.name).join('/')}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default Find;
