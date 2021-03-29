<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  private themes = { LIGHT: "light", DARK: "dark" };
  private theme = "light";

  @Watch("theme")
  themeChanged() {
    this.toggleTheme();
  }

  public toggleTheme(): void {
    this.theme =
      this.theme === this.themes.LIGHT ? this.themes.DARK : this.themes.LIGHT;
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/main";
@import "@/assets/css/main";

#app {
  height: 100%;
  width: 100%;
}
</style>
