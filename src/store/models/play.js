import { action, computed, thunk } from 'easy-peasy';
import fetch from '@/share/fetch';
import { random } from 'lodash';

export default {
  init: false,
  playing: false,
  list: [],
  index: -1,
  screen: 'small',
  loading: false,
  mode: 0,
  song: computed(({ list, index }) => {
    return list[index] || null;
  }),
  initSuccess: action((state, callback) => {
    state.init = true;
    callback();
  }),
  toggleMode: action((state) => {
    let { mode } = state;
    mode += 1;
    if (mode > 2) {
      mode = 0;
    }
    state.mode = mode;
  }),
  setLoading: action((state, loading) => {
    state.loading = loading;
  }),
  setScreen: action((state, screen) => {
    state.screen = screen;
  }),
  setPlaying: action((state, playing) => {
    state.playing = playing;
  }),
  setList: action((state, list) => {
    state.list = [...list];
  }),
  play: action((state, { list, index }) => {
    state.list = [...list];
    state.index = index;
  }),
  playSingle: thunk(async (actions, song, { getState }) => {
    if (!song) {
      return;
    }
    const { list, screen, playing, index: globalIndex } = getState();
    let index = list.findIndex((s) => s.id === song.id);
    if (index >= 0 && list[index].image) {
      index !== globalIndex &&
        actions.play({
          list,
          index
        });
      return;
    }
    let _song = {};
    if (!song.image) {
      _song = {
        id: song.id,
        name: song.name,
        duration: song.duration
      };
      _song.url = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
      _song.singer = song.artists.map((a) => a.name).join('/');
      actions.setLoading(true);
      let response = await fetch.get('/album', {
        params: {
          id: song.album.id
        }
      });
      if (response.code === 200) {
        _song.image = response.album.picUrl;
      }
      actions.setLoading(false);
    } else {
      _song = song;
    }
    if (index < 0) {
      list.unshift(_song);
      index = 0;
    } else {
      list[index] = _song;
    }
    actions.play({
      list,
      index
    });
    if (!playing && screen === 'small') {
      actions.setScreen('full');
    }
  }),
  playAll: thunk(async (actions, list, { getState }) => {
    if (!Array.isArray(list) || list.length <= 0) {
      return;
    }
    await actions.playSingle(list[0]);
    actions.setList([getState().list[0]].concat(list.slice(1)));
  }),
  next: thunk(async (actions, _, { getState }) => {
    const { index, mode, list } = getState();
    let i = index;
    if (mode === 2) {
      do {
        i = random(list.length - 1);
      } while (i !== index);
    } else {
      i += 1;
      if (i > list.length - 1) {
        i = 0;
      }
    }
    await actions.playSingle(list[i]);
  }),

  prev: thunk(async (actions, _, { getState }) => {
    const { index, mode, list } = getState();
    let i = index;
    if (mode === 2) {
      do {
        i = random(list.length - 1);
      } while (i !== index);
    } else {
      i -= 1;
      if (i < 0) {
        i = list.length - 1;
      }
    }
    await actions.playSingle(list[i]);
  })
};
