const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g;

export default class Lyric {
  constructor(lrc) {
    this.lines = [];
    this._init(lrc);
  }

  _init(lrc) {
    const lines = lrc.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let result = timeExp.exec(line);
      if (result) {
        const txt = line.replace(timeExp, '').trim();
        if (txt) {
          this.lines.push({
            time: result[1] * 60 * 1000 + result[2] * 1000 + (result[3] | 0),
            txt
          });
        }
      }
    }

    this.lines.sort((a, b) => {
      return a.time - b.time;
    });
  }
  findIndex(time) {
    for (let i = 0; i < this.lines.length - 1; i++) {
      if (time > this.lines[i].time && time <= this.lines[i + 1].time) {
        return i;
      }
    }
    return 0;
  }
}
