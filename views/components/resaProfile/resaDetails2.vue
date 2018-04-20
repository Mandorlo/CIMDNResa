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

.fil_ariane {
  margin-left: 2em;
  margin-right: 2em;
  margin-bottom: 1em;
}

.information {
  margin: 2em;
  font-family: monospace;
  text-align: center;
}

.ou {
  text-align: center;
  margin-top: -0.5em;
  margin-bottom: 0.5em;
}

.cloture_donation {
  text-align: center;
  margin-bottom: 1em;
}

.cloture_donation select {
  width: 40%;
  height: 30px;
}
</style>

<template>
<div class="root_rpd2">
  <div class="fil_ariane">
    <filariane :fil="[{id:'1'}, {id:'2'}, {id:'3'}]" v-model="etape"></filariane>
  </div>

  <!-- ================================================================ -->
  <!--                    ETAPE 3 : CLOTURE DU DOSSIER                  -->
  <!-- ================================================================ -->
  <div class="etape" v-if="etape == '3' && !loading">
    <div class="cloture_donation">
      <select v-model="cloture.type">
        <option value="donation">Donation</option>
        <option value="facture">Facture</option>
      </select>
    </div>

    <!-- Cloture : N° de voucher -->
    <div class="presta field_container" v-if="cloture.type != 'donation'">
      <div class="icone"><i class="fa fa-calendar"></i></div>
      <div class="field_c2">
        <label class="field_label" for="cloture_voucher">N° de voucher</label>
        <input type="text" name="cloture_voucher" v-model="cloture.voucher_num">
      </div>
    </div>

    <!-- Cloture : N° de facture -->
    <div class="presta field_container" v-if="cloture.type != 'donation'">
      <div class="icone"><i class="fa fa-calendar"></i></div>
      <div class="field_c2">
        <label class="field_label" for="cloture_fact">N° de facture</label>
        <input type="text" name="cloture_fact" v-model="cloture.fact_num">
      </div>
    </div>

    <!-- Cloture : N° de re-facturation éventuel -->
    <div class="presta field_container" v-if="cloture.type != 'donation'">
      <div class="icone"><i class="fa fa-calendar"></i></div>
      <div class="field_c2">
        <label class="field_label" for="cloture_refact">N° de refacturation éventuel</label>
        <input type="text" name="cloture_refact" v-model="cloture.refact_num">
      </div>
    </div>

    <!-- <input v-if="cloture.type != 'donation'" type="text" name="cloture_fact" v-model="cloture.fact_num" placeholder="N° de facture"> -->
    <!-- <input v-if="cloture.type != 'donation'" type="text" name="cloture_refact" v-model="cloture.refact_num" placeholder="N° de refacturation éventuel"> -->
    <div class="gen_fact_spin" v-if="loading"><i class="fa fa-spinner fa-pulse"></i></div>
    <button v-if="!loading" type="button" class="mdl-button gen_fact_btn" v-on:click="closeDossier()">Clôturer le dossier {{dossier.id}}</button>
  </div>

  <!-- ================================================================ -->
  <!--                ETAPE 2 : TÉLÉCHARGER LA FACTURE                  -->
  <!-- ================================================================ -->
  <!-- Liens vers les factures générées -->
  <div class="etape" v-if="etape == '2' && pdf_paths[dossier.id] && !loading">
    <div class="information">
      Télécharge <span v-if="pdf_paths[dossier.id] && pdf_paths[dossier.id].refact">les factures</span><span v-else>la facture</span> ci-dessous et enregistre-les sur Com-Compta. Ensuite tu pourras clôturer le dossier.
    </div>

    <div class="facture_links" v-if="pdf_paths[dossier.id] && !loading">
      <div class="facture_item" v-if="pdf_paths[dossier.id].fact">
        <a target="_blank" :href="pdf_paths[dossier.id].fact">
          <i class="fa fa-download"></i><br><span>facture</span>
        </a>
      </div>
      <div class="facture_item" v-if="pdf_paths[dossier.id].refact && !loading">
        <a target="_blank" :href="pdf_paths[dossier.id].refact">
          <i class="fa fa-download"></i><br><span>refact.</span>
        </a>
      </div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!--                    ETAPE 1 : GÉNÉRER LA FACTURE                  -->
  <!-- ================================================================ -->
  <div class="etape" v-if="etape == '1'">
    <div class="gen_fact_spin" v-if="loading"><i class="fa fa-spinner fa-pulse"></i></div>
    <div class="btn_cloture" v-if="!loading">
      <button type="button" class="mdl-button gen_fact_btn" v-on:click="genFacture()">
        Créer la facture de {{total_price}} &#x20AA;
      </button>
      <div class="ou" v-if="tobesent.voucher_num == tobesent_default.voucher_num">OU</div>
      <button type="button" class="mdl-button gen_fact_btn" v-on:click="setDonation()" v-if="tobesent.voucher_num == tobesent_default.voucher_num">
        Pas de facture, donation
      </button>
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
      <div class="check_label">Afficher les options avancées</div>
    </div>
    <div class="advanced_container" v-if="check.advanced">
      <!-- Ajouter le montant dans une autre devise -->
      <div class="presta check_container" v-if="!check.other_currency">
        <div class="icone" @click="check.other_currency = true"><i class="fa fa-square"></i></div>
        <div class="check_label">Ajouter le montant dans une devise autre que le NIS</div>
      </div>
      <div class="presta field_container" v-if="check.other_currency">
        <div class="icone" @click="resetOption(['other_currency', 'amount_currency'])"><i class="fa" :class="{'fa-euro': tobesent.other_currency == '€' || tobesent.other_currency == ''}"></i></div>
        <div class="field_c2">
          <label class="field_label" for="amount_currency">Montant en {{tobesent.other_currency || "(choisir la devise)"}}</label>
          <input class="field_input" type="number" id="amount_currency" name="amount_currency" v-model="tobesent.amount_currency" :disabled="tobesent.other_currency == ''">
        </div>
        <div>
          <select class="currency" v-model="tobesent.other_currency">²
          <option class="currency" value=""></option>
          <option class="currency" value="€">€</option>
          <option class="currency" value="$">$</option>
        </select>
        </div>
      </div>

      <!-- Forcer numéro de facture -->
      <div class="presta check_container" v-if="!check.fact_num">
        <div class="icone" @click="check.fact_num = true"><i class="fa fa-square"></i></div>
        <div class="check_label">Forcer le numéro de facture</div>
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
      <div class="presta check_container" v-if="!check.refact_num">
        <div class="icone" @click="check.refact_num = true"><i class="fa fa-square"></i></div>
        <div class="check_label">Forcer le numéro de re-facturation</div>
      </div>
      <div class="presta field_container" v-if="check.refact_num">
        <div class="icone" @click="resetOption('refact_num')"><i class="fa fa-calendar"></i></div>
        <div class="field_c2">
          <label class="field_label" for="refact_num">Forcer le numéro de re-facturation interne</label>
          <input class="field_input" type="text" id="refact_num" name="refact_num" pattern="F\s[0-9]+" v-model="tobesent.refact_num">
          <div class="error_input" v-if="!/^F [0-9]{4}$/.test(tobesent.refact_num) && tobesent.refact_num !== ''">Le numéro de facture rentré est invalide, il doit être de la form "F XXXX", par exemple : "F 8015"</div>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" v-bind:class="{toast_active: toast.show}">
    {{toast.msg}}
  </div>
