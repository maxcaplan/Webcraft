<template>
  <div class="mainMenu">
    <div class="d-grid gap-2">
      <router-link to="/" class="btn btn-primary d-block btn-lg">
        Start <i class="bi bi-play-fill"></i>
      </router-link>
      <router-link to="/settings" class="btn btn-secondary d-block btn-lg">
        Settings <i class="bi bi-gear-fill"></i>
      </router-link>
      <router-link to="/info" class="btn btn-info d-block btn-lg">
        Info <i class="bi bi-question-circle-fill"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainMenu",
};
</script>

<style></style>
