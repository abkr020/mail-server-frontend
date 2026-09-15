import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { execSync } from "child_process";

const gitCommit = execSync("git rev-parse HEAD").toString().trim();
const gitBranch = execSync("git branch --show-current").toString().trim();
const gitCommitDate = execSync(
  "git log -1 --format=%cI"
).toString().trim();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

    define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit),
    __GIT_BRANCH__: JSON.stringify(gitBranch),
    __GIT_COMMIT_DATE__: JSON.stringify(gitCommitDate),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})
