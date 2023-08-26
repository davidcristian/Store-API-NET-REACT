import { defineConfig } from "cypress";

import { DEV_BACKEND_API_URL } from "./src/utils/constants";

export default defineConfig({
  e2e: {
    baseUrl: DEV_BACKEND_API_URL,
  },
});
