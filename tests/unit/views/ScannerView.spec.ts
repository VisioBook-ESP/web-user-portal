import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ScannerView from "@/views/ScannerView.vue";
import { vi } from "vitest";

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("ScannerView", () => {
  it("renders scanner view", () => {
    const wrapper = mount(ScannerView, {
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

  it("displays scanner title", () => {
    const wrapper = mount(ScannerView, {
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

    expect(wrapper.vm.message).toBe("Scanner View");
  });

  it("has correct message ref value", () => {
    const wrapper = mount(ScannerView, {
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

    expect(wrapper.vm.message).toBe("Scanner View");
  });
});
