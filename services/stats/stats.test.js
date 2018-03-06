const stats = require('./stats.js')

test('freq_per_year', async () => {
  let res = await stats.get('freq_per_year')
  expect(res.length).toBeGreaterThan(0)
})

test('flex query', async () => {
  let res = await stats.getFlex('agency', 'pax')
  expect.assertions(3)
  expect(res.length).toBeGreaterThan(0)
  expect(res[0]).toHaveProperty('x')
  expect(res[0]).toHaveProperty('y')
})
