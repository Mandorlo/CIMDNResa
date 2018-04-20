<!-- This component corresponds to one single line of the table in the invoices page -->
<template>
<tr class="root_invoice_el" v-on:click="showInvoiceGenModal()">
  <td class="mdl-data-table__cell--non-numeric">
    <div class="mdl-list__item-avatar resa_icon">{{data.pax}}</div>
  </td>
  <td class="mdl-data-table__cell--non-numeric">
    <b>{{data.id}} - {{prettyDate(data.date)}}</b><br> {{data.label}}
  </td>
</tr>
</template>

<style scoped>
.root_invoice_el {
  cursor: pointer;
}

.resa_icon {
  text-align: center;
  font-size: 1.5em;
  font-family: Calibri;
  line-height: 2em;
}

.icon-action {
  cursor: pointer;
}
</style>

<script>
export default {
  name: "reservation",
  props: ["data"],
  data: function() {
    return {

    }
  },
  methods: {
    prettyDate(s) {
      return moment(s, "YYYYMMDD").format("dddd D MMM YYYY")
    },
    showInvoiceGenModal() {
      // on va afficher le modal pour générer la facture
      this.$emit('show-modal-invoice', this.data);
    }
  }
}
</script>
