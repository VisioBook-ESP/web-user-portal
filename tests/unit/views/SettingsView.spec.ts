import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SettingsView from "@/views/SettingsView.vue";
import { vi } from "vitest";

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("SettingsView", () => {
  it("renders settings view", () => {
    const wrapper = mount(SettingsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("displays settings title", () => {
    const wrapper = mount(SettingsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.vm.title).toBe("Settings");
  });

  it("has correct title ref value", () => {
    const wrapper = mount(SettingsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.vm.title).toBe("Settings");
  });
});
