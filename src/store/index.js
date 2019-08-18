import { createStore } from 'easy-peasy';
import global from './models/global';
import play from './models/play';

const store = createStore({
  global,
  play
});

export default store;
