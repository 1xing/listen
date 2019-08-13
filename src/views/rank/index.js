import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {
  useSessionStorage,
  useRefMounted,
  useMount,
  useToggle
} from 'react-use';
import { isEmpty } from 'lodash';
import fetch from '@/share/fetch';
import Loading from '@/components/loading';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    alignItems: 'center'
  },
  content: {
    padding: '0 12px',
    flex: 1,
    overflow: 'hidden auto',
    position: 'relative'
  },
  official: {
    overflow: 'hidden',
    '& .item': {
      display: 'flex',
      marginBottom: '6px',
      '& img': {
        maxWidth: '28%',
        borderRadius: '4px',
        overflow: 'hidden'
      },
      '& .tracks': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginLeft: '6px',
        minWidth: 0
      }
    }
  },
  more: {
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
  }
}));
function Rank({ history }) {
  const mountedRef = useRefMounted();

  const [rank, setRank] = useSessionStorage('rank', {});
  const [loading, toggle] = useToggle(isEmpty(rank));

  const getRank = async () => {
    const response = await fetch('/toplist/detail');
    if (response.code === 200 && mountedRef.current) {
      const list = response.list;
      const official = list.filter((l) => !isEmpty(l.tracks));
      const more = list.filter((l) => isEmpty(l.tracks));
      setRank({ official, more });
      toggle();
    }
  };
  useMount(() => {
    loading && getRank();
  });

  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIcon />
        </IconButton>
        <h3>排行榜</h3>
      </div>
      <div className={styles.content}>
        {loading ? (
          <Loading />
        ) : (
          <div>
            <div className={styles.official}>
              <h3>官方版</h3>
              <div>
                {rank.official.map((o, i) => (
                  <div key={i} className="item">
                    <img
                      data-expand="-10"
                      data-src={`${o.coverImgUrl}?param=200y200`}
                      className="lazyload"
                      alt=""
                    />
                    <div className="tracks">
                      {o.tracks.map((t, i) => (
                        <Typography noWrap component="div" key={i}>
                          <Typography variant="body1" display="inline">
                            {`${i + 1}.`}
                          </Typography>
                          <Typography variant="body2" display="inline">
                            {`${t.first} - ${t.second}`}
                          </Typography>
                        </Typography>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.more}>
              <h3>更多榜单</h3>
              <Grid container spacing={1}>
                {rank.more.map((m, i) => (
                  <Grid item xs={4} className="item" key={i}>
                    <img
                      data-expand="-10"
                      src={`${m.coverImgUrl}?param=200y200`}
                      className="lazyload"
                      alt=""
                    />
                    <Typography variant="subtitle2" display="block">
                      {m.name}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rank;
