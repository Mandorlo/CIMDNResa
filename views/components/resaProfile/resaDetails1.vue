<template>
<div class="root_rpd1">
  <div class="activity" v-for="a of dossier.activities">
    {{a.date}} {{a.time}} {{a.espace}}-{{a.theme}} {{a.pax}}
  </div>
</div>
</template>

<style>
</style>

<script>

export default {
  name: 'resaDetails1',
  props: {
    dossier: {
      default: {},
      type: Object
    }
  },
  data: function() {
    return {
      msg: "resa"
    }
  }
}
</script>
