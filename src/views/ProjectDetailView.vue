<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGradientBackground } from '@/composables/useGradientBackground';

const route = useRoute();
const projectId = ref(route.params.id);
const { gradientStyle } = useGradientBackground();
</script>

<template>
  <div :style="gradientStyle">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-4">Project Details</h1>
          <v-card>
            <v-card-text>
              <p>Viewing project: {{ projectId }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
