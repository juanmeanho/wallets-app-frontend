<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-btn text>
        <v-icon>mdi-menu</v-icon>
        <span class="ml-2">Digital Wallet Dashboard</span>
      </v-btn>
      <v-spacer></v-spacer>
      <v-icon color="white" class="mr-4">mdi-ethereum</v-icon>
    </v-app-bar>

    <v-main>
      <HelloWorld/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/WalletsComponent';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>
