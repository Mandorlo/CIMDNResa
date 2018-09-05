<template>
<div class="root_stepscontainer">

    <div class="sc_2cols">
        <div class="sc_numbers">
            <div v-for="s in steps_list" :key="s"
                    class="sc_number" 
                    :class="{sc_number_active: value == s}"
                    @click="$emit('input', s)">
                {{s}}
            </div>
        </div>
        <div class="sc_steps">
            <div class="sc_step" v-if="value == 1">
                <slot name="step1"></slot>
            </div>
            <div class="sc_step" v-if="value == 2">
                <slot name="step2"></slot>
            </div>
            <div class="sc_step" v-if="value == 3">
                <slot name="step3"></slot>
            </div>
        </div>
    </div>
</div>
</template>

<style>
.sc_2cols {
    display: flex;
}
.sc_numbers {
    display: flex;
    flex-direction: column;
    width: 40px;
    margin-right: 2rem;
}
.sc_number {
    background-color: var(--gray-light-color);
    margin-bottom: 1rem;
    padding: 0.3rem;
    color: gray;
    cursor: pointer;
}
.sc_number_active {
    background-color: var(--primary-color);
    color: white;
}
.sc_steps {
    flex-grow: 3
}
</style>

<script>
export default {
  name: "stepscontainer",
  props: {
      value: {
          type: Number,
          default: 1
      }
  },
  data() {
    return {
        steps_list: [1, 2, 3]
    }
  }
}
</script>