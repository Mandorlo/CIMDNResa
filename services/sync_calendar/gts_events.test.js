const sync = require('./gts_events.js');

test('collapse', () => {
  let list = [{a:1, b:2},{a:3, b:2},{a:4, b:2},{a:1, b:2},{a:62, b:3},{a:48, b:53}]
  let f_filter = (un, deux) => (un.a % 2 == deux.a % 2)
  let f_merge = (un, deux) => {
    if (un.a < deux.a) {
      return [un]
    } else {
      return [deux]
    }
  }
  let expected = [{a:1, b:2},{a:4, b:2},{a:1, b:2},{a:48, b:53}]
  expect(sync.collapse(list, f_filter, f_merge)).toEqual(expected);
});
