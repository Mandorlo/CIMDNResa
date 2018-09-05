<template>
<div class="root_invoices">
  <navbar :title="title_fact" :loggedin="true"></navbar>


  <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp invoice_table">
    <thead>
      <tr>
        <th class="mdl-data-table__cell--non-numeric"></th>
        <th class="mdl-data-table__cell--non-numeric">
          <span v-if="fact_tbd">{{fact_tbd.length}} </span>Facture<span v-if="fact_tbd && fact_tbd.length > 1">s</span> à émettre <span v-if="!fact_tbd">&nbsp;<i class="fa fa-spinner fa-pulse"></i></span>
        </th>
        <!-- <th class="mdl-data-table__cell--non-numeric">Actions</th> -->
      </tr>
    </thead>
    <tbody>
      <reservation v-for="resa in fact_tbd" :key="resa.id" :data="resa" v-on:show-modal-invoice="showModalInvoice($event)"> <!-- v-bind:class="{active_resa: show_details && curr_dossier.id == resa.id}" -->
      </reservation>
    </tbody>
  </table>

  <!-- <div class="inv_details_container">
    <transition name="slide-fade">
      <resaprofile v-if="show_details" class="inv_details" :dossier="curr_dossier"></resaprofile>
      <invoiceprofile v-if="show_details" class="inv_details" :dossier="curr_dossier"></invoiceprofile>
    </transition>
  </div> -->

  <modal ref="modalFact">
    <p>coco</p>
  </modal>

  <snackbar ref="toast"></snackbar>
</div>
</template>

<style>
.close_details {
  position: absolute;
  z-index: 100;
  top: 0px;
  right: 0px;
}

h3 {
  margin-left: 5%;
}

.inv_details_container {
  position: fixed;
  right: 0;
  top: 10vh;
  padding-left: 1em;
}

.inv_details {
  width: 40vw;
  min-width: 400px;
  max-width: 600px;
  height: 90vh;
  background-color: #eff2fc;
  box-shadow: -2px 0px 8px 0px #bfbfbf;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */

  {
  transform: translateX(100%);
  /* opacity: 0; */
}

.active_resa {
  background-color: #dce4eb;
}

.invoice_table {
  margin-top: 15vh;
}

@media screen and (min-width: 600px) {
  .invoice_table {
    width: 90%;
    margin-left: 5%;
    max-width: 700px;
  }
}
@media screen and (max-width: 600px) {
  .invoice_table {
    width: 100%;
    margin-left: 0;
  }
}
</style>

<script>
import Reservation from './components/Reservation.vue';
import resaProfile from './components/resaProfile/resaProfile.vue';
import InvoiceProfile from './components/invoiceProfile.vue';
import Navbar from './components/navbar.vue';
import Snackbar from './components/snackbar.vue';
import Modal from './components/modal.vue';

export default {
  name: "invoices",
  data() {
    return {
      fact_tbd: null,
      curr_dossier: {},
      invoice_paths: {},
      show_details: false,
      welcomeMsg: ''
    }
  },
  components: {
    "reservation": Reservation,
    'resaprofile': resaProfile,
    'invoiceprofile': InvoiceProfile,
    'navbar': Navbar,
    'snackbar': Snackbar,
    'modal': Modal
  },
  computed: {
    title_fact: function() {
      if (!this.fact_tbd) return 'Factures';
      return (this.fact_tbd.length > 1) ? `${this.fact_tbd.length} factures à émettre`: '1 facture à émettre'
    }
  },
  methods: {
    showModalInvoice(dossier) {
      if (dossier.id == this.curr_dossier.id && this.show_details) {
        this.curr_dossier = {}
        this.show_details = false;
        this.$refs.modalFact.hide()
      } else {
        this.curr_dossier = dossier;
        console.log(dossier)
        this.show_details = true;
        this.$refs.modalFact.show()
      }
    },
    closeModalInvoice() {
      this.$refs.invoicemodal.$el.close();
    }
  },
  mounted: function() {
    // on affiche éventuellement un message de bienvenue
    if (this.welcomeMsg != '') this.$refs.toast.show(`Bienvenue à toi ${this.welcomeMsg} ! Grazie Signore !`);

    getJSON('/invoices/tbd').then(invoices => {
      this.fact_tbd = invoices.sort((r1, r2) => { // on trie par date
        if (r1.date < r2.date) return 1;
        else return -1
      });
      console.log("Got invoices " + this.fact_tbd.length + " to be emitted ! Grazie Signore !")
    }).catch(e => {
      console.log("Unable to get invoices TBD :(", e)
    })
  }
}
</script>
