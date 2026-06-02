"use client";

import * as React from "react";
function cn(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
import {
  FormContext,
  FieldContext,
  SectionContext,
  StepContext,
  DisabledContext,
  useFormField,
} from "./context";
import type { FieldError, FieldValidate, ValidateOn } from "./types";
import { scopedPath } from "./utils";

// ─────────────────────────────────────────────
// FieldRenderProps — render prop 으로 노출되는 필드 API
// ─────────────────────────────────────────────

/**
 * <Form.Field name="x">{(field) => ...}</Form.Field> 의 `field` 객체.
 *
 * 값/상태 + 액션 + a11y 메타. 사용자는 `field.value` 읽고
 * `field.handleChange(next)` / `field.handleBlur()` 호출, 필요하면
 * `field.id` / `field.name` / `field.ariaInvalid` / `field.ariaDescribedBy`
 * 를 자체 input element 에 spread.
 *
 * `handleChange` 는 **next value 자체** 를 받는다 (event 객체 아님) — input,
 * select, checkbox, custom (color picker · emoji picker 등) 모두 같은 시그니처.
 * input 의 경우 사용자가 `onChange={(e) => field.handleChange(e.target.value)}`
 * 로 wire.
 */
export interface FieldRenderProps {
  // ── 값/상태 ──────────────────────────────
  value: unknown;
  errors: FieldError[];
  /** 첫 에러 (편의). 여러 에러면 errors 배열을 직접 사용. */
  error: FieldError | undefined;
  hasError: boolean;
  touched: boolean;
  isValidating: boolean;

  // ── 액션 ────────────────────────────────
  /** next value 자체를 받는다. event 객체 아님. */
  handleChange: (next: unknown) => void;
  handleBlur: () => void;

  // ── a11y / DOM 메타 ──────────────────────
  name: string;
  id: string;
  ariaInvalid: true | undefined;
  ariaDescribedBy: string | undefined;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  required: boolean | undefined;
}

// ─────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  validate?: FieldValidate;
  validateOn?: ValidateOn;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * children. 함수면 render prop 으로 호출되어 `field` API 노출 (TanStack /
   * RHF Controller 와 같은 패턴). 함수가 아니면 일반 children 으로 렌더 +
   * div wrap.
   *
   * 권장: render prop 통일 — 입력 종류 무관 동일 패턴.
   * 단순 input 한 칸도 `{(field) => <Input value={field.value} ... />}` 로.
   */
  children?: React.ReactNode | ((field: FieldRenderProps) => React.ReactNode);
}

export function Field({
  name,
  validate,
  validateOn,
  required,
  disabled,
  readOnly,
  className,
  children,
  ...rest
}: FieldProps) {
  const store = React.useContext(FormContext);
  if (!store) throw new Error("<Form.Field> must be inside <Form>");

  const section = React.useContext(SectionContext);
  const step = React.useContext(StepContext);
  const formDisabled = React.useContext(DisabledContext);
  const path = scopedPath(section.path, name);

  const id = React.useId();
  const descId = `${id}-desc`;
  const errorId = `${id}-error`;

  React.useEffect(() => {
    return store.registerField(path, {
      validate,
      validateOn,
      stepId: step.id ?? undefined,
      sectionPath: section.path || undefined,
      required,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, path]);

  const effectiveDisabled = disabled || formDisabled;

  const ctxValue = React.useMemo(
    () => ({
      path,
      id,
      descId,
      errorId,
      disabled: effectiveDisabled,
      readOnly,
      required,
    }),
    [path, id, descId, errorId, effectiveDisabled, readOnly, required]
  );

  // children 이 함수면 render prop 패턴 — FieldContext 만 제공하고 wrap 없음.
  // 사용자가 JSX 모양 (label/input/error 배치, wrapper 등) 을 100% 결정.
  if (typeof children === "function") {
    return (
      <FieldContext.Provider value={ctxValue}>
        <FieldRenderBridge>
          {(field) =>
            (children as (f: FieldRenderProps) => React.ReactNode)(field)
          }
        </FieldRenderBridge>
      </FieldContext.Provider>
    );
  }

  // 일반 children — 기존 div wrap (cloneElement 기반 Form.Control 경로용).
  return (
    <FieldContext.Provider value={ctxValue}>
      <div
        className={`sh-ui-form-field${className ? ` ${className}` : ""}`}
        data-disabled={effectiveDisabled || undefined}
        data-readonly={readOnly || undefined}
        {...rest}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

// Render prop bridge — FieldContext 안에서 store/field state 를 읽어 `field`
// 객체 구성. 별도 컴포넌트로 분리하는 이유: store subscribe 가 hook 이라
// Field 본체에서 conditional 호출 불가 (Rules of Hooks).
function FieldRenderBridge({
  children,
}: {
  children: (field: FieldRenderProps) => React.ReactNode;
}) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) return null;
  const store = React.useContext(FormContext)!;
  const state = useFormField(ctx.path);

  const describedBy =
    cn(ctx.descId, state.hasError ? ctx.errorId : null) || undefined;

  const field: FieldRenderProps = {
    value: state.value,
    errors: state.errors,
    error: state.error,
    hasError: state.hasError,
    touched: state.touched,
    isValidating: state.isValidating,
    handleChange: (next) => {
      store.setFieldValue(ctx.path, next);
      if (store.getState().revalidateOnChange.has(ctx.path)) {
        void store.validateField(ctx.path);
      }
    },
    handleBlur: () => {
      store.setFieldTouched(ctx.path, true);
      void store.validateField(ctx.path);
    },
    name: ctx.path,
    id: ctx.id,
    ariaInvalid: state.hasError ? true : undefined,
    ariaDescribedBy: describedBy,
    disabled: ctx.disabled,
    readOnly: ctx.readOnly,
    required: ctx.required,
  };

  return <>{children(field)}</>;
}

// ─────────────────────────────────────────────
// Label
// ─────────────────────────────────────────────

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Label> must be inside <Form.Field>");
  return <label ref={ref} htmlFor={ctx.id} className={className} {...props} />;
});
FormLabel.displayName = "Form.Label";

