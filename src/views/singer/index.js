import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { useRefMounted, useToggle } from 'react-use';
import { isEmpty } from 'lodash';
import fetch from '@/share/fetch';
import Loading from '@/components/loading';
import produce from 'immer';
import cx from 'classnames';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '1.6rem'
    },
    '& h3': {
      margin: 0
    }
  },
  search: {
    '& h6': {
      margin: '6px 0',
      fontSize: '14px',
      display: 'inline-block',
      minWidth: '60px',
      textAlign: 'center',
      transition: 'color 0.25s linear',
      '&.active': {
        color: 'red'
      }
    }
  },
  content: {
    padding: '0 12px',
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
    marginBottom: '48px',
    '& .item': {
      display: 'flex',
      margin: '12px 0',
      alignItems: 'center',
      '& img': {
        width: '15%',
        borderRadius: '50%',
        overflow: 'hidden',
        marginRight: '12px'
      }
    }
  }
}));

const top = [
  {
    code: '10',
    name: '华语'
  },
  {
    code: '20',
    name: '欧美'
  },
  {
    code: '60',
    name: '日本'
  },
  {
    code: '70',
    name: '韩国'
  },
  {
    code: '40',
    name: '其他'
  }
];

const bottom = [
  {
    code: '01',
    name: '男'
  },
  {
    code: '02',
    name: '女'
  },
  {
    code: '03',
    name: '乐队/组合'
  }
];

function Singer({ history }) {
  const mountedRef = useRefMounted();

  const [select, setSelect] = useState({
    top: '10',
    bottom: '01'
  });

  const code = select.top + select.bottom;

  const [result, setResult] = useState({});
  const [loading, toggle] = useToggle(false);

  const gerResult = async (code) => {
    toggle();
    const response = await fetch('/artist/list', {
      params: {
        cat: code
      }
    });
    if (response.code === 200 && mountedRef.current) {
      setResult(
        produce((result) => {
          result[code] = response.artists;
        })
      );
      toggle();
    }
  };

  const singer = result[code] || [];

  useEffect(() => {
    if (isEmpty(singer)) {
      gerResult(code);
    }
  }, [code]);

  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>
          <IconButton onClick={() => history.goBack()}>
            <ArrowBackIcon />
          </IconButton>
          <h3>歌手分类</h3>
        </div>
      </div>
      <div className={styles.search}>
        <div>
          {top.map((v, i) => (
            <Typography
              className={cx({
                active: select.top === v.code
              })}
              key={i}
              display="inline"
              variant="subtitle2"
              onClick={() =>
                select.top !== v.code &&
                setSelect(
                  produce((t) => {
                    t.top = v.code;
                  })
                )
              }
            >
              {v.name}
            </Typography>
          ))}
        </div>
        <div>
          {bottom.map((v, i) => (
            <Typography
              className={cx({
                active: select.bottom === v.code
              })}
              key={i}
              display="inline"
              variant="subtitle2"
              onClick={() =>
                select.bottom !== v.code &&
                setSelect(
                  produce((t) => {
                    t.bottom = v.code;
                  })
                )
              }
            >
              {v.name}
            </Typography>
          ))}
        </div>
      </div>
      <Divider />
      <div className={styles.content}>
        {loading ? (
          <Loading />
        ) : (
          <div>
            {singer.map((s, i) => (
              <div key={i} className="item">
                <img
                  data-expand="-10"
                  data-src={`${s.picUrl}?param=100y100`}
                  className="lazyload"
                  alt=""
                  src="./loading.gif"
                />
                <Typography variant="subtitle1" display="inline">
                  {s.name}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Singer;
