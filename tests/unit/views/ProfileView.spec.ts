import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import ProfileView from "@/views/ProfileView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("ProfileView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.isAuthenticated = true;
    authStore.user = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
      first_name: "Test",
      last_name: "User",
    };
  });

  it("renders profile view", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("initializes with profile section active", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.activeSection).toBe("profile");
  });

  it("initializes editing as false", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isEditing).toBe(false);
  });

  it("initializes saving as false", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isSaving).toBe(false);
  });

  it("syncs profile form from store on mount", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.profileForm.username).toBe("testuser");
    expect(wrapper.vm.profileForm.first_name).toBe("Test");
    expect(wrapper.vm.profileForm.last_name).toBe("User");
  });

  it("initializes password form fields", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.passwordForm.currentPassword).toBe("");
    expect(wrapper.vm.passwordForm.newPassword).toBe("");
    expect(wrapper.vm.passwordForm.confirmPassword).toBe("");
  });

  it("can switch to password section", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    wrapper.vm.activeSection = "password";
    expect(wrapper.vm.activeSection).toBe("password");
  });

  it("can switch to premium section", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    wrapper.vm.activeSection = "premium";
    expect(wrapper.vm.activeSection).toBe("premium");
  });

  it("can switch to notifications section", () => {
    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    wrapper.vm.activeSection = "notifications";
    expect(wrapper.vm.activeSection).toBe("notifications");
  });
});
