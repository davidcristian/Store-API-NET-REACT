import { defineConfig } from "cypress";

import { DEV_BACKEND_API_URL } from "./src/constants";

export default defineConfig({
  e2e: {
    baseUrl: DEV_BACKEND_API_URL,
  },
});
