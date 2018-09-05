<template>
<div ref="myModal" class="modal" v-bind:class="{ouvert: b_ouvert, ferme: !b_ouvert}">

    <!-- Modal content -->
    <div class="modal-content">
        <span class="close" @click="hide()">&times;</span>
        <slot></slot>
    </div>
</div>
</template>

<script>
export default {
  name: "modal",
  data() {
    return {
        b_ouvert: false
    }
  },
  methods: {
      show: function() {
          this.b_ouvert = true
          this.$emit('opened')
      },
      hide: function() {
          this.b_ouvert = false
          this.$emit('closed')
      },
      toggle: function() {
          this.b_ouvert = !this.b_ouvert
          if (this.b_ouvert) this.$emit('opened');
          else this.$emit('closed');
      }
  }
}
</script>

<style scoped>
/* The Modal (background) */
.ouvert {
    display: block;
}
.ferme {
    display: none;
}

.modal {
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 13vh auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80vw; /* Could be more or less, depending on screen size */
    max-width: 800px;
}

/* The Close Button */
.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}
</style>