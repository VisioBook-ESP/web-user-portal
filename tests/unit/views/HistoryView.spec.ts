import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HistoryView from "@/views/HistoryView.vue";
import { vi } from "vitest";

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("HistoryView", () => {
  it("renders history view", () => {
    const wrapper = mount(HistoryView, {
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

  it("displays history title", () => {
    const wrapper = mount(HistoryView, {
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

    expect(wrapper.vm.title).toBe("History");
  });

  it("has correct title ref value", () => {
    const wrapper = mount(HistoryView, {
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

    expect(wrapper.vm.title).toBe("History");
  });
});
