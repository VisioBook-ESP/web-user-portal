<script setup lang="ts">
const footerLinks = ["Features", "Learn more", "Support"];
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <router-link to="/">
          <img
            src="/assets/images/logo.png"
            alt="VisioBook"
            class="footer-logo-img"
          >
        </router-link>
      </div>

      <nav class="footer-nav">
        <a
          v-for="link in footerLinks"
          :key="link"
          href="#"
          class="footer-link"
        >
          {{ link }}
        </a>
      </nav>

      <div class="footer-social">
        <a
          href="#"
          class="social-icon"
          aria-label="Instagram"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="5"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
            />
            <circle
              cx="18"
              cy="6"
              r="1"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          href="#"
          class="social-icon"
          aria-label="LinkedIn"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="2"
            />
            <line
              x1="8"
              y1="11"
              x2="8"
              y2="16"
            />
            <line
              x1="8"
              y1="8"
              x2="8"
              y2="8.01"
            />
            <path d="M12 16v-5a2 2 0 0 1 4 0v5" />
          </svg>
        </a>
        <a
          href="#"
          class="social-icon"
          aria-label="X (Twitter)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: #fafafa;
  padding: 32px 40px;
  border-top: 1px solid #e8e8e8;
}

.footer-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.footer-brand {
  flex: 1;

  a {
    display: inline-block;
  }
}

.footer-logo-img {
  height: 44px;
  width: auto;
}

.footer-nav {
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    gap: 24px;
  }
}

.footer-link {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #1a1a1a;
  }
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-icon {
  width: 20px;
  height: 20px;
  color: #888;
  transition: color 0.2s;

  &:hover {
    color: #1a1a1a;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
