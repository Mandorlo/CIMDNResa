<template>
<div class="root_flexbarchart">
  <select v-model="xlabel">
    <option v-for="choix in x_choices" :key="choix" :value="choix">{{choix}}</option>
  </select>
  <select v-model="ylabel">
    <option v-for="choix in y_choices" :key="choix" :value="choix">{{choix}}</option>
  </select>
  <select v-model="filter_type">
    <option v-for="choix in filter_choices" :key="choix" :value="choix">{{choix}}</option>
  </select>
  <select v-model="filter_val" v-if="filterval_choices">
    <option v-for="choix in filterval_choices" :key="choix" :value="choix">{{choix}}</option>
  </select>
  <canvas id="myChart" ref="myChart" width="300" height="100"></canvas>
</div>
</template>

<style>
.root_flexbarchart {
  padding: 10px
}
</style>

<script>

export default {
  name: 'flexBarChart',
  data: function() {
    return {
      xlabel: 'year',
      ylabel: 'pax',
      filter_type: 'ALL',
      filter_val: '',
      x_choices: ['year', 'mois', 'agency'],
      y_choices: ['pax', 'resa', 'ca'],
      filter_choices: ['ALL', 'year', 'mois', 'agency'],
      filterval_choices: [],
      title_choices: {
        'pax': '# of pax',
        'resa': '# of reservations',
        'ca': 'chiffre d\'affaire'
      },
      suffixes: {
        'ca': ' ₪'
      },
      donnees: [],
      myChart: null
    }
  },
  watch: {
    xlabel: function(newVal, oldVal) {
      this.loadChart()
    },
    ylabel: function(newVal, oldVal) {
      this.loadChart()
    },
    filter_type: function(newVal, oldVal) {
      this.loadChart()
    },
    filter_val: function(newVal, oldVal) {
      let mystats = this.donnees.filter(e => e.f == this.filter_val);
      mystats = this.prepareData(mystats);
      this.drawChart(this.$refs.myChart, mystats)
    }
  },
  mounted: function() {
    this.loadChart()
  },
  methods: {
    prepareData: function(mystats) {
      if (this.xlabel != 'year' && this.xlabel != 'mois') {
        mystats = mystats.sort((a, b) => {
          if (a.y < b.y) return 1;
          else return -1
        })
        mystats = mystats.slice(0, 10)
      } else {
        mystats = mystats.sort((a, b) => {
          if (a.x > b.x) return 1;
          else return -1
        })
      }
      return mystats
    },
    loadChart: function() {
      if (this.$refs && this.$refs.myChart) {
        let url = `/stats/query/flex/${this.xlabel}/${this.ylabel}/${this.filter_type}`
        getJSON(url).then(mystats => {
          this.donnees = mystats;
          // on met à jour la liste des filtres dispos
          this.filterval_choices = mystats.map(mystats => mystats.f)
                                          .filter((val, ind, self) => self.indexOf(val) === ind)
                                          .sort();
          // cas où il y a un filtre :
          if (this.filter_val) mystats = mystats.filter(e => e.f == this.filter_val);

          mystats = this.prepareData(mystats);
          this.drawChart(this.$refs.myChart, mystats)
        }).catch(e => {
          console.log("Unable to get basic stats in flexBarChart :(", e)
        })
      }
    },
    drawChart: function(canvas, data) {
      if (!data || !canvas || !data.length) return
      let labels = data.map(el => el.x)
      let d = data.map(el => el.y)
      let ctx = canvas.getContext('2d')

      if (this.myChart) this.myChart.destroy()
      this.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: this.title_choices[this.ylabel],
            data: d,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{
              ticks: {
                callback: this.shortenLabel
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
                var idx = tooltipItems[0].index
                return data.labels[idx]
              },
              label: (tooltipItems, data) => {
                if (this.ylabel != 'ca') return tooltipItems.yLabel;
                let s = niceMoneyNumber(tooltipItems.yLabel) + (this.suffixes[this.ylabel] || '')
                if (this.suffixes[this.ylabel]) s += '  ' + niceMoneyNumber(parseInt(tooltipItems.yLabel / 4)) + ' €'
                return s
              }
            }
          },
        }
      });
    },
    shortenLabel(lab) {
      if (lab == 'COMMUNAUTE DU CHEMIN NEUF') return 'CCN';
      else return lab.replace(/(AGENCE|TOURS?|\/)/gi, '').substr(0, 7).trim()
    }
  }
}
</script>
