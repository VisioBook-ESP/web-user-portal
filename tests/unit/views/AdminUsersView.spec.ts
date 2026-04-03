import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import AdminUsersView from "@/views/AdminUsersView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: {},
  })),
}));

vi.mock("@/services/api/adminApi", () => ({
  adminApi: {
    getAllUsers: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            username: "testuser",
            email: "test@example.com",
            role: "user",
            first_name: "Test",
            last_name: "User",
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
          },
        ],
        total: 1,
      }),
    ),
    deleteUser: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/services/api/userApi", () => ({
  userApi: {
    getUser: vi.fn(),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("AdminUsersView", () => {
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

  it("renders the users list view", () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".admin-users-view").exists()).toBe(true);
  });

  it("loads users on mount", async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.users).toHaveLength(1);
    expect(wrapper.vm.users[0].username).toBe("testuser");
  });



  it("filters users by search query", async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.searchQuery = "testuser";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredUsers).toHaveLength(1);
  });

  it("filters users by role", async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.roleFilter = "admin";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredUsers).toHaveLength(0);

    wrapper.vm.roleFilter = "user";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredUsers).toHaveLength(1);
  });

  it("paginates users correctly", async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.pageSize = 1;
    wrapper.vm.currentPage = 1;

    expect(wrapper.vm.paginatedUsers).toHaveLength(1);
    expect(wrapper.vm.totalPages).toBe(1);
  });

  it("returns correct role color", () => {
    const wrapper = mount(AdminUsersView, {
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
});
