<template>
<div class="root_main">
  <navbar :loggedin="loggedin"></navbar>
  
  <img class="ange" src="/images/ange.png">

  <div class="main_container">
    <div class="main_opt" onclick="window.location='/reservations';">
      <i class="main_icon fas fa-book"></i>
      <div class="main_label">Réservations</div>
    </div>

    <div class="main_opt" onclick="window.location='/invoices';">
      <i class="main_icon fas fa-file-invoice"></i>
      <div class="main_label">Factures</div>
    </div>

    <div class="main_opt" onclick="window.location='/stats';">
      <i class="main_icon fas fa-chart-line"></i>
      <div class="main_label">Statistiques</div>
    </div>

    <div class="main_opt" onclick="window.location='/liens';">
      <i class="main_icon fas fa-link"></i>
      <div class="main_label">Liens utiles</div>
    </div>
  </div>

  <img class="Marie" src="/images/Marie.png" @click="$refs.toast.show()">
  <snackbar ref="toast"></snackbar>
</div>
</template>

<style scoped>
.main_container {
  display: flex;
  flex-wrap: wrap;
  width: 50vw;
  margin-left: 25vw;
  margin-top: 15vh;
  color: var(--primary-color);
  cursor: pointer;
  z-index:1;
}

.main_label {
  font-variant: small-caps;
  font-size: 1.3rem;
}

.main_opt {
  width: 20vw;
  height: 20vh;
  text-align: center;
  border-radius: 10px;
  background-color: white;
  box-shadow: var(--shadow-color) 0px 1px 3px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 1rem;
  z-index: 2;
}

.main_icon {
  font-size: 3rem;
  margin-top: 1rem;
}
</style>

<script>
import Navbar from './components/navbar.vue';
import Snackbar from './components/snackbar.vue';

export default {
  name: 'Main',
  data: function() {
    return {
      loggedin: false,
      welcomeMsg: ""
    }
  },
  mounted: function() {
    if (this.welcomeMsg != '') this.$refs.toast.show(`Bienvenue à toi ${this.welcomeMsg} ! Grazie Signore !`);
  },
  components: {
    "navbar": Navbar,
    "snackbar": Snackbar
  }
}
</script>
