<template>
<div class="root_invoices">
  <h3>Factures à émettre</h3>
  <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp invoice_table">
    <thead>
      <tr>
        <th class="mdl-data-table__cell--non-numeric"></th>
        <th class="mdl-data-table__cell--non-numeric">Description</th>
        <th class="mdl-data-table__cell--non-numeric">Actions</th>
      </tr>
    </thead>
    <tbody>
      <reservation v-for="resa in fact_tbd" :key="resa.id" :data="resa" v-on:show-modal-invoice="showModalInvoice($event)">
      </reservation>
    </tbody>
  </table>
  <!-- <modalinvoice :show.sync="showInvoiceModal" :dossier="curr_dossier" v-on:close="closeModalInvoice()"></modalinvoice> -->
  <modalinvoice ref="invoicemodal" :dossier="curr_dossier" v-on:close="closeModalInvoice()"></modalinvoice>
</div>
</template>

<style>
h3 {
  margin-left: 5%;
}

.invoice_table {
  width: 90%;
  margin-left: 5%;
}
</style>

<script>
import Reservation from './Reservation.vue';
import ModalInvoice from './ModalInvoice.vue';

export default {
  name: "invoices",
  data() {
    return {
      fact_tbd: null,
      curr_dossier: {},
      invoice_paths: {}
    }
  },
  components: {
    "reservation": Reservation,
    'modalinvoice': ModalInvoice
  },
  methods: {
    showModalInvoice(dossier) {
      this.curr_dossier = dossier;
      this.$refs.invoicemodal.$el.showModal();
    },
    closeModalInvoice() {
      this.$refs.invoicemodal.$el.close();
    }
  },
  mounted: function() {
    getJSON('/invoices/tbd').then(invoices => {
      this.fact_tbd = invoices.sort((r1,r2) => { // on trie par date
        if (r1.date < r2.date) return 1; else return -1
      });
      console.log("Got invoices " + this.fact_tbd.length + " to be emitted ! Grazie Signore !")
    }).catch(e => {
      console.log("Unable to get invoices TBD :(", e)
    })
  }
}
</script>
