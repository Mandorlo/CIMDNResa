<template>
<div class="root_navbar">
    <a href="/home"><img class="navbar_logo" alt="CIMDN" src="/images/logo_cimdn.jpg"></a>
    <div class="navbar_title">{{title}}</div>
    <div class="menu" v-if="!hidemenu">
      <select v-model="url" @change="window.location=url;">
        <option value="default">Aller à...</option>
        <option value="/reservations">Réservations</option>
        <option value="/invoices">Factures</option>
        <option value="/stats">Statistiques</option>
      </select>
    </div>
    <div v-if="loggedin" class="signout" @click="window.location='/logout'">
      <i class="fas fa-sign-out-alt"></i>
      Logout
    </div>
</div>
</template>

<style scoped>
.root_navbar {
  z-index: 1000;
  position: fixed;
  width: 100vw;
  top: 0px;
  height: 10vh;
  background-color: white;
  line-height: 10vh;
  display: flex;
  color: var(--primary-color);
  box-shadow: var(--shadow-color) 0px 1px 7px;
}

.menu {
  justify-self: flex-end;
  margin-left: auto;
}

.menu select {
  border: none;
  margin-right: 1rem;
  height: 2rem;
  cursor: pointer;
}

.navbar_title {
  font-size: 1.8rem;
}

.navbar_logo {
  height: 7vh;
  margin-top: -2vh;
  margin-left: 1vw;
  margin-right: 3vw;
  cursor: pointer;
}

.signout {
  margin-right: 2rem;
  color: var(--primary-color);
  cursor: pointer;
}

</style>

<script>
export default {
  name: 'navbar',
  props: {
    "title": {
      type: String,
      default: "Centre International Marie de Nazareth"
    },
    "hidemenu": {
      type: Boolean,
      default: false
    },
    "loggedin": {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      url: 'default'
    }
  }
}
</script>