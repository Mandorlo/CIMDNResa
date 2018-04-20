<!-- This component corresponds to one single line of the table in the invoices page -->
<template>
<tr class="root_invoice_el" v-on:click="showInvoiceGenModal()">
  <td class="mdl-data-table__cell--non-numeric"><i class="fa fa-users mdl-list__item-avatar resa_icon"></i></td>
  <td class="mdl-data-table__cell--non-numeric">
    <b>{{data.id}} - {{prettyDate(data.date)}}</b><br>
    {{data.label}}
  </td>
  <!-- <td class="mdl-data-table__cell--non-numeric">
    <i class="fa fa-file-text-o icon-action" aria-hidden="true"></i>
  </td> -->
</tr>
</template>

<style scoped>
.root_invoice_el {
  cursor: pointer;
}

.resa_icon {
  text-align: center;
  line-height: 3em;
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
