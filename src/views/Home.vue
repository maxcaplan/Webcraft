<template>
  <div id="home" class="container py-3 py-lg-5 w-100">
    <h1>Webcraft Redux</h1>

    <div class="menu-wrapper px-3 mb-3 mb-lg-5">
      <transition :name="transitionName" mode="out-in">
        <router-view></router-view>
      </transition>

      <hr />

      <div class="row">
        <div class="col">
          <p class="m-0">
            Created by:
            <a
              class="text-decoration-none"
              href="https://github.com/maxcaplan"
              target="_blank"
              >Max Caplan <i class="bi bi-github text-dark"></i
            ></a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
@Component({})
export default class Home extends Vue {
  private transitionNames = {
    LEFT: "slide-left",
    RIGHT: "slide-right",
    DEFAULT: "default",
  };
  private transitionName = this.transitionNames.DEFAULT;

  @Watch("$route", { immediate: true, deep: true })
  onRouteChange(to: any, from: any) {
    if (!from) {
      this.transitionName = this.transitionNames.DEFAULT;
    } else {
      const toDepth = to.path.split("/").filter(function (i: string) {
        return i;
      }).length;
      const fromDepth = from.path.split("/").filter(function (i: string) {
        return i;
      }).length;

      this.transitionName = toDepth < fromDepth ? "slide-right" : "slide-left";
    }
  }
}
</script>

<style scoped>
#home {
  position: relative;
  height: 100%;
}

@media screen {
}

.menu-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter {
  transform: translateX(2rem);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-2rem);
  opacity: 0;
}

.slide-right-enter {
  transform: translateX(-2rem);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(2rem);
  opacity: 0;
}
</style>

<style lang="scss" scoped>
@import "../../node_modules/bootstrap/scss/functions";
@import "../../node_modules/bootstrap/scss/mixins";
@import "../../node_modules/bootstrap/scss/variables";

@media (max-width: map-get($grid-breakpoints, "sm")) {
  .menu-wrapper {
    width: 100%;
  }
}
</style>
