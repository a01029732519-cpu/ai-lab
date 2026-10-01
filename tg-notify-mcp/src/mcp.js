// MCP (JSON-RPC 2.0, Streamable HTTP, stateless) 처리
import { ConfigError } from "./config.js";
import { TelegramError } from "./telegram.js";
import { ToolInputError, findTool, listTools } from "./tools.js";

const SERVER_INFO = { name: "tg-notify", version: "1.0.0" };
const DEFAULT_PROTOCOL = "2025-06-18";
const INSTRUCTIONS =
  "사용자 텔레그램 알림 도구. 폰 조작처럼 여러 단계 작업을 할 때 시작/주요 단계(progress)/완료(done)/오류(error)를 tg_notify로 알려라. " +
  "사용자 결정이 필요하면 tg_ask를 써라. 알림을 남발하지 말 것.";

class RpcError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function callTool(params, ctx) {
  const tool = findTool(params?.name);
  if (!tool) throw new RpcError(-32602, `알 수 없는 도구: ${params?.name}`);
  try {
    const client = ctx.getClient();
    const text = await tool.run(params.arguments ?? {}, { ...ctx, ...client });
    return { content: [{ type: "text", text }] };
  } catch (e) {
    if (e instanceof ToolInputError || e instanceof TelegramError || e instanceof ConfigError) {
      return { content: [{ type: "text", text: `오류: ${e.message}` }], isError: true };
    }
    throw e;
  }
}

async function dispatch(method, params, ctx) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: typeof params?.protocolVersion === "string" ? params.protocolVersion : DEFAULT_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: listTools() };
    case "tools/call":
      return callTool(params, ctx);
    default:
      throw new RpcError(-32601, `지원하지 않는 메서드: ${method}`);
  }
}

// 응답이 필요 없으면 null
export async function handleMessage(msg, ctx) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") {
    return rpcError(msg?.id ?? null, -32600, "Invalid Request");
  }
  if (typeof msg.method !== "string" || !("id" in msg)) return null; // 알림 or 클라이언트 응답

  try {
    return { jsonrpc: "2.0", id: msg.id, result: await dispatch(msg.method, msg.params ?? {}, ctx) };
  } catch (e) {
    if (e instanceof RpcError) return rpcError(msg.id, e.code, e.message);
    return rpcError(msg.id, -32603, "Internal error");
  }
}
