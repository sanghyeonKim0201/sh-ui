import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 정적 자산·API 라우트는 제외, 그 외 모든 경로에 미들웨어 적용
  matcher: ["/((?!api|_next|_vercel|search-index.json|.*\\..*).*)"],
};
