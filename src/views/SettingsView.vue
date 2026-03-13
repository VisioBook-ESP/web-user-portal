<script setup lang="ts">
import { ref } from 'vue';
import { useGradientBackground } from '@/composables/useGradientBackground';

const title = ref('Settings');
const { gradientStyle } = useGradientBackground();
</script>

<template>
  <div :style="gradientStyle">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-4">{{ title }}</h1>
          <v-card>
            <v-card-text>
              <p>Application settings will be available here.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
