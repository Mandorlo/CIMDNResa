const resa = require('./resa.js')

test('getState', async () => {
  let input = ['2512', '9999']
  let output = [3, -1]
  expect.assertions(input.length)
  for (let i = 0; i < input.length; i++) {
    let b = await resa.getState(input[i])
    expect(b).toBe(output[i])
  }
})

test('dossierExists', async () => {
  let input = ['2912', 2815, 3012]
  let output = [true, true, false]
  expect.assertions(input.length)
  for (let i = 0; i < input.length; i++) {
    let b = await resa.dossierExists(input[i])
    expect(b).toBe(output[i])
  }
})

test('cleanDossierNum', () => {
  let n = resa.cleanDossierNum(2513)
  expect(n).toBe('TC02513*01')
})
