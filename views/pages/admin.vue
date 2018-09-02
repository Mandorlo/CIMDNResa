<template>
<div class="root_admin">
    <navbar title="Administration" :loggedin="true"></navbar>
</div>
</template>

<script>
import Navbar from './components/navbar.vue';

export default {
  name: "error",
  components: {
      'navbar': Navbar
  },
  data() {
    return {
    }
  }
}
</script>