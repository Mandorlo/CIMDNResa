<template>
<div class="root_cr">
    <div class="notChecked" v-if="!checked">
        <div class="square" @click="show()"></div>
        <div class="cr_info">
            <slot name="info"></slot>
        </div>
    </div>

    <div class="checked" v-if="checked">
        <slot name="reveal"></slot>
    </div>
</div>
</template>

<style scoped>
.root_cr {
    margin: 1rem 0;
}
.notChecked {
    display: flex;
}
.square {
    width: 1.2rem;
    height: 1.2rem;
    background-color: var(--gray-light-color);
    border-radius: 5px;
    margin-right: 1rem;
    cursor: pointer;
}
.cr_info {
    color: var(--gray-color);
}
</style>

<script>
export default {
  name: "checkreveal",
  /* props: {
      checked: {
          type: Boolean,
          default: false
      }
  }, */
  data() {
    return {
        checked: false
    }
  },
  methods: {
      show() {
          this.checked = true;
          //this.$emit('checked', true)
      }
  }
}
</script>