function getJSON(url) {
  return new Promise((resolve, reject) => {
    ajax(url).then(res => {
      resolve(JSON.parse(res))
    }).catch(e => {
      reject(e)
    })
  })
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
