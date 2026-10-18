import { createJSXDecorator, type Preview } from "storybook-solidjs-vite";
import { I18nContextProvider } from "../src/integrations/i18n";
import "../src/index.css";

/**
 * Some components (`Dialog`, `AlertDialog`) read translations from the i18n
 * context, so every story is wrapped in the provider.
 */
const withI18n = createJSXDecorator((Story) => (
  <I18nContextProvider>
    <Story />
  </I18nContextProvider>
));

const preview: Preview = {
  decorators: [withI18n],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;
