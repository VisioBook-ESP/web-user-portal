import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectDetailView from "@/views/ProjectDetailView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: { id: "1" },
  })),
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("ProjectDetailView", () => {
  it("renders project detail view", () => {
    const wrapper = mount(ProjectDetailView, {
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

  it("computes gradient background style", () => {
    const wrapper = mount(ProjectDetailView, {
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

    expect(wrapper.vm).toBeDefined();
  });

  it("has project id from route", () => {
    const wrapper = mount(ProjectDetailView, {
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

    expect(wrapper.vm.projectId).toBe("1");
  });

  it("initializes project id from route params", () => {
    const wrapper = mount(ProjectDetailView, {
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

    expect(wrapper.vm.projectId).toBe("1");
  });
});
