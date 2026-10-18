import tailwindcss from "@tailwindcss/vite";

/**
 * Vite config used only by Storybook.
 *
 * The root `vite.config.ts` wires up the Cloudflare Worker plugin, which
 * Storybook has no use for. This config keeps the plugins Storybook needs
 * (Tailwind + daisyUI); the Solid compiler is added by the
 * `storybook-solidjs-vite` framework.
 */
export default {
  plugins: [tailwindcss()],
};
