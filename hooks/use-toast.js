"use client";

import { toast as sonnerToast } from "sonner";
import { CircleAlert, CircleCheck, Info, LoaderCircle } from "lucide-react";

let toastCounter = 0;

function createToastId() {
  toastCounter = (toastCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `chalito-toast-${toastCounter}`;
}

const TOAST_STYLES = {
  success: {
    icon: CircleCheck,
    iconClassName: "text-emerald-700",
    iconWrapperClassName: "bg-emerald-200 ring-1 ring-emerald-300",
    containerClassName: "border-emerald-300 bg-emerald-100",
    titleClassName: "text-emerald-950",
    descriptionClassName: "text-emerald-900",
    closeButtonClassName: "text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900",
    actionClassName:
      "border-emerald-300 bg-emerald-200 text-emerald-900 hover:bg-emerald-300 focus-visible:ring-emerald-500",
  },
  error: {
    icon: CircleAlert,
    iconClassName: "text-rose-700",
    iconWrapperClassName: "bg-rose-200 ring-1 ring-rose-300",
    containerClassName: "border-rose-300 bg-rose-100",
    titleClassName: "text-rose-950",
    descriptionClassName: "text-rose-900",
    closeButtonClassName: "text-rose-700 hover:bg-rose-200 hover:text-rose-900",
    actionClassName:
      "border-rose-300 bg-rose-200 text-rose-900 hover:bg-rose-300 focus-visible:ring-rose-500",
  },
  warning: {
    icon: CircleAlert,
    iconClassName: "text-amber-700",
    iconWrapperClassName: "bg-amber-200 ring-1 ring-amber-300",
    containerClassName: "border-amber-300 bg-amber-100",
    titleClassName: "text-amber-950",
    descriptionClassName: "text-amber-900",
    closeButtonClassName: "text-amber-700 hover:bg-amber-200 hover:text-amber-900",
    actionClassName:
      "border-amber-300 bg-amber-200 text-amber-900 hover:bg-amber-300 focus-visible:ring-amber-500",
  },
  info: {
    icon: Info,
    iconClassName: "text-sky-700",
    iconWrapperClassName: "bg-sky-200 ring-1 ring-sky-300",
    containerClassName: "border-sky-300 bg-sky-100",
    titleClassName: "text-sky-950",
    descriptionClassName: "text-sky-900",
    closeButtonClassName: "text-sky-700 hover:bg-sky-200 hover:text-sky-900",
    actionClassName:
      "border-sky-300 bg-sky-200 text-sky-900 hover:bg-sky-300 focus-visible:ring-sky-500",
  },
  loading: {
    icon: LoaderCircle,
    iconClassName: "text-slate-700",
    iconWrapperClassName: "bg-slate-200 ring-1 ring-slate-300",
    containerClassName: "border-slate-300 bg-slate-100",
    titleClassName: "text-slate-900",
    descriptionClassName: "text-slate-800",
    closeButtonClassName: "text-slate-700 hover:bg-slate-200 hover:text-slate-900",
    actionClassName:
      "border-slate-300 bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-500",
  },
};

function resolveType(variant) {
  switch (variant) {
    case "destructive":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
    case "loading":
      return "loading";
    case "success":
    case "default":
    default:
      return "success";
  }
}

function ToastBody({
  title,
  description,
  icon,
  action,
  type,
  onDismiss,
}) {
  const style = TOAST_STYLES[type] ?? TOAST_STYLES.info;
  const Icon = style.icon;
  const resolvedIcon = icon ?? <Icon className={`h-5 w-5 ${style.iconClassName}${type === "loading" ? " animate-spin" : ""}`} />;

  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl border p-4 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.35)] ${style.containerClassName}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrapperClassName}`}>
          {typeof resolvedIcon === "string" ? <span className="text-base">{resolvedIcon}</span> : resolvedIcon}
        </div>
        <div className="min-w-0 flex-1">
          {title ? <div className={`text-sm font-semibold ${style.titleClassName}`}>{title}</div> : null}
          {description ? (
            <div className={`mt-1 text-sm leading-5 ${style.descriptionClassName}`}>
              {description}
            </div>
          ) : null}
          {action ? (
            <div className="mt-3 flex items-center gap-2">
              {action}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDismiss();
          }}
          className={`rounded-lg p-1.5 transition ${style.closeButtonClassName}`}
          aria-label="Cerrar notificacion"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function renderToast(type, input) {
  const {
    title,
    description,
    duration,
    action,
    icon,
    id,
  } = input;

  return sonnerToast.custom(
    () => (
      <ToastBody
        title={title}
        description={description}
        action={action}
        icon={icon}
        type={type}
        onDismiss={() => sonnerToast.dismiss(id)}
      />
    ),
    {
      id,
      duration,
      className: `chalito-toast-shell chalito-toast-shell--${type}`,
    }
  );
}

function createToast(input = {}) {
  const type = resolveType(input.variant);
  const toastId = input.id ?? createToastId();
  const toastInput = {
    title: input.title,
    description: input.description,
    duration: input.duration,
    action: input.action,
    icon: input.icon,
    id: toastId,
  };

  renderToast(type, toastInput);

  return {
    id: toastId,
    dismiss: () => sonnerToast.dismiss(toastId),
    update: (nextInput = {}) => {
      sonnerToast.dismiss(toastId);
      return createToast({
        ...input,
        ...nextInput,
        id: toastId,
      });
    },
  };
}

function mapMessageToToast(message, options = {}) {
  return {
    title: options.title ?? message,
    description: options.description,
    duration: options.duration,
    icon: options.icon,
    action: options.action,
    variant: options.variant,
    id: options.id,
  };
}

const baseToast = (props) => createToast(props);

export const showSuccessToast = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    variant: "success",
  });

export const showErrorToast = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    variant: "destructive",
  });

export const showInfoToast = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    variant: "info",
  });

export const showWarningToast = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    variant: "warning",
  });

export const showLoadingToast = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    variant: "loading",
    duration: options.duration ?? Infinity,
  }).id;

baseToast.success = showSuccessToast;
baseToast.error = showErrorToast;
baseToast.info = showInfoToast;
baseToast.warning = showWarningToast;
baseToast.loading = showLoadingToast;
baseToast.dismiss = (toastId) => sonnerToast.dismiss(toastId);

function useToast() {
  return {
    toasts: [],
    toast: baseToast,
    dismiss: baseToast.dismiss,
  };
}

export { useToast, baseToast as toast };
