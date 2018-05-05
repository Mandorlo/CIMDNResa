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
  font-size: 30px;
  color: #00347f;
  background-color: #ffffffb3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.avatar_pax {
  margin-top: 5px;
}

.avatar_pax_input {
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: center;
  color: #032a5f;
  font-size: 1em;
  margin-left: 13px;
  margin-top: -3px;
  outline: none;
}

.avatar_paxlabel {
  font-size: 0.5em;
  color: #00347f69;
  margin-top: -5px;
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
  min-height: 500px;
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

.btn_change_globalpax {
  font-size: 0.5em;
  position: absolute;
  top: 118px;
  right: 46%;
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
  bottom: -100px;
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

    <div class="avatar" @click="showModalForm">
      <div class="avatar_pax" v-if="!all_pax_identical">{{dossier.pax}}</div>
      <input class="avatar_pax_input" v-if="all_pax_identical" type="number" v-model="pax_global.new">
      <div class="btn_change_globalpax" @click="changeGlobalPax" v-show="pax_global.new != pax_global.original">
        <i v-if="!pax_global.loading" class="fa fa-arrow-right"></i>
        <i v-if="pax_global.loading" class="fa fa-spinner fa-pulse"></i>
      </div>
      <div class="avatar_paxlabel">&nbsp;<span v-show="pax_global.new == pax_global.original">PAX</span>&nbsp;</div>
    </div>

    <input class="label" name="new_label" v-model="label.new" v-on:keyup.enter="changeLabel">
    <div class="btn_change_label" @click="changeLabel" v-show="label.new != label.original">
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

  <modalform ref="modalform" data="paxform">
    <input type="number" id="pax_global" name="pax_global" v-model="pax_global.new">
  </modalform>
</div>
</template>

<script>
import resaDetails1 from './components/resaProfile/resaDetails1.vue';
import resaDetails2 from './components/resaProfile/resaDetails2.vue';
import resaDetails3 from './components/resaProfile/resaDetails3.vue';
import modalForm from './components/modalForm.vue';

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
    "resadetails3": resaDetails3,
    "modalform": modalForm
  },
  data: function() {
    return {
      toast: {
        show: false,
        msg: ''
      },
      pax_global: {
        original: 0,
        new: 0,
        loading: false
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
    },
    all_pax_identical: function() {
      let b = this.dossier.pax = this.dossier.activities[0].pax
      console.log('all_pax_identical', b, this.dossier.invoice.map(a => a.pax))
      return b && this.dossier.invoice
        .map(a => a.pax)
        .reduce((a, p) => a && (p == this.dossier.pax), true)
    }
  },
  mounted: function() {
    this.reset()
  },
  watch: {
    dossier: function() {
      this.reset()
    }
  },
  methods: {
    reset() {
      this.label.new = this.dossier.label
      this.label.original = this.dossier.label

      this.pax_global.new = this.dossier.pax
      this.pax_global.original = this.dossier.pax
    },
    showModalForm() {
      if (this.all_pax_identical) return
      this.$refs.modalform.show()
    },
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
      let fields = {
        label: this.label.new
      }
      this.updateField(fields, 'label', 'nom du groupe')
    },
    changeGlobalPax: function() {
      let fields = {
        pax: this.pax_global.new,
        pax_fact: this.pax_global.new
      }
      this.updateField(fields, 'pax_global', 'nombre de pax global')
    },
    updateField: function(fields, field_name, field_label) {
      this[field_name].loading = true;
      remoteCall('updateResa', [this.dossier.id, fields]).then(r => {
        console.log(r)
        this[field_name].original = this[field_name].new
        this.showToast(`Le ${field_label} a été changé, merci Seigneur pour ta bonté !`)
        this[field_name].loading = false;
      }).catch(e => {
        console.log(`ERROR update ${field_name}`, e)
        this.showToast(`Il y a une erreur lors de la mise à jour de ${field_label} :( Seigneur prends pitié de nous`)
        this[field_name].loading = false;
      })
    }
  }
}
</script>
