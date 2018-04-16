<style scoped>
.root_rpd2 {
  padding-top: 2em;
}

.prestas {
  margin: 2em 2em 1em 2em;
}

.presta {
  box-shadow: 0px 2px 4px #a3a3a3;
  margin: 0.2em 2em 0.2em 2em;
  padding: 10px;
}

.field_container {
  background-color: white;
  box-shadow: 0px 2px 4px #a3a3a3;
  margin-bottom: 0.4em;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  height: 50px;
}

.field_c2 {
  display: flex;
  flex-direction: column;
  margin-left: 1em;
}

.field_label {
  color: gray;
  font-variant: small-caps;
  font-size: 0.8em;
}

.field_input {
  border: none;
  border-bottom: 1px solid gray;
  outline: none;
  margin-top: 4px;
  height: 16px;
}

.icone {
  width: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
  border-right: 1px solid #d6dfed;
  color: #bbcbd6;
}

.modif {
  color: #055c94;
  border-right: 1px solid #055c94;
}

select.currency {
  color: white;
  background: linear-gradient(to right, #7f7f7f, #b6b6b6);
  border-bottom-right-radius: 6px;
  border-top-right-radius: 6px;
  border: 1px solid #7f7f7f;
  height: 27px;
  margin-top: 16px;
  cursor: pointer;
}

option.currency {
  background-color: #7f7f7f;
  color: white;
}

.titre {
  font-variant: small-caps;
  padding: 0;
  margin: 0;
  text-align: center;
  font-size: 0.8em;
}

.error_input {
  font-size: 5px;
  color: red;
}

.check_label {
  width: 70%;
  margin-left: 1em;
  font-size: 0.9em;
  line-height: 1.3em;
}

.check_container {
  height: 30px;
  box-shadow: none;
  background: none;
  border-right: none;
  display: flex;
}

.check_container .icone {
  line-height: 35px
}

.gen_fact_btn {
  width: 80%;
  margin-left: 10%;
  margin-bottom: 1em;
  background-color: #0082b96b;
  color: white;
  text-align: center;
}

.gen_fact_btn:hover {
  background-color: #0082b9;
  color: white;
}

.gen_fact_spin {
  width: 80%;
  margin-left: 10%;
  margin-bottom: 1em;
  background-color: #0082b9;
  color: white;
  text-align: center;
  padding: 0.4em;
}

.facture_links {
  display: flex;
  align-items: center;
  justify-content: center;
}

.facture_item {
  text-align: center;
  text-decoration: none;
  padding: 0.5em;
  border-radius: 10px;
  background-color: white;
  width: 60px;
  height: 48px;
  margin-bottom: 1em;
  box-shadow: 0px 2px 0px #05306740;
  margin-right: 1em;
}

.facture_item a {
  color: #043c74;
  text-decoration: none;
  font-variant: small-caps;
  font-size: 0.8em;
}

.facture_item i {
  font-size: 1.7em;
  margin-top: 7px;
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
<div class="root_rpd2">
  <div class="gen_fact_spin" v-if="loading"><i class="fa fa-spinner fa-pulse"></i></div>
  <button v-if="!loading" type="button" class="mdl-button gen_fact_btn" v-on:click="genFacture()">Créer la facture de {{total_price}} &#x20AA;</button>

  <!-- Liens vers les factures générées -->
  <div class="facture_links" v-if="pdf_paths[dossier.id]">
    <div class="facture_item" v-if="pdf_paths[dossier.id].fact">
      <a target="_blank" :href="pdf_paths[dossier.id].fact">
      <i class="fa fa-download"></i><br><span>facture</span>
    </a>
    </div>
    <div class="facture_item" v-if="pdf_paths[dossier.id].refact">
      <a target="_blank" :href="pdf_paths[dossier.id].refact">
      <i class="fa fa-download"></i><br><span>refact.</span>
    </a>
    </div>
  </div>

  <!-- Numéro de voucher -->
  <div class="presta field_container">
    <div class="icone"><i class="fa fa-file-text-o"></i></div>
    <div class="field_c2">
      <label class="field_label" for="voucher_num">Voucher N°</label>
      <input class="field_input" type="text" id="voucher_num" name="voucher_num" v-model="tobesent.voucher_num">
    </div>
  </div>

  <div class="presta check_container" v-if="!check.advanced">
    <div class="icone" @click="check.advanced = true"><i class="fa fa-square"></i></div>
    <div class="check_label" for="voucher_num">Afficher les options avancées</div>
  </div>
  <div class="advanced_container" v-if="check.advanced">
    <!-- Ajouter le montant dans une autre devise -->
    <div class="presta check_container" v-if="!check.symbol_currency">
      <div class="icone" @click="check.symbol_currency = true"><i class="fa fa-square"></i></div>
      <div class="check_label" for="voucher_num">Ajouter le montant dans une devise autre que le NIS</div>
    </div>
    <div class="presta field_container" v-if="check.symbol_currency">
      <div class="icone" @click="resetOption(['symbol_currency', 'amount_currency'])"><i class="fa" :class="{'fa-euro': tobesent.symbol_currency == '€' || tobesent.symbol_currency == ''}"></i></div>
      <div class="field_c2">
        <label class="field_label" for="amount_currency">Montant en {{tobesent.symbol_currency || "(choisir la devise)"}}</label>
        <input class="field_input" type="number" id="amount_currency" name="amount_currency" v-model="tobesent.amount_currency" :disabled="tobesent.symbol_currency == ''">
      </div>
      <div>
        <select class="currency" v-model="tobesent.symbol_currency">
          <option class="currency" value=""></option>
          <option class="currency" value="€">€</option>
          <option class="currency" value="$">$</option>
        </select>
      </div>
    </div>

    <!-- Forcer numéro de facture -->
    <div class="presta check_container" v-if="!check.fact_num">
      <div class="icone" @click="check.fact_num = true"><i class="fa fa-square"></i></div>
      <div class="check_label" for="voucher_num">Forcer le numéro de facture</div>
    </div>
    <div class="presta field_container" v-if="check.fact_num">
      <div class="icone" @click="resetOption('fact_num')"><i class="fa fa-calendar"></i></div>
      <div class="field_c2">
        <label class="field_label" for="fact_num">Forcer le numéro de facture</label>
        <input class="field_input" type="text" id="fact_num" name="fact_num" pattern="F\s[0-9]+" v-model="tobesent.fact_num">
        <div class="error_input" v-if="!/^F [0-9]{5}$/.test(tobesent.fact_num)  && tobesent.fact_num !== ''">Le numéro de facture rentré est invalide, il doit être de la form "F XXXXX", par exemple : "F 18056"</div>
      </div>
    </div>

    <!-- Forcer numéro de re-facture -->
    <div class="presta field_container">
      <div class="icone"><i class="fa fa-calendar"></i></div>
      <div class="field_c2">
        <label class="field_label" for="refact_num">Forcer le numéro de re-facturation interne</label>
        <input class="field_input" type="text" id="fact_num" name="refact_num" pattern="F\s[0-9]+" v-model="tobesent.refact_num">
        <div class="error_input" v-if="!/^F [0-9]{4}$/.test(tobesent.refact_num) && tobesent.refact_num !== ''">Le numéro de facture rentré est invalide, il doit être de la form "F XXXX", par exemple : "F 8015"</div>
      </div>
    </div>
  </div>

  <div class="toast" v-bind:class="{toast_active: toast.show}">
    {{toast.msg}}
  </div>
</template>

<script>
import rectField from './components/rectField.vue';

import moment from 'moment';

export default {
  name: 'resaDetails2',
  props: {
    dossier: {
      default: {},
      type: Object
    }
  },
  components: {
    'rectfield': rectField
  },
  data: function() {
    let tobesent_default = {
      voucher_num: "",
      annee_emission: moment().year().toString(),
      date_emission: "",
      bank_account: 'mercantile',
      fact_num: '',
      refact_num: '',
      pax: null,
      amount_currency: 0.0,
      symbol_currency: ''
    }

    return {
      toast: {
        show: false,
        msg: ''
      },
      check: {
        advanced: false,
        symbol_currency: false,
        fact_num: false,
        refact_num: false
      },
      loading: false,
      pdf_paths: {},
      tobesent_default: tobesent_default,
      tobesent: Object.assign({}, tobesent_default)
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
      if (!msg) return;
      this.toast.msg = msg;
      this.toast.show = true;
      setTimeout(_ => this.toast.show = false, 4000)
    },
    resetOption(opt) {
      if (typeof opt == 'string') opt = [opt];
      opt.forEach(o => {
        if (this.tobesent.hasOwnProperty(o)) this.tobesent[o] = this.tobesent_default[o];
        if (this.check.hasOwnProperty(o)) this.check[o] = false;
      })
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
          this.pdf_paths = {}
          this.pdf_paths[this.dossier.id] = {
            fact: "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.fact)[1],
            refact: ''
          }
          if (o.refact) this.pdf_paths[this.dossier.id].refact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.refact)[1];
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
