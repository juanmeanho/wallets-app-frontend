<template>
  <v-container>
    <v-row justify="center" class="ma-5">
      <v-col xs="12" sm="12">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon>mdi-view-list</v-icon>
            <span class="ml-2">Wallets list</span>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list subheader>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-text-field v-model="newWallet" :loading="isInputLoading" id="newWallet" name="newWallet" label="Type your wallet address" @keyup.enter="addWallet" />
                  <div class="text-center">
                    <v-progress-circular class="ma-55" v-show="preloader" :size="55" color="primary" indeterminate></v-progress-circular>
                  </div>
                </v-list-item-title>
                  <v-snackbar dark class="mt-5" v-model="alert" top color="success" timeout="2000">
                    <div class="text-center">Addres saved succesfully</div>
                  </v-snackbar>
                  <v-snackbar dark class="mt-5" v-model="alertInvalid" top color="warning" timeout="2000">
                    <div class="text-center">{{ alertMsg }}</div>
                  </v-snackbar>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <template>
            <v-btn color="success" class="m-1" small v-if="wallets.length" @click="sortByFavs(sort)">
              <v-icon class="mr-2">
                mdi-sort
              </v-icon>
              Sort by favorites
            </v-btn>
            <v-subheader class="subheading" v-if="!wallets.length && loader">No wallets</v-subheader>
            <v-expansion-panels v-else v-model="panel">
              <v-expansion-panel v-for="(wallet, i) in wallets" :key="i" >
                <v-expansion-panel-header @click="getBalanceAddress(wallet.address)">
                  <div>
                    <v-icon :color="wallet.fav ? 'yellow darken-4' : ''" class="mr-4">mdi-star</v-icon>
                      <span>{{ wallet.address }}</span>
                      <v-chip v-show="wallet.old" class="ml-2" color="deep-orange lighten-1" label small text-color="white">
                      <v-icon small left>
                        mdi-clock
                      </v-icon>
                      Old wallet
                    </v-chip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-row no-gutters>
                    <v-col cols="8">
                      <v-text-field prepend-icon="mdi-ethereum" v-model="ethBalance" :loading="isInputETHLoading" id="ethBalance" name="ethBalance" type="number" label="ETH balance" @keyup="changeETHBalance()"/>
                      <v-text-field prepend-icon="mdi-currency-usd" v-model="usdBalance" :value="usdBalance | currency" :loading="isInputRatesLoading" id="usdBalance" name="usdBalance" type="number" label="USD balance"  @keyup="changeUSDBalance()"/>
                      <v-text-field prepend-icon="mdi-currency-eur" v-model="eurBalance" :value="eurBalance | currency" :loading="isInputRatesLoading" id="eurBalance" name="eurBalance" type="number" label="EURO balance"  @keyup="changeEURBalance()"/>

                      <v-text-field prepend-icon="mdi-currency-usd" v-model="usdRate" :value="usdRate | currency" :loading="isInputRatesLoading" id="usdRate" name="usdRate" type="number" label="USD Rate" @keyup="changeETHBalance()"/>
                      <v-text-field prepend-icon="mdi-currency-eur" v-model="eurRate" :value="eurRate | currency" :loading="isInputRatesLoading" id="eurRate" name="eurRate" type="number" label="EURO Rate" @keyup="changeETHBalance()"/>
                    </v-col>
                    <v-divider vertical class="mx-4" ></v-divider>
                    <v-col cols="3"> Add to favorites or delete this wallet
                      <br>
                      <br>
                      <v-btn class="mx-2" fab dark small color="pink" @click="addToFav(wallet.id, i)">
                      <v-icon dark>
                        mdi-heart
                      </v-icon>
                      </v-btn>
                      <v-btn color="error" @click="removeWallet(wallet.id, i)">
                        <v-icon dark class="mr-2">
                          mdi-delete
                        </v-icon>
                        Delete
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from "axios";
  import moment from 'moment';

  export default {
    name: 'WalletsComponent',
    beforeCreate() {
      this.preloader = true;
    },
    created() {
      axios.get("/api/wallets").then((result) => {
        this.wallets = result.data.slice().reverse();
        this.preloader = false
      })      
    },
    data: () => ({
      api: "https://api.etherscan.io",
      wei: 1000000000000000000,
      newWallet: "",
      wallets: [],
      alert: false,
      alertInvalid: false,
      alertMsg: "",
      sort: 0,
      panel: [],
      ethBalance: "",
      usdBalance: "",
      eurBalance: "",
      eurRate: "",
      usdRate: "",
      isInputETHLoading: false,
      isInputRatesLoading: false,
      isInputLoading: false
    }),
    methods: {
      async addWallet() {

        const value = this.newWallet && this.newWallet.trim();
        if (!value) {
          return;
        }

        if(this.validateAdress(this.newWallet) && this.checkAddressExist(this.newWallet)){

          const transaction   = await this.getTransactionsWallet(this.newWallet)
          let isOldWallet     = false;
          this.isInputLoading = true
          this.panel = []

          if(transaction.data.status === "1"){
            isOldWallet = this.checkOldAdress(transaction.data.result[0].timeStamp)
          }

          const wallet = { 
            address: this.newWallet,
            old: isOldWallet,
            fav: false 
          };

          const walletData = await axios.post("/api/wallets", wallet )
          .then(response => {
            this.alert = true;
            return response.data

          }).catch(error => {
            this.showAlertError(error)
            return;
          });

          this.wallets.unshift({
            id: walletData.id,
            address: this.newWallet,
            old: isOldWallet,
            fav: false 
          });

          this.isInputLoading = false
          this.newWallet = "";
        }
      },
      removeWallet(walletId, index) {

        axios.delete(`/api/wallets/${walletId}/delete`)
        .then(response => {
          this.wallets.splice(index, 1);
          return response
        }).catch(error => {
            this.showAlertError(error)
            return;
        });
      },
      validateAdress(address){

        var WAValidator = require('wallet-address-validator');
        var valid = WAValidator.validate(address, 'ETH');
        if(valid){
          return true;
        }else{
          this.showAlertError("Invalid address")
          return false;
        }
      },
      showAlertError(msg){

        this.alertMsg = msg;
        this.alertInvalid = true;
        setTimeout(() => {
          this.alertInvalid = false;
        }, 2000);
      },
      checkAddressExist(address){

        if(this.wallets.some(wallet => wallet.address === address)){
            this.showAlertError("Address already exist")
            return false;
        } else{
            return true;
        }
      },
      getTransactionsWallet(address){
        return axios.get(`${this.api}/api?module=account&action=txlist&address=${address}&page=1&offset=1&sort=asc&apikey=${process.env.VUE_APP_API_ETH}`)
      },
      checkOldAdress(timestamp){

        const now    = moment(); 
        const then   = moment.unix(timestamp); 
        const delta  = now.diff(then, 'milliseconds'); 
        const msYear = 31557600000;
        
        if(delta > msYear){
          return true;
        }else{
          return false;
        }
      },
      addToFav(walletId, index){

        const fav = this.wallets[index].fav;
        axios.put(`/api/wallets/${walletId}/update`, { fav: !fav } )
        .then(response => {
          this.wallets[index].fav = !fav;
          return response;

        }).catch(error => {
            this.showAlertError(error)
            return;
        });
      },
      sortByFavs(){

        const checkFavs =  this.wallets.some(wallet => wallet.fav === true); 
        if(checkFavs){
          this.panel= [];
          const check = this.sort ? 1:0;
          if(check)
            this.wallets.sort((a, b) => (a.fav > b.fav) ? 1 : -1)
          else
            this.wallets.sort((a, b) => (a.fav < b.fav) ? 1 : -1)
          this.sort = !check;
        }
      },
      async getBalanceAddress(address){

        this.isInputEthLoading = true;
        this.ethBalance = "";
        const balance   = await axios.get(`${this.api}/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.VUE_APP_API_ETH}`)
        this.ethBalance = balance.data.result/this.wei;
        this.isInputEthLoading = false;

        this.isInputRatesLoading = true;
        this.usdRate    = "";
        this.eurRate    = "";
        const rates     = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR');
        this.usdRate    = rates.data.USD;
        this.eurRate    = rates.data.EUR;       
        this.usdBalance = this.usdRate * this.ethBalance;   
        this.eurBalance = this.eurRate * this.ethBalance;   
        this.isInputRatesLoading = false;

      },
      changeETHBalance(){
        
        this.usdBalance = this.ethBalance * this.usdRate;
        this.eurBalance = this.ethBalance * this.eurRate;
      },
      changeUSDBalance(){
        this.ethBalance = this.usdBalance/this.usdRate;
      },
      changeEURBalance(){
        this.ethBalance = this.eurBalance/this.eurRate;
      }
    },
  }
</script>

<style>
.mdi-ethereum{
  color: dimgrey !important;
}
.mdi-currency-usd{
  color: green !important;
}
.mdi-currency-eur{
  color: black !important;
}
</style>
