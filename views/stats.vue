<template>
<div class="root_stats">
  <h3 class="title">Statistiques IREC</h3>

  <div class="card">
    <div class="card_title">
      Year status
    </div>
    <div class="card_content">
      How are we performing compared to previous years
    </div>
  </div>

  <div class="card">
    <div class="card_title">
      Agency profiles
    </div>
    <div class="card_content">
      todo. How is it ranked among agencies, chart of frequentation per month (to see if it somes all the year or just in certain seasons)

    </div>
  </div>

  <div class="card">
    <div class="card_title">
      Global charts
    </div>
    <div class="card_content">
      <flexBarChart></flexBarChart>
      <flexBarChart></flexBarChart>
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
import flexBarChart from './flexBarChart.vue';

export default {
  name: "stats",
  data() {
    return {

    }
  },
  components: {
    'flexbarchart': flexBarChart
  },
  methods: {

  },
  mounted: function() {

  }
}
</script>
