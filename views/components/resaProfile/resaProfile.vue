<style scoped>
.header {
  background-color: #6e9cda;
  background-image: url('https://media.istockphoto.com/photos/blue-background-picture-id470764344?k=6&m=470764344&s=612x612&w=0&h=Lz228xz6DylJLM1l7kS19Y-e9uXgIo3pJs_HspksxNM=');
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-size: cover;
  box-shadow: 0 2px 10px #083f75;
}

.date {
  margin-top: -35px;
  width: 100%;
  text-align: left;
  position: relative;
  top: -20px;
  font-size: 0.8em;
  margin-left: 1em;
  line-height: 1.2em;
  color: white;
}

.num_dossier {
  padding: 0 5px 0 5px;
  border-radius: 6px;
  height: 15px;
  line-height: 15px;
  font-size: 11px;
  border: 1px solid white;
  color: white;
  position: relative;
  top: 4px;
  left: 40px;
}

.avatar {
  border: 1px solid #85c1ee;
  box-shadow: 0px 3px 17px #7575a5;
  text-align: center;
  border-radius: 100%;
  height: 70px;
  width: 70px;
  line-height: 70px;
  font-size: 30px;
  color: #00347f;
  background-color: #ffffffb3;
}

.label {
  font-variant: small-caps;
  color: white;
  margin-top: 0.4em;
  font-size: 1.5em;
}

.agency_label {
  font-variant: small-caps;
  color: #04366e;
}

.tabs_container {
  display: flex;
  flex-direction: row;
  margin-top: -2em;
}

.tab {
  cursor: pointer;
  background-color: none;
  color: white;
  flex-grow: 1;
  text-align: center;
  height: 2em;
  line-height: 2em;
}

.tab:hover {
  background-color: #ffffff66;
}

.tab.active {
  background-color: white;
  color: blue;
  box-shadow: 0 2px 5px white;
}

.content {
  width: 100%;
  background-color: none;
}

.hidden_detail {
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease-in;
}

.header:hover .hidden_detail {
  visibility: visible;
  opacity: 1;
  transition: all 0.1s ease-out;
}
</style>

<template>
<div class="root_rp">
  <div class="header">
    <div class="date hidden_detail">
      <div class="date_long">{{moment(dossier.date, 'YYYYMMDD').format('dddd D MMMM YYYY')}}</div>
      <div class="date_human">({{moment(dossier.date, 'YYYYMMDD').fromNow()}})</div>
    </div>
    <div class="num_dossier hidden_detail">ID:{{abbr_id}}</div>
    <div class="avatar"><i class="fa fa-star"></i></div>
    <div class="label">{{dossier.label}}</div>
    <div class="agency_label">{{dossier.agency.name}}</div>
  </div>
  <div class="tabs_container">
    <div v-for="t of content_types" class="tab" v-bind:class="{active: content_type == t.id}" @click="content_type=t.id">{{t.label}}</div>
  </div>
  <div class="content">
    <resadetails1 v-if="content_type == 'RESA'" :dossier="dossier"></resadetails1>
    <resadetails2 v-if="content_type == 'FACT'" :dossier="dossier"></resadetails2>
    <resadetails3 v-if="content_type == 'INFO'" :dossier="dossier"></resadetails3>
  </div>
</div>
</template>

<script>
import resaDetails1 from './components/resaProfile/resaDetails1.vue';
import resaDetails2 from './components/resaProfile/resaDetails2.vue';
import resaDetails3 from './components/resaProfile/resaDetails3.vue';

export default {
  name: 'resaProfile',
  props: {
    'dossier': {
      default: {},
      type: Object
    }
  },
  components: {
    "resadetails1": resaDetails1,
    "resadetails2": resaDetails2,
    "resadetails3": resaDetails3
  },
  data: function() {
    return {
      show_details: false,
      content_type: 'FACT',
      content_types: [{
        id: 'RESA',
        label: 'Réservation'
      }, {
        id: 'FACT',
        label: 'Facturation'
      }, {
        id: 'INFO',
        label: 'Infos'
      }]
    }
  },
  computed: {
    abbr_id: function() {
      return this.dossier.id.substr(3, 4)
    }
  },
  methods: {
    showDetails: function() {
      this.show_details = true
    }
  }
}
</script>
