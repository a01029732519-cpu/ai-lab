// 코드만 다시 업로드하고 기존 시크릿(봇 토큰·chat id·접속 비밀키)은 서버에 있는 그대로 유지
import { readFile } from "node:fs/promises";
import { CloudflareClient } from "./cf.mjs";

const SCRIPT_NAME = "tg-mcp";
const COMPATIBILITY_DATE = "2025-09-01";
const MAIN_MODULE = "index.js";
const MODULES = ["index.js", "config.js", "telegram.js", "format.js", "ask.js", "tools.js", "mcp.js"];
const SRC_DIR = new URL("../src/", import.meta.url);

const token = process.env.CF_API_TOKEN?.trim();
if (!token) {
  console.error("✖ CF_API_TOKEN 값이 비어 있음");
  process.exit(1);
}

try {
  const cf = new CloudflareClient(token);
  const accountId = await cf.accountId();
  console.error("  · 계정 확인");

  const metadata = {
    main_module: MAIN_MODULE,
    compatibility_date: COMPATIBILITY_DATE,
    bindings: [],
    keep_bindings: ["secret_text"],
  };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  for (const name of MODULES) {
    const code = await readFile(new URL(name, SRC_DIR), "utf8");
    form.append(name, new Blob([code], { type: "application/javascript+module" }), name);
  }
  await cf.request(`/accounts/${accountId}/workers/scripts/${SCRIPT_NAME}`, { method: "PUT", body: form });
  console.error("  · 코드 업로드 (기존 시크릿 유지)");
  console.log("REDEPLOY_OK");
} catch (e) {
  console.error(`✖ ${e.message}`);
  process.exit(1);
}
