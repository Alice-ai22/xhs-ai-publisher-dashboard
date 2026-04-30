import { NextResponse } from "next/server";

/** 成功响应 */
export function ok<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

/** 成功响应（无 data） */
export function okEmpty() {
  return NextResponse.json({ success: true });
}

/** 400 请求错误 */
export function badRequest(error: string, code?: string) {
  return NextResponse.json(
    { success: false, error, ...(code ? { code } : {}) },
    { status: 400 }
  );
}

/** 404 未找到 */
export function notFound(error: string) {
  return NextResponse.json({ success: false, error }, { status: 404 });
}

/** 500 服务器错误 */
export function serverError(error: unknown) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { success: false, error: errorMsg },
    { status: 500 }
  );
}
