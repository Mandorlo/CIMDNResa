<template>
<div class="root_login">
    <navbar :title="formType" :hidemenu="true"></navbar>

    <!-- LOGIN OR SIGNUP FORM -->
    <form class="login" :action="formAction" method="post">
        <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" class="form-control" name="email">
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" class="form-control" name="password">
        </div>

        <button type="submit" class="btn_primary">{{formType}}</button>
    </form>

    <hr>

    <p v-if="formType.toLowerCase() != 'signup' && enableSignup">Need an account? <a href="/signup">Signup</a></p>
    <p>Or go <a href="/home">home</a>.</p>

</div>
</template>

<style scoped>
.login {
    width: 30vw;
    margin-left: 35vw;
    margin-top: 20vh;
    margin-bottom: 10vh;

}
.form-group {
    display: flex;
    flex-direction: column;
    line-height: 2rem;
}
</style>


<script>
import Navbar from './components/navbar.vue';

export default {
  name: "login",
  components: {
      'navbar': Navbar
  },
  data() {
    return {
        formType: "Login",
        enableSignup: true
    }
  },
  computed: {
      formAction: function() {
          return '/' + this.formType.toLowerCase()
      }
  }
}
</script>