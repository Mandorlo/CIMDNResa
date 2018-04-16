<style scoped>
.root_rf {
  background-color: white;
  box-shadow: 0px 2px 4px #a3a3a3;
  margin-bottom: 0.4em;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  height: 50px;
  line-height: 50px;
}

.icone {
  width: 50px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
  border-right: 1px solid #d6dfed;
  color: #bbcbd6;
}

.modif {
  color: #055c94;
  border-right: 1px solid #055c94;
}

.titre {
  font-variant: small-caps;
  padding: 0;
  margin: 0;
  text-align: center;
  font-size: 0.8em;
  margin-top: -3px;
}
</style>

<template>
<div class="root_rf">
  <div class="icone" v-bind:class="{modif: modified}"><i :class="icon"></i></div>
  <label class="field_label" :for="name">{{title}}</label>
  <input class="mdl-textfield__input" type="text" :id="name" :name="name" v-model="tobesent.voucher_num">
</div>
</template>

<style>
</style>

<script>
export default {
  name: 'rectField',
  props: {
    icon: {
      default: ['fa', 'fa-star'],
      type: Array
    },
    title: {
      default: 'titre',
      type: String
    },
    name: {
      default: 'field',
      type: String
    },
    valeur: {
      default: '',
      type: String
    }
  },
  data: function() {
    return {
      modified: false
    }
  }
}
</script>
