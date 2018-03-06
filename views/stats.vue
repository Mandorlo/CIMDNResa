<template>
<div class="root_stats">
  <h3>Statistiques IREC</h3>
  <div>
    <flexBarChart :donnees="chart1" xlabel="x" ylabel="y" title="Chiffre d'affaire"></flexBarChart>
  </div>
</div>
</template>

<style>

</style>

<script>
import flexBarChart from './flexBarChart.vue';

export default {
  name: "stats",
  data() {
    return {
      chart1: []
    }
  },
  components: {
    'flexbarchart': flexBarChart
  },
  methods: {

  },
  mounted: function() {
    // getJSON('/stats/query/flex/year/pax').then(mystats => {
    //   console.log(mystats)
    //   mystats = mystats.sort((a,b) => {
    //     if (a.y < b.y) return 1; else return -1
    //   })
    //   console.log(mystats)
    //   mystats = mystats.slice(0, 10)
    //   this.chart1 = mystats
    //   console.log("Got stats freq_per_agency ! Grazie Signore !", mystats)
    // }).catch(e => {
    //   console.log("Unable to get basic stats :(", e)
    // })
  }
}
</script>
