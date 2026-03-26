<script setup lang="ts">
import { ref } from "vue";
import { useGradientBackground } from "@/composables/useGradientBackground";

const message = ref("Scanner View");
const { gradientStyle } = useGradientBackground();
</script>

<template>
  <div :style="gradientStyle">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-4">{{ message }}</h1>
          <v-card>
            <v-card-text>
              <p>Scanner functionality will be implemented here.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
