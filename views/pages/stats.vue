<template>
<div class="root_stats">
  <h3 class="title">Statistiques IREC</h3>

  <div class="card">
    <div class="card_title">
      Year status
    </div>
    <div class="card_content">
      <currstatus></currstatus>
    </div>
  </div>

  <div class="card">
    <div class="card_title">
      Agency profiles
    </div>
    <div class="card_content">
      <agencyrank></agencyrank>
      <agencyprofile></agencyprofile>
    </div>
  </div>

  <div class="card">
    <div class="card_title">
      Global charts
    </div>
    <div class="card_content">
      <flexbarchart></flexbarchart>
      <flexbarchart></flexbarchart>
    </div>
  </div>
</div>
</template>

<style>
h3.title {
  margin-left: 10%;
}

.card {
  width: 80%;
  margin-left: 10%;
  margin-bottom: 1.5em;
  box-shadow: 0px 3px 4px #8888885e;
  background-color: white;
}

.card_title {
  font-size: 1.2em;
  font-weight: bold;
  color: #777;
  padding: 10px;
  background-color: #eee;
}

.card_content {
  padding: 10px;
}
</style>

<script>
import flexBarChart from './components/flexBarChart.vue'
import currStatus from './components/currStatus.vue'
import agencyProfile from './components/agencyProfile.vue'
import agencyRank from './components/agencyRank.vue'

export default {
  name: "stats",
  data() {
    return {

    }
  },
  components: {
    'flexbarchart': flexBarChart,
    'currstatus': currStatus,
    'agencyprofile': agencyProfile,
    'agencyrank': agencyRank
  },
  methods: {

  },
  mounted: function() {

  }
}
</script>
