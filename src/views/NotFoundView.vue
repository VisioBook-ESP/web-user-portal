<script setup lang="ts">
import { useRouter } from "vue-router";
import { useGradientBackground } from "@/composables/useGradientBackground";

const router = useRouter();
const { gradientStyle } = useGradientBackground();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div :style="gradientStyle">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-icon size="120" color="primary"> mdi-alert-circle-outline </v-icon>
          <h1 class="text-h2 mt-4 mb-2">404</h1>
          <p class="text-h5 mb-6">Page Not Found</p>
          <p class="text-body-1 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <v-btn color="primary" size="large" @click="goHome">
            Go to Homepage
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
