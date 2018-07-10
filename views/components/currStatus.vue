<template>
<div class="root_currstat">

  <h3 class="soustitre">{{thisyear}}</h3>
  <progressbar2 unit="₪" :title="'Par rapport au CA de '+(thisyear-1).toString()" :value="yearStatus.ca.curryear" :value_prevision="yearProj.ca.curryear" :max="yearProj.ca.lastyear"></progressbar2>

  <table>
    <tr>
      <td></td>
      <td v-for="attr in ['pax', 'resa', 'ca']" v-bind:key="attr"><b>{{labels[attr]}}</b></td>
    </tr>
    <tr>
      <td class="line_title">Valeur brute</td>
      <td v-for="attr in ['pax', 'resa', 'ca']" v-bind:key="attr">{{yearStatus[attr].curryear|number}} <span v-if="attr=='ca'">&#8362;</span></td>
    </tr>
    <tr>
      <td class="line_title">{{thisyear-1}}</td>
      <td v-for="attr in ['pax', 'resa', 'ca']" v-bind:key="attr">
        {{yearStatus[attr].lastyear|number}} <span v-if="attr=='ca'">&#8362;</span>
        (<span v-bind:class="{ alerte: yearStatus[attr].lastyear > yearStatus[attr].curryear, good:  yearStatus[attr].lastyear < yearStatus[attr].curryear}">{{(yearStatus[attr].curryear - yearStatus[attr].lastyear) * 100 / yearStatus[attr].lastyear|number}}%</span>)
      </td>
    </tr>
    <tr>
      <td class="line_title">Moyenne 3 dernières années</td>
      <td v-for="attr in ['pax', 'resa', 'ca']" v-bind:key="attr">
        {{yearStatus[attr].moyyear|number}} <span v-if="attr=='ca'">&#8362;</span>
        (<span v-bind:class="{ alerte: yearStatus[attr].moyyear > yearStatus[attr].curryear, good: yearStatus[attr].moyyear < yearStatus[attr].curryear}">{{(yearStatus[attr].curryear - yearStatus[attr].moyyear) * 100 / yearStatus[attr].moyyear|number}}%</span>)
      </td>
    </tr>
  </table>

  <h3 class="soustitre">{{months[thismonthnum]}} {{thisyear}}</h3>
  <monthlychart></monthlychart>

</div>
</template>

<style scoped>
h3.soustitre {
  font-size: 1.4em;
  margin: 0.2em;
}
.root_currstat {
  padding: 1em;
}
.line_title {
  font-weight: bold;
  text-align: right;
  padding-right: 0.5em;
}
.block {
  margin-bottom: 1em;
}
.alerte {
  color: red;
}
.alerte::before {
  content: '\25bc';
}
.good {
  color: green;
}
.good::before {
  content: '\25b2';
}
</style>

<script>
import moment from 'moment'
import progressBar2 from './ui/progressBar2.vue'
import monthlyChart from './components/monthlyChart.vue'

