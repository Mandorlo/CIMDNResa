<template>
<dialog class="mdl-dialog big_modal">
  <div class="mdl-dialog__title">
    Facture dossier {{dossier.id}}
  </div>
  <div class="mdl-dialog__content">
    <h3>{{dossier.label}}</h3>
    <ul>
      <li>PAX : {{dossier.pax}}</li>
      <li>DATE : {{prettyDate(dossier.date)}}</li>
      <li v-if="dossier.agency">AGENCY : {{dossier.agency.name}}</li>
      <li v-if="dossier.agency">AGENCY ADDRESS : {{dossier.agency.street}} {{dossier.agency.postalcode}} {{dossier.agency.city}}</li>
    </ul>

    <form action="#">
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="voucher_num" name="voucher_num" v-model="voucher_num">
        <label class="mdl-textfield__label" for="voucher_num">Voucher N°</label>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="dossier_pax" pattern="[0-9]*(\.[0-9]+)?" name="dossier_pax" v-model="dossier.pax" @change="paxModified()">
        <label class="mdl-textfield__label" for="dossier_pax">PAX</label>
        <span class="mdl-textfield__error">Input is not a number!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="annee_emission" pattern="[0-9]*(\.[0-9]+)?" name="annee_emission" v-model="annee_emission">
        <label class="mdl-textfield__label" for="annee_emission">Année d'émission</label>
        <span class="mdl-textfield__error">Input is not a valid year!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="date_emission" pattern="[0-9]*(\.[0-9]+)?" name="date_emission" v-model="date_emission">
        <label class="mdl-textfield__label" for="date_emission">Date d'émission au format YYYYMMDD</label>
        <span class="mdl-textfield__error">Input is not a valid YYYYMMDD date!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield getmdl-select">
        <select v-model="bank_account">
          <option value="mercantile">Mercantile</option>
          <option value="paxbank">Pax-Bank</option>
        </select>
      </div>
    </form>

    <div>
      <a v-if="pdf_paths.fact != ''" target="_blank" :href="pdf_paths.fact">Télécharger la facture</a>
      <a v-if="pdf_paths.refact != ''" target="_blank" :href="pdf_paths.refact">Télécharger la refacturation</a>
    </div>
  </div>
  <div class="mdl-dialog__actions">
    <i v-if="loading" class="fa fa-spinner fa-pulse"></i>
    <button v-if="!loading" type="button" class="mdl-button" v-on:click="genFacture()">Gen Facture</button>
    <button type="button" class="mdl-button" v-on:click="close()">Close</button>
  </div>
</dialog>
</template>

<style>
.big_modal {
  width: 90%;
  margin-left: 5%;
}
</style>

<script>
export default {
  name: "ModaInvoice",
  props: ['dossier'],
  data() {
    return {
      dossier: this.dossier,
      voucher_num: "",
      pdf_paths: {
        fact: '',
        refact: ''
      },
      loading: false,
      pax_modified: false,
      annee_emission: "2018", // TODO
      date_emission: "",
      bank_account: 'mercantile'
    }
  },
  methods: {
    close: function() {
      this.$emit('close')
    },
    paxModified() {
      console.log("pax modified !")
      this.pax_modified = true;
    },
    prettyDate(s) {
      return s //moment(s, 'YYYYMMDD').format('DDDD D MMMM YYYY')
    },
    genFacture() {
      console.log("voucher_num", this.voucher_num);
      this.loading = true;
      var url = '/invoices/gen/' + this.dossier.id + "?annee=" + this.annee_emission;
      var args = "&";
      if (this.voucher_num) {
        url = url + args + "voucher_num=" + this.voucher_num;
        args = "&"
      }
      if (this.date_emission) {
        console.log('date émission facture has been modified for dossier ' + this.dossier.id, this.date_emission);
        url = url + args + "date_emission=" + this.date_emission;
        args = "&"
      }
      if (this.pax_modified) {
        console.log('pax has been modified for dossier ' + this.dossier.id, this.dossier.pax);
        url = url + args + "pax=" + this.dossier.pax;
      }
      if (this.bank_account) {
        console.log('bank_account has been modified for dossier ' + this.dossier.id, this.dossier.bank_account);
        url = url + args + "bank_account=" + this.bank_account;
      }
      console.log("calling URL ", url);

      getJSON(url).then(o => { // use fetch instead of getJSON
        console.log(o);
        if (o.error) {
          console.log(o);
          this.loading = false;
        } else {
          this.pdf_paths.fact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.fact)[1];
          if (o.refact) this.pdf_paths.refact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.refact)[1];
          this.loading = false;
        }
      }).catch(e => {
        console.log(e);
        this.loading = false;
      })
    }
  }
}
</script>
