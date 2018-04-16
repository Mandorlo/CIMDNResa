const files = require('./files.js')
const param = require('../param/param.js')

test('clearFolder', async () => {
  let res = await files.clearFolder(param.downloads_dir)
  expect(res).toBe(1)
})
