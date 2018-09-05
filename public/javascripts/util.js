async function remoteCall(fn_name, args) {
  let url = `/RFC/${fn_name}`
  for (let arg of args) {
    if (typeof arg != 'string') arg = JSON.stringify(arg);
    console.log('arg', arg)
    url += `/${encodeURIComponent(arg)}`
  }
  console.log('calling remote function : ' + url)
  return getJSON(url)
}

async function getJSON(url) {
  let res = await ajax(url)
  return JSON.parse(res)
  // return new Promise((resolve, reject) => {
  //   ajax(url).then(res => {
  //     resolve(JSON.parse(res))
  //   }).catch(e => {
  //     reject(e)
  //   })
  // })
}

function ajax(url) {
  var xhttp;
  xhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        resolve(this.responseText);
      } else if (this.readyState == 4) {
        reject(this);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
  })
}

function niceMoneyNumber(nb) {
  var n = Math.abs(nb);
  var partieEntiere = parseInt(n);
  var partieDecimale = Math.round((n - partieEntiere) * 100);
  if (partieDecimale < 10) partieDecimale = "0" + partieDecimale;

  var left = parseInt(partieEntiere / 1000);
  var mem_partent = partieEntiere;
  var s = "";
  var mem = left;
  if (left == 0) s = partieEntiere.toString();
  while (left > 0) {
    s = threePad(mem_partent - left * 1000) + " " + s;
    mem_partent = parseInt(mem_partent / 1000);
    mem = left;
    left = parseInt(left / 1000)
  }
  if (partieEntiere > 999) s = mem + " " + s;
  if (s == "") s = "0";
  s = s.trim() + "." + partieDecimale;
  if (nb < 0) s = '-' + s;
  return s;
}

function threePad(i) {
  var s = i.toString();
  while (s.length < 3) s = '0' + s;
  return s
}

Array.prototype.splitBy = function(fn) {
  let ids = []
  let res = []
  for (let i = 0; i < this.length; i++) {
    let id = fn(this[i])
    let n = ids.indexOf(id)
    if (n > -1) {
      res[n].push(this[i])
    } else {
      ids.push(id)
      res.push([this[i]])
    }
  }
  return res
}

Array.prototype.sortBy = function(fn) {
  if (typeof fn == 'string') fn = (el) => el[fn];
  return this.sort((a,b) => {
    if (fn(a) < fn(b)) return -1;
    return 1
  })
}

Array.prototype.sum = function() {
  return this.reduce((a,b) => a+b, 0)
}

// renvoie la différence (au sens d'ensembles) o2 - o1
// càd renvoie un objet avec les paires key/val de o2 qui ne sont pas dans o1
// si strict = true on compare key et val, sinon on ne compare que la présence de key dans o1
function objDiff(o2, o1, strict = true) {
  let o = {}
  for (let attr in o2) {
    if (o1[attr] != o2[attr] || (!strict && !o1.hasOwnProperty(attr))) {
      o[attr] = o2[attr]
    }
  }
  return o
}

// joinObj({a:1,b:2}, '&', '=') = "a=1&b=2"
function joinObj(o, sep_attr = '&', sep_val = '=') {
  let arr = []
  for (let attr in o) {
    arr.push(attr + sep_val + o[attr])
  }
  return arr.join(sep_attr)
}

function range(nb_el, el_val = null) {
  let res = []
  for (let i = 0; i < nb_el; i++) {
    if (el_val === null) el_val = i;
    res.push(el_val)
  }
  return res
}