</template>

<script>
import filAriane from './components/filAriane.vue';

import moment from 'moment';

export default {
  name: 'resaDetails2',
  props: {
    dossier: {
      default: () => {},
      type: Object
    }
  },
  components: {
    'filariane': filAriane
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
      other_currency: ''
    }

    return {
      etape: '1',
      cloture: {
        type: 'facture',
        fact_num: '',
        refact_num: '',
        voucher_num: ''
      },
      toast: {
        show: false,
        msg: ''
      },
      check: {
        advanced: false,
        other_currency: false,
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
    showToast(msg) {
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
    setDonation() {
      this.cloture.type = 'donation';
      this.cloture['fact_num'] = 'donation';
      this.etape = '3'
    },
    genFacture() {
      this.loading = true;
      let url = '/invoices/gen/' + this.dossier.id;
      let args = "?";
      Object.getOwnPropertyNames(this.tobesent).forEach(k => {
        if (k.substr(0, 2) != '__' && this.tobesent[k] != this.tobesent_default[k]) {
          url = url + args + k + "=" + this.tobesent[k];
          args = "&"
        }
      })
      // if (args == "&") url = url.substr(0, url.length - 1);
      console.log("calling URL ", url);

      getJSON(url).then(o => { // use fetch instead of getJSON
        if (o.error || o.errnum) {
          console.log(o);
          if (o.details && /not a directory/gi.test(o.details)) this.showToast(`Impossible d'accéder au dossier des factures sur Com-Compta. Vérifie que le chemin d'accès est bon dans la page des paramètres`);
          else if (o.details) this.showToast(o.details);
          else this.showToast(JSON.stringify(o))
          this.loading = false;
        } else {
          this.pdf_paths = {}
          this.pdf_paths[this.dossier.id] = {
            fact: "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.fact)[1],
            refact: ''
          }
          if (o.refact) this.pdf_paths[this.dossier.id].refact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.refact)[1];
          this.cloture['fact_num'] = o.fact_num;
          this.cloture['refact_num'] = o.refact_num;
          this.cloture.voucher_num = this.tobesent.voucher_num;
          this.loading = false;
          this.etape = '2'
        }
      }).catch(e => {
        console.log(e)
        this.showToast(JSON.stringify(e))
        this.loading = false;
      })
    },
    closeDossier() {
      let opt = {
        facture: this.cloture.fact_num,
        refac: this.cloture.refact_num
      }
      if (!opt.facture && this.cloture.type == 'donation') opt.facture = 'donation';
      if (!opt.facture) {
        this.showToast("Le mode de clôture n'a pas encore été choisi ! (facture ou donation)")
        return
      }
      if (this.tobesent.voucher_num) opt.voucher = this.tobesent.voucher_num;
      remoteCall('closeResa', [this.dossier.id, opt]).then(r => console.log(r)).catch(e => console.log('ERR_RFC', e))
    }
  }
}
</script>