// ─────────────────────────────────────────────
// Description
// ─────────────────────────────────────────────

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Description> must be inside <Form.Field>");
  return <p ref={ref} id={ctx.descId} className={className} {...props} />;
});
FormDescription.displayName = "Form.Description";

// ─────────────────────────────────────────────
// Error
// ─────────────────────────────────────────────

export interface FormErrorProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "children"> {
  children?:
    | React.ReactNode
    | ((err: { message: string; type?: string }) => React.ReactNode);
  matches?: string;
}

export function FormError({
  children,
  matches,
  className,
  ...rest
}: FormErrorProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Error> must be inside <Form.Field>");
  const field = useFormField(ctx.path);

  const err = field.error;
  if (!err) return null;
  if (matches && err.type !== matches) return null;

  const content =
    typeof children === "function"
      ? (children as (e: { message: string; type?: string }) => React.ReactNode)(err)
      : children ?? err.message;

  return (
    <p
      id={ctx.errorId}
      className={`sh-ui-form-error${className ? ` ${className}` : ""}`}
      role="alert"
      aria-live="polite"
      {...rest}
    >
      {content}
    </p>
  );
}

// ─────────────────────────────────────────────
// Control (DEPRECATED — render prop 사용 권장)
// ─────────────────────────────────────────────

export interface ControlProps {
  id: string;
  name: string;
  value?: unknown;
  checked?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onBlur: () => void;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export interface FormControlProps {
  children?: React.ReactElement;
  valueAs?: "value" | "checked";
  render?: (ctrl: ControlProps) => React.ReactElement;
}

/**
 * @deprecated v0.114+ 부터는 `<Form.Field>` 의 render prop 패턴을 권장한다.
 *
 *   // 권장 (TanStack / RHF Controller 와 같은 idiom):
 *   <Form.Field name="email">
 *     {(field) => (
 *       <Input
 *         value={field.value as string}
 *         onChange={(e) => field.handleChange(e.target.value)}
 *         onBlur={field.handleBlur}
 *       />
 *     )}
 *   </Form.Field>
 *
 * 본 Form.Control 은 cloneElement 패턴 잔존성 호환 — 자식 1개 제한, custom
 * value (event 객체 외) 미지원, 자식의 기존 onChange/onBlur 가 chain merge
 * 됨 (이전엔 override). 한 메이저 release 뒤 제거 예정.
 */
export function FormControl({
  children,
  valueAs = "value",
  render,
}: FormControlProps) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("<Form.Control> must be inside <Form.Field>");
  const store = React.useContext(FormContext)!;
  const field = useFormField(ctx.path);

  const describedBy =
    cn(ctx.descId, field.hasError ? ctx.errorId : null) || undefined;

  const baseCtrl: ControlProps = {
    id: ctx.id,
    name: ctx.path,
    onChange: (e) => {
      const target = e.target as HTMLInputElement;
      const next = valueAs === "checked" ? target.checked : target.value;
      store.setFieldValue(ctx.path, next);
      if (store.getState().revalidateOnChange.has(ctx.path)) {
        void store.validateField(ctx.path);
      }
    },
    onBlur: () => {
      store.setFieldTouched(ctx.path, true);
      void store.validateField(ctx.path);
    },
    "aria-describedby": describedBy,
    disabled: ctx.disabled,
    readOnly: ctx.readOnly,
    required: ctx.required,
  };

  if (field.hasError) baseCtrl["aria-invalid"] = true;
  if (ctx.required) baseCtrl["aria-required"] = true;

  if (valueAs === "checked") {
    baseCtrl.checked = Boolean(field.value);
  } else {
    baseCtrl.value = field.value ?? "";
  }

  if (render) return render(baseCtrl);
  if (!children) return null;
  const child = React.Children.only(children);

  // chain merge — 자식의 기존 onChange/onBlur 가 있으면 store sync 와 함께
  // 둘 다 호출 (이전 버전의 silent override 함정 fix).
  const childProps = (child.props ?? {}) as Partial<ControlProps> & {
    onChange?: ControlProps["onChange"];
    onBlur?: ControlProps["onBlur"];
  };

  const mergedCtrl: ControlProps = {
    ...baseCtrl,
    onChange: (e) => {
      baseCtrl.onChange(e);
      childProps.onChange?.(e);
    },
    onBlur: () => {
      baseCtrl.onBlur();
      childProps.onBlur?.();
    },
  };

  return React.cloneElement(
    child,
    mergedCtrl as unknown as Record<string, unknown>
  );
}
