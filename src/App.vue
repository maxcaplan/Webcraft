<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {}
</script>

<style lang="scss">
@import "@/assets/scss/main";
@import "@/assets/css/main";

#app {
  height: 100%;
  width: 100%;
}
</style>
