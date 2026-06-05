export function buildCheckoutReturnUrl(path: string): string {
  const currentUrl = new URL(window.location.href);
  const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

  if (localHostnames.has(currentUrl.hostname)) {
    // Use 127.0.0.1 instead of "localhost" so the URL passes @IsUrl()
    // validation on the backend (validator.js skips TLD check for IPs).
    const safeHost = `127.0.0.1${currentUrl.port ? `:${currentUrl.port}` : ""}`;
    return new URL(path, `${currentUrl.protocol}//${safeHost}`).toString();
  }

  return new URL(path, currentUrl.origin).toString();
}
