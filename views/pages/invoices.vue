<template>
<div class="root_invoices">
  <navbar :title="title_fact" :loggedin="true"></navbar>

  <div v-if="error_msg != ''" class="error invoices_error">{{error_msg}}</div>

  <div class="table">
    <div class="ligne ligne_fact" v-for="resa in fact_tbd" :key="resa.id" @click="showModalInvoice(resa)">
      {{resa.id}}
    </div>
  </div>

  <modal ref="modalFact" v-on:closed="resetInvoiceGen()">
    <div v-if="dossier.id">
      <h3>{{dossier.label}}</h3>
      <hr>
      <stepscontainer v-model="invoiceGen.curr_step">


        <!-- STEP1 : CHECK INFOS DOSSIER -->
        <template slot="step1">
          <h3 class="titre_step">Vérifier les infos du dossier</h3>
          <div class="content_step">
            <div class="act_fact">
              <div class="activities">
                <div class="title_underline">Activités</div>
                <ul>
                  <li v-for="act in dossier.activities" :key="act.date+act.espace+act.theme">
                    {{act.espace + '-' + act.theme}} ({{act.pax}} pax)
                  </li>
                </ul>
              </div>
              <div class="activities_fact">
                <div class="title_underline">Devis</div>
                <table class="fact">
                  <tr class="header">
                    <td class="label">Label</td>
                    <td>Pax</td>
                    <td>Prix/pax</td>
                    <td>Prix</td>
                  </tr>
                  <tr v-for="inv in dossier.invoice" :key="inv.label+inv.price_per_pax+inv.pax">
                    <td class="label">{{inv.label}}</td>
                    <td>{{inv.pax}}</td>
                    <td>{{inv.price_per_pax}} &#8362;</td>
                    <td>{{inv.price}} &#8362;</td>
                  </tr>
                  <tr class="total"><td colspan="3">TOTAL</td><td>{{dossier.invoice.map(el => el.price).sum()}} &#8362;</td></tr>
                </table>
              </div>
            </div>
          </div>
          <div class="action_step">
            <button class="btn btn_action" @click="setDonation()">Pas de facture, donation</button>
            <button class="btn btn_action" @click="setEmitFact()">Émettre une facture</button>
          </div>
        </template>


        <!-- STEP2 : ADD INVOICE INFOS -->
        <template slot="step2">
          <h3 class="titre_step">Compléter les infos de la facture</h3>
          <div class="content_step" v-show="!invoiceGen.loading">
            <div v-if="invoiceGen.type_cloture == ''">Cette étape n'est pas encore accessible, il faut passer par l'étape 1 d'abord et choisir si le groupe a payé dans les dons ou s'il faut émettre une facture :)</div>
            <div v-if="invoiceGen.type_cloture == 'donation'">Puisque le groupe a payé dans les dons, pas besoin de passer par cette étape, tu peux directement clôturer le dossier à l'étape 3.</div>
            <!-- SI facture, on peut spécifier certaines options -->
            <div class="cloture_donation" v-if="invoiceGen.type_cloture == 'facture'">
              <!-- OPTION voucher -->
              <input3 label="N° de voucher" icon="fa-home">
                <input name="voucher_num" v-model="invoiceGen.options.voucher_num" type="text">
              </input3>
              <!-- OPTION other currency -->
              <checkreveal ref="CR_other_currency">
                <template slot="info">Ajouter un montant dans une autre devise</template>
                <template slot="reveal">
                  <input3 label="Montant dans une autre devise" icon="fa-money-bill-alt">
                    <inputcurrency v-model="invoiceGen.options.amount_currency" 
                                  :currency="invoiceGen.options.other_currency"
                                  v-on:currency="invoiceGen.options.other_currency = $event"></inputcurrency>
                  </input3>
                </template>
              </checkreveal>
              <div class="info inv_info" v-if="dossier.agency && dossier.agency.RULES && dossier.agency.RULES.other_currency">Pour cette agence, il vaut mieux ajouter également le montant de la facture en {{dossier.agency.RULES.other_currency}}</div>
              <!-- OPTION bank account -->
              <checkreveal ref="CR_bank_account">
                <template slot="info">Changer le compte bancaire de facturation (Mercantile par défaut)</template>
                <template slot="reveal">
                  <input3 label="Compte bancaire de facturation" icon="fa-university">
                    <select v-model="invoiceGen.options.bank_account">
                      <option value="mercantile">Mercantile</option>
                      <option value="paxbank">Pax-Bank</option>
                    </select>
                  </input3>
                </template>
              </checkreveal>
              <div class="info inv_info" v-if="dossier.agency && dossier.agency.RULES && dossier.agency.RULES.bank_account">Pour cette agence, il vaut mieux utiliser le compte bancaire {{dossier.agency.RULES.bank_account}}</div>
              <!-- OPTION forcer numéro facture -->
              <checkreveal ref="CR_force_factnum">
                <template slot="info">Forcer le numéro de la facture</template>
                <template slot="reveal">
                  <input3 label="Forcer le N° de facture" icon="fa-file-invoice">
                    <input name="force_factnum" v-model="invoiceGen.options.force_factnum" type="text" pattern="F\s[0-9]+">
                  </input3>
                </template>
              </checkreveal>
              <!-- OPTION forcer numéro de re-facture -->
              <checkreveal ref="CR_force_refactnum">
                <template slot="info">Forcer le numéro de la re-facture</template>
                <template slot="reveal">
                  <input3 label="Forcer le N° de re-facture" icon="fa-file-invoice">
                    <input name="force_refactnum" v-model="invoiceGen.options.force_refactnum" type="text" pattern="F\s[0-9]+">
                  </input3>
                </template>
              </checkreveal>
            </div>
          </div>
          <div class="content_step" v-show="invoiceGen.loading" style="text-align: center;font-size: 2rem;">
            <i class="fas fa-spinner fa-pulse"></i>
          </div>
          <div class="action_step">
            <button v-if="invoiceGen.type_cloture == 'facture'" 
                    class="btn btn_action"
                    :class="{btn_disabled: invoiceGen.loading}"
                    @click="genFact">
                Générer la facture
            </button>
          </div>
        </template>


        <!-- STEP3 : PRINT PDF & CLOSE DOSSIER -->
        <template slot="step3">
          <h3 class="titre_step">
            <span v-if="invoiceGen.type_cloture == 'facture'">Imprimer et envoyer la facture</span>
            <span v-if="invoiceGen.type_cloture == 'donation'">Donation, clôturer le dossier</span>
          </h3>
          <div class="content_step">
            <div v-if="invoiceGen.type_cloture == ''">Cette étape n'est pas encore accessible, il faut passer par les étapes 1 et/ou 2 d'abord :)</div>
            <!-- SI donation -->
            <div class="cloture_donation" v-if="invoiceGen.type_cloture == 'donation'">
              Le groupe est venu et a payé dans les dons. Aucune facture ne sera émise et le dossier sera clôturé.
            </div>
            <!-- SI facture -->
            <div v-if="invoiceGen.type_cloture == 'facture'">
              <div class="info" v-if="dossier.agency && dossier.agency.special_info">{{dossier.agency.special_info}}</div>

              <div class="information">
                Télécharge <span v-if="invoiceGen.paths[dossier.id] && invoiceGen.paths[dossier.id].refact">les factures</span><span v-else>la facture</span> ci-dessous 
                et enregistre-<span v-if="invoiceGen.paths[dossier.id] && invoiceGen.paths[dossier.id].refact">les</span><span v-else>la</span> sur Com-Compta.
                Ensuite tu pourras envoyer le mail de facturation (avec le voucher éventuellement)
                <span v-if="dossier.agency.accountant">à <a :href="'mailto:' + dossier.agency.accountant.split(';')[0]">{{dossier.agency.accountant}}</a></span>.
                Seulement après cela, tu pourras clôturer le dossier.
              </div>

              <!-- Les liens de téléchargement des PDF -->
              <div class="facture_links" v-if="invoiceGen.paths[dossier.id] && !invoiceGen.loading">
                <div class="facture_item" v-if="invoiceGen.paths[dossier.id].fact">
                  <a target="_blank" :href="invoiceGen.paths[dossier.id].fact">
                    <i class="fas fa-download"></i><br><span>facture</span>
                  </a>
                </div>
                <div class="facture_item" v-if="invoiceGen.paths[dossier.id].refact && !invoiceGen.loading">
                  <a target="_blank" :href="invoiceGen.paths[dossier.id].refact">
                    <i class="fas fa-download"></i><br><span>refact.</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
          <div class="action_step">
            <button class="btn btn_action">C'est bon, clôturer le dossier</button>
          </div>
        </template>
      </stepscontainer>
    </div>
  </modal>

  <snackbar ref="toast"></snackbar>
