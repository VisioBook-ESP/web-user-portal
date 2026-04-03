import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import { useRouter, useRoute } from "vue-router";
import AdminUserDetailView from "@/views/AdminUserDetailView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: { id: "1" },
  })),
}));

vi.mock("@/services/api/userApi", () => ({
  userApi: {
    getUser: vi.fn(() =>
      Promise.resolve({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        role: "user",
        first_name: "Test",
        last_name: "User",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      }),
    ),
    updateUser: vi.fn(),
    deleteUser: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/services/api/adminApi", () => ({
  adminApi: {
    getUserProjects: vi.fn(() =>
      Promise.resolve([
        {
          id: "1",
          title: "Test Project",
          status: "completed",
          createdAt: "2024-01-01",
        },
      ]),
    ),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("AdminUserDetailView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.isAuthenticated = true;
    authStore.isAdmin = true;
    authStore.user = {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    };
  });

  it("renders the user detail view", () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".admin-user-detail-view").exists()).toBe(true);
  });

  it("loads user data on mount", async () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.user).toBeDefined();
    expect(wrapper.vm.user?.username).toBe("testuser");
    expect(wrapper.vm.user?.email).toBe("test@example.com");
  });

  it("loads user projects", async () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.userProjects).toHaveLength(1);
    expect(wrapper.vm.userProjects[0].title).toBe("Test Project");
  });



  it("enters edit mode when edit button is clicked", async () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.startEdit();

    expect(wrapper.vm.isEditMode).toBe(true);
  });

  it("initializes edit form with current user data", async () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.startEdit();

    expect(wrapper.vm.editForm.username).toBe("testuser");
    expect(wrapper.vm.editForm.first_name).toBe("Test");
    expect(wrapper.vm.editForm.last_name).toBe("User");
  });

  it("cancels edit mode", async () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.startEdit();
    expect(wrapper.vm.isEditMode).toBe(true);

    wrapper.vm.cancelEdit();
    expect(wrapper.vm.isEditMode).toBe(false);
  });

  it("returns correct role color", () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.roleColor("admin")).toBe("bg-purple-100 text-purple-800");
    expect(wrapper.vm.roleColor("user")).toBe("bg-blue-100 text-blue-800");
  });

  it("returns correct status color", () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.statusColor("completed")).toBe(
      "bg-green-100 text-green-800",
    );
    expect(wrapper.vm.statusColor("processing")).toBe(
      "bg-blue-100 text-blue-800",
    );
    expect(wrapper.vm.statusColor("draft")).toBe("bg-gray-100 text-gray-800");
    expect(wrapper.vm.statusColor("failed")).toBe("bg-red-100 text-red-800");
  });

  it("formats date correctly", () => {
    const wrapper = mount(AdminUserDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    const formatted = wrapper.vm.formatDate("2024-01-01");
    expect(formatted).toContain("January");
    expect(formatted).toContain("2024");
  });
});
