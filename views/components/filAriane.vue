<style scoped>
.root_filariane {
  width: 100%;
  display: flex;
  text-align: center;
}

.noeud {
  color: white;
  background-color: gray;
  border-radius: 100%;
  height: 15px;
  width: 15px;
  text-align: center;
  line-height: 15px;
  cursor: pointer;
}

.fil {
  height: 4px;
  background-color: gray;
  position: relative;
  top: 6px;
}

.chosen {
  background-color: #076799;
}

.nothing {
  display: flex;
}
</style>

<template>
<div class="root_filariane" ref="myRoot">
  <div class="nothing" v-for="el of fil_head">
    <div class="noeud" v-bind:class="{chosen: ind(el.id) <= ind(value)}" @click="changeEtape(el.id)">{{el.id}}</div>
    <div class="fil" v-bind:class="{chosen: ind(el.id) < ind(value)}" v-bind:style="{width: fil_width + 'px'}"></div>
  </div>
  <div class="noeud" v-bind:class="{chosen: fil_tail.id == value}" @click="changeEtape(fil_tail.id)">{{fil_tail.id}}</div>
</div>
</template>

<script>
export default {
  name: 'filAriane',
  props: {
    'fil': {
      type: Array,
      default: () => []
    },
    'value': {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      total_width: 100
    }
  },
  mounted: function() {
    this.total_width = this.$refs.myRoot.clientWidth
  },
  computed: {
    fil_head: function() {
      if (this.fil && this.fil.length) return this.fil.slice(0, -1)
      else return []
    },
    fil_tail: function() {
      if (this.fil && this.fil.length) return this.fil[this.fil.length-1]
      else return {id:''}
    },
    fil_width: function() {
      return Math.round((this.total_width - 15 * this.fil.length) / (this.fil.length-1));
    }
  },
  methods: {
    changeEtape: function(id) {
      this.value = id;
      this.$emit('input', id);
    },
    ind: function(id) {
      if (typeof id != 'string') id = id.id;
      for (let i = 0; i < this.fil.length; i++) {
        if (this.fil[i].id == id) {
          return i
        }
      }
      return -1
    }
  }
}
</script>
