<template>
<div class="root_lu">
    <navbar title="Liens utiles" :loggedin="loggedin"></navbar>
    
    <div class="lu_sections">
        <div class="section_title" >Section 1</div>
        <div class="section_content">
            sdfsdfsdf
        </div>

        <div class="section_title" >Section 2</div>
        <div class="section_content">
            sdfsdfsdf
        </div>

        <div class="section_title" >Section 3</div>
        <div class="section_content">
            sdfsdfsdf
        </div>
    </div>

</div>
</template>

<style scoped>
.lu_sections {
    margin-top: 15vh;
    margin-left: 20vw;
    width: 60vw;
}
</style>

<script>
import Navbar from './components/navbar.vue';

export default {
  name: "liensutiles",
  components: {
      'navbar': Navbar
  },
  data() {
    return {
        loggedin: false,
        accordion: [false, false, false]
    }
  },
  methods: {
      clickAccordion: function(n) {
          console.log("clicked", n)
          this.accordion[n-1] = !this.accordion[n-1]
          console.log(this.accordion)
      }
  }
}
</script>