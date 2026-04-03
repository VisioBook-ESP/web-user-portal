import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useUIStore } from "@/store/ui";
import ForgotPasswordView from "@/views/auth/ForgotPasswordView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("ForgotPasswordView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it("renders forgot password view", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("initializes with empty email", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(wrapper.vm.email).toBe("");
  });

  it("initializes loading as false", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(wrapper.vm.isLoading).toBe(false);
  });

  it("initializes email sent as false", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(wrapper.vm.emailSent).toBe(false);
  });

  it("initializes with empty error", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(wrapper.vm.error).toBe("");
  });

  it("has validateEmail method", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(typeof wrapper.vm.validateEmail).toBe("function");
  });

  it("has handleSubmit method", () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
          "v-text-field": true,
          "v-btn": true,
          "v-alert": true,
        },
      },
    });

    expect(typeof wrapper.vm.handleSubmit).toBe("function");
  });
});
