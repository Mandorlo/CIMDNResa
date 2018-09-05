<template>
<div class="root_i3">
    <div class="icon_i3">
        <i class="fas" :class="[icon]"></i>
    </div>
    <div class="content_i3">
        <div class="label">{{label}}</div>
        <div class="body_i3">
            <slot></slot>
        </div>
    </div>
</div>
</template>

<style scoped>
.root_i3 {
    display: flex;
    margin-bottom: 1.2rem;
}
.icon_i3 {
    display: flex;
    width: 36px;
}
.icon_i3 > i {
    align-self: center;
    font-size: 1.3rem;
    margin-right: 1rem;
}
.content_i3 > .label {
    font-size: 0.8rem;
    color: var(--gray-color);
    margin: 0;
}
</style>

<script>
export default {
  name: "input3",
  props: {
      label: {
          type: String,
          default: 'Label'
      },
      icon: {
          type: String,
          default: 'fa-home'
      }
  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>