<template>
<div class="root_lu">
    <navbar title="Liens utiles" :loggedin="loggedin"></navbar>
    
    <div class="lu_sections">
        <template v-for="section in liens_utiles">
            <div class="section_title" :key="section.title">{{section.title}}</div>
            <div class="section_content" :key="section.title">
                <div class="lu_lien" v-for="lien in section.liens" :key="lien.path">
                    <p class="lu_label">{{lien.label}}</p>
                    <p class="lu_path" v-for="path in lien.path" :key="path" @click="copyTestingCode(path)">{{path}}</p>
                </div>
            </div>
        </template>
    </div>

    <input type="hidden" id="testing-code" :value="testingCode">
    <snackbar ref="toast"></snackbar>
</div>
</template>

<style scoped>
p.lu_label {
    margin: 0;
    margin-top: 1rem;
}

p.lu_path {
    font-family: monospace;
    font-size: 0.7rem;
    color: var(--gray-color);
    margin: 0;
    cursor: pointer;
}
p.lu_path:hover {
    color: var(--primary-color);
    font-weight: bold;
}

.lu_sections {
    margin-top: 15vh;
    margin-left: 20vw;
    width: 60vw;
    box-shadow: var(--shadow-color) 0 1px 3px;
    background: white;
}

.section_title {
    background: var(--primary-color);
    color: white;
    padding: 1rem;
}

.section_content {
    padding: 1rem;
}
</style>

<script>
import Navbar from './components/navbar.vue';
import Snackbar from './components/snackbar.vue';

export default {
  name: "liensutiles",
  components: {
      'navbar': Navbar,
      'snackbar': Snackbar
  },
  data() {
    return {
        loggedin: false,
        liens_utiles: [],
        testingCode: ''
    }
  },
  methods: {
    copyTestingCode (texte) {
        this.testingCode = texte;
        let testingCodeToCopy = document.querySelector('#testing-code')
        testingCodeToCopy.setAttribute('type', 'text')    // 不是 hidden 才能複製
        testingCodeToCopy.select()

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successfully' : 'unsuccessfully';
            console.log('Testing code was copied ' + msg, this.testingCode);
            this.showToast('le lien a été copié ! Merci Seigneur !')
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        /* unselect the range */
        testingCodeToCopy.setAttribute('type', 'hidden')
        window.getSelection().removeAllRanges()
    },
    showToast(msg, ms = 2000) {
      this.$refs.toast.show(msg, ms)
    },
  }
}
</script>