<template>
<div class="root_resas">
  <h3>Réservations</h3>
  <div class="resa_table">
    <!-- <div class="resa_table_header ligne">
      <div class="first_col"></div><div>Header</div>
    </div> -->
    <div v-for="resaGroup in resaList" :key="resaGroup[0].date">
        <div class="resa_table_month ligne">
            <div>{{moment(resaGroup[0].date, 'YYYYMM').format('MMMM YYYY')}}</div>
            <div class="stats_month">{{resaGroup.length}} résa<span v-if="resaGroup.length > 1">s</span> {{resaGroup.map(r => r.invoice.map(i => i.price).sum()).sum()}} &#8362;</div>
        </div>
        <div v-for="resa in resaGroup" :key="resa.id" class="ligne resa_line">
            <div class="resa_id">
                {{resa.id}}
            </div>
            <div class="resa_date">
                {{moment(resa.date, 'YYYYMMDD').format('D MMM')}}
            </div>
            <div class="resa_id">
                {{resa.label}}
            </div>
            <div class="resa_confirm">
                <i v-if="loading_conf != resa.id" class="fa fa-file-text-o" @click="genConfirmation(resa.id)"></i>
                <i v-if="loading_conf == resa.id" class="fa fa-spinner fa-pulse"></i>
                <a v-if="pdf_path[resa.id]" target="_blank" :href="pdf_path[resa.id]"><i class="fa fa-download"></i></a>
            </div>
        </div>
    </div>
  </div>
</div>
</template>

<style>
a {
    color: black;
    margin-left: 10px;
    margin-right: 4px;
}

.resa_confirm {
    flex-grow: 2;
    text-align: right;
}
.resa_confirm > i {
    background-color: #ddd;
    border-radius: 100%;
    line-height: 23px;
    width: 23px;
    text-align: center;
    cursor: pointer;
}
.resa_confirm > i:hover {
    background-color: #ccc;
}

.resa_id {
    margin-left: 1rem;
}

.resa_date {
    margin-left: 1rem;
    width: 10%;
}

.resa_line {
    background-color: white;
    height: 24px;
}
.resa_line > div {
    overflow: hidden;
}

.resa_table_month {
    font-variant: small-caps;
    background-color: #ddd;
    font-weight: bold;
}

.resa_table_header {
    background-color: white;
    color: #777;
}

.resa_table_header > .first_col {
    width: 10%;
}

.ligne {
    padding: 1rem;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #777;
}

.stats_month {
    flex-grow: 2;
    text-align: right;
}

@media screen and (min-width: 600px) {
  .resa_table {
    width: 90%;
    margin-left: 5%;
    max-width: 700px;
  }
}
@media screen and (max-width: 600px) {
  .resa_table {
    width: 100%;
    margin-left: 0;
  }
}

h3 {
  margin-left: 5%;
}
</style>

<script>
export default {
  name: "resas",
  data() {
    return {
        resaList: [],
        loading_conf: "",
        pdf_path: {}
    }
  },
  mounted: function() {
    getJSON('/RFC/getFutureResas').then(resas => {
        console.log(resas)
        this.resaList = resas.sortBy(el => el.date)
        this.resaList = this.resaList.splitBy(el => moment(el.date, 'YYYYMMDD').format('YYYYMM'))
    })
  },
  methods: {
      genConfirmation(dossier_id) {
          this.loading_conf = dossier_id;
          getJSON(`/RFC/genConfirmation/${dossier_id}/{}`).then(pdf_o => {
              this.pdf_path[dossier_id] = '/downloads/' + pdf_o.name;
              this.loading_conf = ""
          })
      }
  }
}
</script>