<template>
<div class="root_agencyrank">
  <div class="ar_card">
    <span class="ar_title">Best agency of all times</span><br>
    <span class="ar_loading" v-if="best.alltime.x=='unknown'"><i class="fa fa-spinner fa-pulse"></i></span>
    <span class="ar_agency">{{best.alltime.x}}</span><br>
    <span>{{best.alltime.y|number}} &#x20AA;</span>
  </div>
  <div class="ar_card">
    <span class="ar_title">Agency of the year</span><br>
    <span class="ar_loading" v-if="best.year.x=='unknown'"><i class="fa fa-spinner fa-pulse"></i></span>
    <span class="ar_agency">{{best.year.x}}</span><br>
    <span>{{best.year.y|number}} &#x20AA;</span>
  </div>
  <div class="ar_card">
    <span class="ar_title">Agency of the month</span><br>
    <span class="ar_loading" v-if="best.month.x=='unknown'"><i class="fa fa-spinner fa-pulse"></i></span>
    <span class="ar_agency">{{best.month.x}}</span><br>
    <span>{{best.month.y|number}} &#x20AA;</span>
  </div>
</div>
</template>

<style>
.root_agencyrank {
  display: flex;
  flex-direction: row;
}

.ar_title {
  font-weight: bold;
  font-variant: small-caps;
}

.ar_card {
  text-align: center;
  margin: 1em;
  width: 30%;
}
</style>

<script>
import moment from 'moment'

export default {
  name: 'agencyRank',
  data: function() {
    return {
      thisday: moment().format('MMDD'),
      thismonth: moment().format('MM'),
      thismonthnum: parseInt(moment().format('MM')),
      thisyear: moment().year(),
      best: {
        alltime: {
          x: 'unknown', // name of the agency
          y: 0 // chiffre d'affaire
        },
        year: {
          x: 'unknown', // name of the agency
          y: 0 // chiffre d'affaire
        },
        month: {
          x: 'unknown', // name of the agency
          y: 0 // chiffre d'affaire
        }
      }
    }
  },
  mounted: function() {
    let urls = [`/stats/query/flex/agency/ca/ALL`, `/stats/query/flexdates/agency/ca/0100/${this.thisday}/false`, `/stats/query/flexdates/agency/ca/${this.thismonth}00/${this.thisday}/false`]
    let attrs = ['alltime', 'year', 'month']
    urls.forEach((url, ind) => {
      setTimeout(_ => getJSON(url).then(mystats => {
        if (attrs[ind] != 'alltime') mystats = mystats.filter(e => e.year == this.thisyear);
        this.best[attrs[ind]] = this.maxAgency(mystats, 'y')
      }).catch(e => {
        console.log(url, "Unable to get stats flex/agency/ca/ALL in agencyRank :(", e)
      }), parseInt(Math.random() * 2000))
    })
  },
  filters: {
    number: function(value) {
      let s = Math.round(value, 0).toString();
      if (s.length > 3) s = s.substr(0, s.length - 3) + ' ' + s.substr(s.length - 3)
      return s
    }
  },
  methods: {
    maxAgency: function(arr, attr) {
      if (!arr || !arr.length) return {}
      let res = arr[0]
      let maxres = arr[0][attr]
      arr.forEach(el => {
        if (el[attr] > maxres && el.x != 'COMMUNAUTE DU CHEMIN NEUF') {
          maxres = el[attr];
          res = el
        }
      })
      return res
    }
  }
}
</script>
