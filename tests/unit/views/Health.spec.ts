import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Health from "@/views/Health.vue";

describe("Health", () => {
  it("renders health view", () => {
    const wrapper = mount(Health);

    expect(wrapper.exists()).toBe(true);
  });

  it("displays OK status", () => {
    const wrapper = mount(Health);

    expect(wrapper.text()).toContain("OK");
  });
});
