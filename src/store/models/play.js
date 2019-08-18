import { action } from 'easy-peasy';

export default {
  playing: false,
  list: [],
  index: -1,
  screen: 'small',
  changeScreen: action((state, screen) => {
    state.screen = screen;
  })
};
