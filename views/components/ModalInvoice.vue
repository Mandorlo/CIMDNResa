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
      <li>TOTAL : {{total_price}} &#8362;</li>
    </ul>

    <form action="#">
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="voucher_num" name="voucher_num" v-model="tobesent.voucher_num">
        <label class="mdl-textfield__label" for="voucher_num">Voucher N°</label>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="number" id="dossier_pax" name="dossier_pax" v-model="dossier.pax" @change="paxModified()">
        <label class="mdl-textfield__label" for="dossier_pax">PAX</label>
        <span class="mdl-textfield__error">Input is not a number!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="number" step="0.01" id="amount_currency" name="amount_currency" v-model="tobesent.amount_currency">
        <label class="mdl-textfield__label" for="amount_currency">Montant en devise</label>
        <span class="mdl-textfield__error">Input is not a number!</span>
      </div>
      <select class="currency" v-model="tobesent.other_currency">
        <option value=""></option>
        <option value="€">€</option>
        <option value="$">$</option>
      </select>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="annee_emission" pattern="[0-9]{4}" name="annee_emission" v-model="tobesent.annee_emission">
        <label class="mdl-textfield__label" for="annee_emission">Année d'émission</label>
        <span class="mdl-textfield__error">Input is not a valid year!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="date_emission" pattern="[0-9]{8}" name="date_emission" v-model="tobesent.date_emission">
        <label class="mdl-textfield__label" for="date_emission">Date d'émission au format YYYYMMDD</label>
        <span class="mdl-textfield__error">Input is not a valid YYYYMMDD date!</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="fact_num" pattern="F\s[0-9]+" name="fact_num" v-model="tobesent.fact_num">
        <label class="mdl-textfield__label" for="fact_num">Forcer le numéro de facture</label>
        <span class="mdl-textfield__error">Input is not a valid invoice num (e.g. "F 18052")</span>
      </div>

      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="refact_num" pattern="F\s[0-9]+" name="refact_num" v-model="tobesent.refact_num">
        <label class="mdl-textfield__label" for="refact_num">Forcer le numéro de refacturation</label>
        <span class="mdl-textfield__error">Input is not a valid invoice num (e.g. "F 18052")</span>
      </div>

      <div class="container_field">
        <select v-model="tobesent.bank_account">
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
  <div id="myToast" ref="myToast" class="mdl-js-snackbar mdl-snackbar">
    <div class="mdl-snackbar__text"></div>
    <button class="mdl-snackbar__action" type="button"></button>
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
      pdf_paths: {
        fact: '',
        refact: ''
      },
      loading: false,
      pax_modified: false,
      tobesent: {
        voucher_num: "",
        annee_emission: "2018",
        date_emission: "",
        bank_account: 'mercantile',
        fact_num: '',
        refact_num: '',
        pax: null,
        amount_currency: 0.0,
        other_currency: ''
      }
    }
  },
  computed: {
    total_price() {
      let total = 0
      if (this.dossier && this.dossier.invoice && this.dossier.invoice.length) {
        this.dossier.invoice.forEach(i => {
          total += i.price * 100
        })
      }
      return Math.round(total / 100., 2)
    }
  },
  methods: {
    showToast: function(msg) {
      this.$refs.myToast.MaterialSnackbar.showSnackbar({
        message: msg,
        timeout: 4000
      });
    },
    close: function() {
      this.$emit('close')
    },
    paxModified() {
      console.log("pax modified !")
      this.pax_modified = true;
      this.tobesent.pax = this.dossier.pax;
    },
    prettyDate(s) {
      return s //moment(s, 'YYYYMMDD').format('DDDD D MMMM YYYY')
    },
    genFacture() {
      this.loading = true;
      let url = '/invoices/gen/' + this.dossier.id;
      let args = "?";
      Object.getOwnPropertyNames(this.tobesent).forEach(k => {
        if (this.tobesent[k]) {
          url = url + args + k + "=" + this.tobesent[k];
          args = "&"
        }
      })
      url = url.substr(0, url.length - 1)
      console.log("calling URL ", url);

      getJSON(url).then(o => { // use fetch instead of getJSON
        console.log(o);
        if (o.error) {
          console.log(o);
          if (o.details && /not a directory/gi.test(o.details)) this.showToast(`Impossible d'accéder au dossier des factures sur Com-Compta. Vérifie que le chemin d'accès est bon dans la page des paramètres`);
          this.loading = false;
        } else {
          this.pdf_paths.fact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.fact)[1];
          if (o.refact) this.pdf_paths.refact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.refact)[1];
          this.loading = false;
        }
      }).catch(e => {
        console.log(e)
        this.showToast(JSON.stringify(e))
        this.loading = false;
      })
    }
  }
}
</script>
