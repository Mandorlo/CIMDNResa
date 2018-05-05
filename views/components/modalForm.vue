<style scoped>
.mf_back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  filter: blur(7px);
}

.mf_modal {
  position: absolute;
  top: 20vh;
  width: 86%;
  margin-left: 4%;
  height: 30vh;
  background-color: white;
  color: #777;
  box-shadow: 0px 2px 2px black;
}
</style>

<template>
<div class="mf_root" v-if="bool_show" @click="hide">
  <div class="mf_back"></div>
  <div class="mf_modal" @click='stophide'>
    <div class="fields_container">
      <slot></slot>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'modalForm',
  data: function() {
    return {
      bool_show: false
    }
  },
  methods: {
    show: function() {
      this.bool_show = true
    },
    hide: function() {
      this.bool_show = false
    },
    stophide: function(e) {
      e.stopPropagation()
    }
  }
}
</script>