</div>
</template>

<style>
.information {
  font-family: monospace;
  font-size: 0.8rem;
  padding: 2rem 4rem 0 4rem;
  text-align: center;
  color: var(--gray-color);
}

.facture_links {
  display: flex;
  align-items: center;
  justify-content: center;
}

.facture_item {
  margin: 2rem;
  text-align: center;
  text-decoration: none;
  padding: 0.8rem;
  border-radius: 10px;
  background-color: #fff;
  width: 60px;
  height: 48px;
  margin-bottom: 1em;
  box-shadow: 0 2px 3px var(--shadow-color);
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

.ligne_fact {
  cursor: pointer;
}

.root_invoices {
  margin-top: 15vh;
}

.invoices_error {
  width: 60vw;
  margin-left: 20vw;
  margin-bottom: 3rem;
}

/* STEPS */
.titre_step {
  background-color: var(--primary-color);
  color: white;
  margin: 0;
  font-size: 1.2rem;
  text-align: center;
}
.content_step {
  border: 1px solid var(--primary-color);
  padding: 2rem 0;
}
.action_step {
  text-align: right;
}

/* STEP 1 */
.act_fact {
  display: flex;
  justify-content: space-around;
}
.title_underline {
  border-bottom: 1px solid var(--primary-color);
}
.activities ul {
  padding: 0 20px;
}
table.fact {
  color: var(--gray-color);
  border-collapse: collapse;
}
table.fact tr.header {
  color: var(--primary-color);
  font-size: 0.8rem;
  font-style: italic;
}
table.fact td {
  text-align: right;
  padding: 0.3rem 0.6rem;
}
table.fact td.label {
  text-align: left;
}
table.fact tr.total {
  background-color: var(--primary-color);
  color: white;
}

/* STEP 3 */
.cloture_donation {
  padding: 3rem;
}
</style>

<script>
import InvoiceProfile from './components/invoiceProfile.vue';
import Navbar from './components/navbar.vue';
import Snackbar from './components/snackbar.vue';
import Modal from './components/modal.vue';
import StepsContainer from './components/stepsContainer.vue';
import CheckReveal from './components/checkReveal.vue';
import Input3 from './components/input3.vue';
import InputCurrency from './components/inputCurrency.vue';

export default {
  name: "invoices",
  data() {
    let default_fact_options = {
      voucher_num: '',
      amount_currency: 0, // montant dans un autre devise
      other_currency: '', // autre devise (€ ou $)
      bank_account: 'mercantile', // compte bancaire de facturation
      force_factnum: '', // le numéro de facture forcé
      force_refactnum: '' // le numéro de re-facture forcé
    }

    return {
      fact_tbd: null,
      dossier: {},

      welcomeMsg: '',
      error_msg: '',

      default_fact_options,

      invoiceGen: {
        loading: false,
        curr_step: 1, // étape courante (1, 2 ou 3)
        type_cloture: '', // 'donation' || 'facture'
        paths: {}, // path vers les pdf des factures
        options: JSON.parse(JSON.stringify(default_fact_options))
      },

      cloture: {
        fact_num: '',
        refact_num: '',
        voucher_num: ''
      }
    }
  },
  components: {
    'invoiceprofile': InvoiceProfile,
    'navbar': Navbar,
    'snackbar': Snackbar,
    'modal': Modal,
    'stepscontainer': StepsContainer,
    'checkreveal': CheckReveal,
    'input3': Input3,
    'inputcurrency': InputCurrency
  },
  computed: {
    title_fact: function() {
      if (!this.fact_tbd) return 'Factures';
      return (this.fact_tbd.length > 1) ? `${this.fact_tbd.length} factures à émettre`: '1 facture à émettre'
    }
  },
  methods: {
    showModalInvoice(dossier) {
        this.dossier = dossier;
        console.log(this.dossier)
        this.$refs.modalFact.show()
    },
    setDonation() {
      // à l'étape 1 - vérifier infos dossier
      // cette fonction est appelée en cliquant sur le bouton "Pas de facture, donation"
      this.invoiceGen.type_cloture = 'donation';
      this.invoiceGen.curr_step = 3;
    },
    setEmitFact() {
      // à l'étape 1 - vérifier infos dossier
      // cette fonction est appelée en cliquant sur le bouton "Émettre une facture"
      this.invoiceGen.type_cloture = 'facture';
      this.invoiceGen.curr_step = 2;
    },
    genFact() {
      // à l'étape 2 - compléter les infos facture
      // cette fonction est appelée en cliquant sur le bouton "Générer la facture"
      if (this.invoiceGen.loading) return;
      this.invoiceGen.loading = true;
      let url = '/invoices/gen/' + this.dossier.id;
      let options = objDiff(this.invoiceGen.options, this.default_fact_options)
      let s_options = joinObj(options, '&', '=')
      if (s_options != '') url += '?' + s_options;
      console.log("Getting url " + url)

      getJSON(url).then(o => { // use fetch instead of getJSON
        if (o.error || o.errnum) {
          console.log('ERROR in genFact', o);
          if (o.details && /not a directory/gi.test(o.details)) this.showToast(`Impossible d'accéder au dossier des factures sur Com-Compta. Vérifie que le chemin d'accès est bon dans la page des paramètres`);
          else if (o.details) this.showToast(o.details);
          else this.showToast('Une erreur est survenue : ' + JSON.stringify(o))
        } else {
          this.invoiceGen.paths = {}
          this.invoiceGen.paths[this.dossier.id] = {
            fact: "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.fact)[1],
            refact: ''
          }
          if (o.refact) this.invoiceGen.paths[this.dossier.id].refact = "/downloads/" + /downloads[\/\\](.+)$/g.exec(o.refact)[1];
          this.cloture['fact_num'] = o.fact_num;
          this.cloture['refact_num'] = o.refact_num;
          console.log('cloture', this.cloture)
          this.cloture.voucher_num = this.invoiceGen.options.voucher_num;
        }
        this.invoiceGen.loading = false;
        this.invoiceGen.curr_step = 3;
      }).catch(e => {
        console.log(e)
        this.showToast(JSON.stringify(e))
        this.invoiceGen.loading = false;
      })
    },
    closeDossier() {
      let opt = {
        facture: this.cloture.fact_num,
        refac: this.cloture.refact_num
      }
      if (opt.facture == '' && this.cloture.type == 'donation') opt.facture = 'donation';
      if (opt.facture == '') {
        this.showToast("Le mode de clôture n'a pas encore été choisi ! (facture ou donation)")
        return
      }
      if (this.invoiceGen.options.voucher_num) opt.voucher = this.invoiceGen.options.voucher_num;
      remoteCall('closeResa', [this.dossier.id, opt]).then(r => {
        console.log('closeResa => ', r);
        if (r !== true) this.showToast(JSON.stringify(r));
        else {
          this.showToast("Le dossier a été clôturé avec succès, que le nom du Seigneur soit béni !")
        }
      }).catch(e => console.log('ERR Remote Function Call', e))
    },
    resetInvoiceGen() {
      // lorsqu'on ferme la fenêtre modale, on remet tout à zéro
      this.dossier = {}
      this.invoiceGen = {
        curr_step: 1, // étape courante (1, 2 ou 3)
        type_cloture: '', // 'donation' || 'facture'
        loading: false,
        invoice_paths: {},
        options: JSON.parse(JSON.stringify(this.default_fact_options))
      }
      this.cloture = {
        fact_num: '',
        refact_num: '',
        voucher_num: ''
      }
    },
    showToast(msg, ms = 5000) {
      this.$refs.toast.show(msg, ms)
    }
  },
  mounted: function() {
    // on affiche éventuellement un message de bienvenue
    if (this.welcomeMsg != '') this.showToast(`Bienvenue à toi ${this.welcomeMsg} ! Grazie Signore !`);

    getJSON('/invoices/tbd').then(invoices => {
      if (invoices.error) {
        this.error_msg = "Une erreur est survenue en voulant récupérer les factures : " + invoices.code + ' - ' + invoices.description;
        console.log("ERROR while retrieveing invocies from DB : ", invoices)
        return
      }
      // on trie par date
      this.fact_tbd = invoices.sortBy(el => el.date)
      console.log("Got invoices " + this.fact_tbd.length + " to be emitted ! Grazie Signore !", this.fact_tbd)
    }).catch(e => {
      console.log("Unable to get invoices TBD :(", e)
    })
  }
}
</script>
