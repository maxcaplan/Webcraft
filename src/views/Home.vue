<template>
  <div id="home" class="container py-3 py-lg-5 w-100">
    <h1>Webcraft Redux</h1>

    <div class="menu-wrapper px-3 mb-3 mb-lg-5">
      <div class="d-grid gap-2">
        <button class="btn btn-primary d-block btn-lg">
          Start <i class="bi bi-play-fill"></i>
        </button>
        <button class="btn btn-secondary d-block btn-lg">
          Settings <i class="bi bi-gear-fill"></i>
        </button>
        <button class="btn btn-info d-block btn-lg">
          Info <i class="bi bi-question-circle-fill"></i>
        </button>
      </div>

      <hr />

      <div class="row">
        <div class="col">
          <p class="m-0">
            Created by:
            <a class="text-decoration-none" href="#"
              >Max Caplan <i class="bi bi-github text-dark"></i
            ></a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
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