export default {
  name: 'currStatus',
  components: {
    "progressbar2": progressBar2,
    'monthlychart': monthlyChart
  },
  data: function() {
    let submodele = {
      curryear: 0,
      lastyear: 0,
      moyyear: 0
    }
    let modele = {
      pax: Object.assign({}, submodele),
      resa: Object.assign({}, submodele),
      ca: Object.assign({}, submodele)
    }
    return {
      months: ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      labels: {
        pax: 'Nombre de visiteurs',
        ca: 'Chiffre d\'affaire',
        resa: 'Nombre de réservations'
      },
      thisday: moment().format('MMDD'),
      thismonth: moment().format('MM'),
      thismonthnum: parseInt(moment().format('MM')),
      thisyear: moment().year(),
      donnees: {
        pax: [],
        resa: [],
        ca: []
      },
      yearStatus: Object.assign({}, modele),
      yearProj: Object.assign({}, modele),
      monthStatus: Object.assign({}, modele),
      monthProj: Object.assign({}, modele)
    }
  },
  mounted: function() {
    this.loadData()
  },
  filters: {
    number: function(value) {
      let s = Math.round(value, 0).toString();
      if (s.length > 3) s = s.substr(0,s.length-3) + ' ' + s.substr(s.length-3)
      return s
    }
  },
  methods: {
    loadData: function() {
      ['pax', 'resa', 'ca'].forEach(y => {
        // YEAR ============
        let url = `/stats/query/flexdates/year/${y}/0100/${this.thisday}/false`
        getJSON(url).then(mystats => {
          this.donnees[y] = mystats
          let curryear_stats = mystats.filter(e => e.x == this.thisyear);
          let lastyear_stats = mystats.filter(e => e.x == this.thisyear - 1);
          let moyyear_stats = this.moyenne(mystats);
          this.yearStatus[y].curryear = (curryear_stats) ? curryear_stats[0].y : 0;
          this.yearStatus[y].lastyear = (lastyear_stats) ? lastyear_stats[0].y : 0;
          this.yearStatus[y].moyyear = (moyyear_stats) ? moyyear_stats : 0;
        }).catch(e => {
          console.log(url, "Unable to get yearly basic stats in currStatus :(", e)
        })
        // YEAR PROJECTION ============
        url = `/stats/query/flexdates/year/${y}/0100/1232/true`
        getJSON(url).then(mystats => {
          this.donnees[y] = mystats
          let curryear_stats = mystats.filter(e => e.x == this.thisyear);
          let lastyear_stats = mystats.filter(e => e.x == this.thisyear - 1);
          let moyyear_stats = this.moyenne(mystats);
          this.yearProj[y].curryear = (curryear_stats) ? curryear_stats[0].y : 0;
          this.yearProj[y].lastyear = (lastyear_stats) ? lastyear_stats[0].y : 0;
          this.yearProj[y].moyyear = (moyyear_stats) ? moyyear_stats : 0;
        }).catch(e => {
          console.log(url, "Unable to get yearly projection stats in currStatus :(", e)
        })
        // MONTH ============
        url = `/stats/query/flexdates/year/${y}/${this.thismonth}00/${this.thisday}/false`
        getJSON(url).then(mystats => {
          this.monthStatus[y].curryear = mystats.filter(e => e.x == this.thisyear)[0].y
          this.monthStatus[y].lastyear = mystats.filter(e => e.x == this.thisyear - 1)[0].y
          this.monthStatus[y].moyyear = this.moyenne(mystats);
        }).catch(e => {
          console.log(url, "Unable to get monthly basic stats in currStatus :(", e)
        })
        // MONTH PROJECTION ============
        url = `/stats/query/flexdates/year/${y}/${this.thismonth}00/${this.thismonth}32/true`
        getJSON(url).then(mystats => {
          this.monthProj[y].curryear = mystats.filter(e => e.x == this.thisyear)[0].y
          this.monthProj[y].lastyear = mystats.filter(e => e.x == this.thisyear - 1)[0].y
          this.monthProj[y].moyyear = this.moyenne(mystats);
        }).catch(e => {
          console.log(url, "Unable to get monthly projection stats in currStatus :(", e)
        })
      })
    },
    moyenne: function(mystats) {
      // moyenne spéciale sur les 4 dernières années (année courante excluse)
      let total = 0;
      let cumul = 0;
      mystats.forEach(e => {
        if (!e || !e.x) throw {
          'errnum': 'INVALID_PARAM',
          'fun': 'moyenne',
          'details': 'unknown element format in input param : ' + JSON.stringify(e)
        }
        if (e.y === null || e.y === undefined) e.y = 0
        if (e.x > this.thisyear - 4 && e.x < this.thisyear) {
          total += e.y;
          cumul++
        }
      })
      return (cumul > 0) ? Math.round(total / cumul, 0) : 0;
    }
  }
}
</script>
