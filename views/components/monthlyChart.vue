<template>
<div class="mc_root">
  <canvas id="MonthChart" ref="MonthChart" width="300" height="100"></canvas>
</div>
</template>

<style>
</style>

<script>
import moment from 'moment'

export default {
  name: 'monthlyChart',
  data: function() {
    return {
      thisyear: moment().year(),
      thismonth: moment().month()+1, // +1 nécessaire car moment indexe les mois à 0
      mois: ['', 'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: null,
      MonthChart: null
    }
  },
  mounted: function() {
    this.loadData();
  },
  methods: {

    loadData: function() {
      let myPromises = [];
      [`/stats/query/flex/mois/ca/year/false`, `/stats/query/flex/mois/ca/year/true`].forEach(url => {
        myPromises.push(getJSON(url))
      })
      Promise.all(myPromises).then(mystats => {
        let data = {
          lastYear: mystats[0].filter(e => e.f == this.thisyear-1),
          currYearStatus: mystats[0].filter(e => e.f == this.thisyear),
          currYearForecast: mystats[1].filter(e => e.f == this.thisyear)
        }
        console.log("monthlychart", data)
        this.drawChart(this.$refs.MonthChart, data)
      }).catch(e => {
        console.log("Unable to get data for monthlyChart :(", e)
      })
    },

    drawChart: function(canvas, data) {
      if (!data || !canvas || !data.lastYear || !data.currYearStatus) return
      let labels = data.lastYear.map(el => el.x)
      // last year
      let d_lastyear = new Array(12).fill(0);
      data.lastYear.forEach(el => {
        d_lastyear[parseInt(el.x)-1] = el.y
      })
      // current year value
      let d_currval = new Array(12).fill(0);
      data.currYearStatus.forEach(el => d_currval[parseInt(el.x)-1] = el.y)
      let bc_currval = new Array(12).fill(0);
      data.currYearStatus.forEach((el, i) => {
        if (el.y >= data.lastYear[i].y) bc_currval[parseInt(el.x)-1] = 'rgba(50,200,50,0.4)';
        else if (el.y < data.lastYear[i].y && parseInt(el.x) < this.thismonth) bc_currval[parseInt(el.x)-1] = 'rgba(210,50,50,0.4)';
        else bc_currval[parseInt(el.x)-1] = 'rgba(50,50,200,0.4)'
      })
      let percent_currval = d_currval.map((v, i) => Math.round(100 * v / d_lastyear[i], 0))
      // current year forecast
      let d_currfor = new Array(12).fill(0);
      data.currYearForecast.forEach(el => {
        if (parseInt(el.x) >= this.thismonth) d_currfor[parseInt(el.x)-1] = el.y
      })
      let bc_currfor = new Array(12).fill(0);
      data.currYearForecast.forEach((el, i) => {
        if (el.y >= data.lastYear[i].y) bc_currfor[parseInt(el.x)-1] = 'rgba(50,200,50,0.1)';
        else if (el.y < data.lastYear[i].y && parseInt(el.x) < this.thismonth) bc_currfor[parseInt(el.x)-1] = 'rgba(210,50,50,0.1)';
        else bc_currfor[parseInt(el.x)-1] = 'rgba(50,50,200,0.1)'
      })
      let percent_currfor = d_currfor.map((v, i) => Math.round(100 * v / d_lastyear[i], 0))

      let ctx = canvas.getContext('2d')

      if (this.MonthChart) this.MonthChart.destroy()
      this.MonthChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: this.thisyear-1,
            data: d_lastyear,
            borderWidth: 1
          },
          {
            label: this.thisyear + ' status',
            data: d_currval,
            backgroundColor: bc_currval
          },
          {
            label: this.thisyear + ' forecast',
            data: d_currfor,
            backgroundColor: bc_currfor,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{
              stacked: true,
              ticks: {
                callback: this.monthFR
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          tooltips: {
            enabled: true,
            mode: 'label',
            callbacks: {
              title: function(tooltipItems, data) {
                return "titre_tooltip"
              },
              label: (tooltipItems, data) => {
                if (tooltipItems.index+1 < this.thismonth && tooltipItems.datasetIndex == 2) return "";
                if (tooltipItems.index+1 > this.thismonth && tooltipItems.datasetIndex == 1) return "";
                let s = Math.round(tooltipItems.yLabel, 0).toString()
                if (s.length > 3) s = s.substr(0, s.length-3) + ' ' + s.substr(s.length-3)
                s += ' \u20AA'
                if (tooltipItems.datasetIndex == 1) s += ' (' + percent_currval[tooltipItems.index]  + '%)';
                else if (tooltipItems.datasetIndex == 2) s += ' (' + percent_currfor[tooltipItems.index]  + '%)';
                return s
              }
            }
          },
        }
      });
    },
    monthFR(lab) {
      return this.mois[parseInt(lab)]
    }
  }
}
</script>
