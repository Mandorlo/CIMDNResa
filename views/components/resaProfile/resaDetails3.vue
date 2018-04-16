<template>
<h3>Lodato sia il Signore Dio, {{msg}}</h3>
</template>

<style>
</style>

<script>

export default {
  name: 'resaDetails3',
  props: {
    dossier: {
      default: {},
      type: Object
    }
  },
  data: function() {
    return {
      msg: "fact"
    }
  }
}
</script>
