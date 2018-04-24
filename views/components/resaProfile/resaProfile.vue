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
  border: none;
  background-color: #ffffff00;
  outline: none;
  width: 80%;
  text-align: center;
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
  position: absolute;
  overflow-y: scroll;
  min-height: 100px;
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

.btn_change_label {
  font-size: 1em;
  position: absolute;
  top: 160px;
  right: 10px;
  background-color: white;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
}

.toast {
  position: absolute;
  bottom: -80px;
  opacity: 0;
  height: 80px;
  width: 85%;
  margin-left: 5%;
  margin-right: 5%;
  background-color: #333;
  color: white;
  font-size: 0.9em;
  line-height: 1.2em;
  padding: 1em;
  transition: all 0.2s ease-in;
}

.toast_active {
  opacity: 1;
  transform: translate(0px, -80px);
  transition: transform 0.3s ease-out;
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
    <input class="label" name="new_label" v-model="label.new">
    <div class="btn_change_label" @click="changeLabel" v-on:keyup.enter="changeLabel" v-show="label.new != label.original">
      <i v-if="!label.loading" class="fa fa-arrow-right"></i>
      <i v-if="label.loading" class="fa fa-spinner fa-pulse"></i>
    </div>
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

  <div class="toast" v-bind:class="{toast_active: toast.show}">
    {{toast.msg}}
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
      default: () => {},
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
      toast: {
        show: false,
        msg: ''
      },
      label: {
        original: '',
        new: '',
        loading: false
      },
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
  mounted: function() {
    this.label.new = this.dossier.label
    this.label.original = this.dossier.label
  },
  watch: {
    dossier: function() {
      this.label.new = this.dossier.label
      this.label.original = this.dossier.label
    }
  },
  methods: {
    showToast(msg, temps = 4000) {
      if (!msg) return;
      this.toast.msg = msg;
      this.toast.show = true;
      setTimeout(_ => this.toast.show = false, temps)
    },
    showDetails: function() {
      this.show_details = true
    },
    changeLabel: function() {
      this.label.loading = true;
      let fields = {
        label: this.label.new
      }
      remoteCall('updateResa', [this.dossier.id, fields]).then(r => {
        console.log(r)
        this.label.original = this.label.new
        this.showToast('Le nom de groupe a été changé, merci Seigneur pour ta bonté !')
        this.label.loading = false;
      }).catch(e => {
        console.log('ERROR update label', e)
        this.showToast('Il y a une erreur lors de la mise à jour du nom du groupe :( Seigneur prends pitié de nous')
        this.label.loading = false;
      })
    }
  }
}
</script>
