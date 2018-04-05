<template>
<div id="pb_container">
  <div v-if="value<=100" id="pb_inside" class="pb_inside" v-bind:style="{ width: value+'%' }">{{value}}% {{title}}</div>
  <div class="mdl-tooltip" for="pb_inside">

  </div>

  <div v-if="value>100" id="pb_inside100" class="pb_inside pb_good">{{value}}% {{title}}</div>
  <div class="mdl-tooltip" for="pb_inside100">
    +{{value-100}}%
  </div>
</div>
</template>

<style scoped>
#pb_container {
  background-color: #efefef;
  border-radius: 10px;
}

.pb_inside {
  background-color: #6363f9;
  cursor: pointer;
  text-align: center;
  color: white;
  border-radius: 10px;
  transition: all 0.4s ease-out;
}

.pb_good {
  background-color: green;
  width: 100%;
}
</style>

<script>
export default {
  name: 'progressBar',
  props: ['value', 'title'],
  data: function() {
    return {
      status: 25
    }
  }
}
</script>
