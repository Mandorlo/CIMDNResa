<template>
<div class="pb2_root">
  <div class="pb2_title">{{title}}</div>
  <div id="pb2_container">
    <div class="tooltip">
      <div v-if="value < max && value_prevision < max" class="pb2_inside pb2_prevision" v-bind:style="{ width: prevision_percent+'%' }">{{prevision_percent|number}}%</div>
      <div v-if="value < max && value_prevision >= max" class="pb2_inside pb2_prevision_good">{{prevision_percent|number}}%</div>

      <div v-if="value <= max" class="pb2_inside" v-bind:style="{ width: percent+'%' }">
        {{percent|number}}%
      </div>
      <div v-if="value > max" class="pb2_inside pb2_good">{{percent|number}}%</div>

      <div class="tooltiptext">
        {{value|number}} {{unit}} / {{max|number}} {{unit}} ({{percent|number}}%)<br> prevision : {{value_prevision|number}} {{unit}} ({{prevision_percent|number}}%)
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.tooltip .tooltiptext {
  font-size: 0.9em;
  visibility: hidden;
  opacity: 0;
  width: 200px;
  bottom: 80px;
  left: 50%;
  margin-left: -100px;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.tooltip .tooltiptext::after {
  content: " ";
  position: absolute;
  top: 100%;
  /* At the bottom of the tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: black transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 100;
  transition: opacity 0.3s;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity .3s;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
}

.pb2_title {
  margin-left: 0.5em;
  font-style: italic;
  color: gray;
}

#pb2_container {
  background-color: #efefef;
  border-radius: 10px;
  margin-top: 20px;
  height: 1.5em;
}

.pb2_inside {
  width: 0;
  background-color: #6363f9;
  cursor: pointer;
  text-align: center;
  color: white;
  border-radius: 10px;
  margin-top: -1.5em;
  transition: all 0.4s ease-out;
  height: 1.5em;
}

.pb2_prevision {
  background-color: #6363f94f;
  transition: all 0.4s ease-out;
  padding-right: 0.5em;
  text-align: right;
}

.pb2_prevision_good {
  background-color: #22ff2245;
  width: 100%;
  padding-right: 0.5em;
  text-align: right;
  transition: all 0.4s ease-out;
}

.pb2_good {
  background-color: #75da75;
  width: 100%;
  transition: all 0.4s ease-out;
}
</style>

<script>
export default {
  name: 'progressBar2',
  props: {
    title: {
      default: '',
      type: String
    },
    value: {
      default: 0,
      type: Number
    },
    max: {
      default: 100,
      type: Number
    },
    value_prevision: {
      default: 0,
      type: Number
    },
    unit: {
      default: '',
      type: String
    }
  },
  // props: ['title', 'value', 'max', 'value_prevision', 'unit'],
  data: function() {
    return {

    }
  },
  computed: {
    percent: function() {
      return this.value * 100 / this.max
    },
    prevision_percent: function() {
      return this.value_prevision * 100 / this.max
    }
  },
  filters: {
    number: function(value) {
      let s = Math.round(value, 0).toString();
      if (s.length > 3) s = s.substr(0, s.length - 3) + ' ' + s.substr(s.length - 3)
      return s
    }
  }
}
</script>
