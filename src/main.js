import Vue from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import vuetify from './plugins/vuetify'
import Vue2Filters from 'vue2-filters'

var Vue2FiltersConfig = {
  currency: {
    symbol: '',
    thousandsSeparator: '',
    decimalSeparator: '.',
  }
}

Vue.use(vuetify)
Vue.use(Vue2Filters, Vue2FiltersConfig)
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
