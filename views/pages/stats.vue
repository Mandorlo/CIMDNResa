<template>
<div class="root_stats">
  <navbar title="Statistiques" :loggedin="true"></navbar>

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
.root_stats {
  padding-top: 15vh;
}

h3.title {
  margin-left: 10%;
}

.card {
  width: 70vw;
  margin-left: 10%;
  margin-bottom: 1.5em;
  box-shadow: 0px 3px 4px var(--shadow-color);
  background-color: white;
  border-radius: 7px 7px;
}

.card_title {
  font-size: 1.2em;
  font-weight: 500;
  color: white;
  padding: 10px;
  background-color: var(--primary-color);
  border-radius: 7px 7px 0 0;
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
import Navbar from './components/navbar.vue'

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
    'agencyrank': agencyRank,
    'navbar': Navbar
  },
  methods: {

  },
  mounted: function() {

  }
}
</script>
