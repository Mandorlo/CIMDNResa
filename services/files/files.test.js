const files = require('./files.js')
const param = require('../param/param.js')

test('clearFolder', async () => {
  let res = await files.clearFolder(param.downloads_dir)
  expect(res).toBe(1)
})

test('isDir', () => {
  let res1 = files.isDir(param.network.default_frat_dir)
  let res2 = files.isDir(param.network.default_cimdn_dir)
  expect.assertions(2)
  expect(res1).toBe(true)
  expect(res2).toBe(true)
})
