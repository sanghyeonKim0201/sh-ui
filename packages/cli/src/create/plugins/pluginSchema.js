import { z } from 'zod';

/**
 * 플러그인 manifest 스키마.
 * plugins/index.js 로딩 시 모든 플러그인을 이 스키마로 validate 한다.
 *
 * 디자인 가드:
 * - file path 가 'src/proxy.ts' 면 거부 — Next 16 은 root proxy.ts 만 인식하므로
 *   (베이스 템플릿이 app/ 을 root 에 두는 한). 이런 종류의 사고를 빌드 타임에 차단.
 */

const filePath = z
  .string()
  .min(1)
  .refine((p) => p !== 'src/proxy.ts', {
    message:
      "proxy.ts must be at root (Next 16 convention with app/ at root). " +
      "Use 'proxy.ts' instead of 'src/proxy.ts'.",
  })
  .refine((p) => p !== 'src/middleware.ts', {
    message:
      "middleware.ts (deprecated, use proxy.ts in Next 16+) must be at root. " +
      "Use 'middleware.ts' instead of 'src/middleware.ts'.",
  });

// zod 4 에서 z.function 의 .args/.returns 체이닝 API 가 제거됨.
// 함수 시그니처는 런타임에 의미 있게 검증할 수 없으므로 custom 으로 type 만 확인.
const wrapperFn = z
  .custom((val) => typeof val === "function", {
    message: "wrapExport must be a function (expr: string) => string",
  })
  .optional();

export const PluginSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, {
    message: 'Plugin name must be lowercase kebab-case (e.g., "auth-jwt")',
  }),
  label: z.string().min(1),
  description: z.string().min(1).optional(),
  priority: z.number().int().nonnegative(),

  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),

  imports: z.array(z.string()).optional(),
  wrapExport: wrapperFn,

  envVars: z.array(z.string()).optional(),
  turboEnvVars: z.array(z.string()).optional(),

  providerImports: z.array(z.string()).optional(),
  providerWrappers: z
    .array(
      z.union([
        z.object({ open: z.string(), close: z.string() }),
        z.string(),
      ]),
    )
    .optional(),

  files: z.record(filePath, z.string()).optional(),

  // 향후 확장 — moves, transforms, etc 는 nextIntl.js 에서 사용하므로 허용
  moves: z.array(z.any()).optional(),
  transforms: z.array(z.any()).optional(),
});

/**
 * 모든 플러그인을 검증. 실패 시 첫 번째 에러로 throw.
 */
export function validatePlugins(plugins) {
  for (const plugin of plugins) {
    const result = PluginSchema.safeParse(plugin);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(
        `Invalid plugin manifest "${plugin?.name ?? '(unknown)'}":\n${issues}`,
      );
    }
  }
}
