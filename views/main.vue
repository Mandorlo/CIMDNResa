<template>
<div class="root_main">
  <h3>Lodato sia il Signore Dio, {{msg}}</h3>
  <ul>
    <li><a href="/reservations">Réservations</a></li>
    <li><a href="/invoices">Factures</a></li>
    <li><a href="/stats">Statistiques</a></li>
  </ul>
</div>
</template>

<style>
</style>

<script>

export default {
  name: 'Main',
  data: function() {
    return {
      msg: "Re dell'universo"
    }
  }
}
</script>
