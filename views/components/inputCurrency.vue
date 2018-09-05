<template>
<div class="root_icurr">
    <input class="currency" type="number" min="0" max="1000000" v-model="value">
    <select class="currency" v-model="currency">
        <option v-for="curr in currencies" 
                :key="curr" 
                class="currency" 
                :value="curr">
            {{curr}}
        </option>
    </select>
</div>
</template>

<style scoped>
input.currency {
    width: 140px;
}
select.currency {
    color: #fff;
    border-radius: 0;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid var(--primary-color);
    height: 28px;
    width: 36px;
    margin-left: -6px;
    cursor: pointer;
    background-color: var(--primary-color);
}

option.currency {
  background-color: #7f7f7f;
  color: white;
}
</style>

<script>
export default {
  name: "inputcurrency",
  props: {
      currencies: {
          type: Array,
          default: ['', '€', '$']
      },
      currency: {
          type: String,
          default: ''
      },
      value: {
          type: Number,
          default: 0
      }
  },
  data() {
    return {
    }
  },
  watch: {
      value: function(newVal, oldVal) {
          this.$emit('input', newVal)
      },
      currency: function(newVal, oldVal) {
          this.$emit('currency', newVal)
      }
  }
}
</script>