const invoice = require('./invoice.js')
const moment = require('moment')

test('dosssierIsRefacturable', async () => {
  let input = [2513, 'TC02814*01']
  let output = [true, false]
  try {
    expect.assertions(input.length)
    for (let i = 0; i < input.length; i++) {
      let res = await invoice.dosssierIsRefacturable(input[i])
      expect(res).toBe(output[i])
    }
  } catch (e) {
    console.log(e)
  }
})

test('factnum2year', () => {
  let input = ['F 18005', '16004', '9025', '8123']
  let output = [2018, 2016, 2009, 2018]
  expect.assertions(input.length)
  for (let i = 0; i < input.length; i++) {
    let annee = invoice.factnum2year(input[i])
    expect(annee).toBe(output[i])
  }
})

test('factureExists', async () => {
  try {
    let o1 = await invoice.factureExists('F 18001')
    let r1 = {
      val: true,
      dir: "Z:\\Factures émises\\Frat\\2018"
    }

    let o2 = await invoice.factureExists('F 17251', 2017)
    let r2 = {
      val: true,
      dir: "Z:\\Factures émises\\Frat\\2017"
    }

    let o3 = await invoice.factureExists('F 16999', 2016)
    let r3 = {
      val: false,
      dir: ""
    }

    let o4 = await invoice.factureExists('F 6007', 2016)
    let r4 = {
      val: true,
      dir: "Z:\\Factures émises\\CIMDN\\2016"
    }

    let year_refac = invoice.factnum2year("F 9233")
    let o5 = await invoice.factureExists("F 9233", year_refac)

    expect.assertions(5)
    expect(o1).toEqual(r1);
    expect(o2).toEqual(r2);
    expect(o3).toEqual(r3);
    expect(o4).toEqual(r4);
    expect(o5.val).toEqual(false);
  } catch (e) {
    console.log(e)
  }
});
