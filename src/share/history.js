import { createHashHistory } from 'history';

const history = createHashHistory();

history.listen(() => {});

export default history;
