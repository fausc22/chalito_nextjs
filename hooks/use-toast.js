"use client";
// Inspired by react-hot-toast library
import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000
const DEFAULT_ICONS = {
  success: "✅",
  error: "✖️",
  info: "ℹ️",
  warning: "⚠️",
  loading: "⏳",
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString();
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

const listeners = []

let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function createToast({
  ...props
}) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    };
  }, [state])

  return {
    ...state,
    toast: baseToast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

const baseToast = (props) => createToast(props)

const mapMessageToToast = (message, options = {}) => ({
  title: options.title ?? message,
  description: options.description,
  duration: options.duration,
  icon: options.icon,
  ...options,
});

baseToast.success = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    icon: options.icon ?? DEFAULT_ICONS.success,
    variant: options.variant ?? "success",
    duration: options.duration ?? 3500,
  });

baseToast.error = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    icon: options.icon ?? DEFAULT_ICONS.error,
    variant: options.variant ?? "destructive",
    duration: options.duration ?? 4000,
  });

baseToast.info = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    icon: options.icon ?? DEFAULT_ICONS.info,
    variant: options.variant ?? "info",
  });

baseToast.warning = (message, options = {}) =>
  createToast({
    ...mapMessageToToast(message, options),
    icon: options.icon ?? DEFAULT_ICONS.warning,
    variant: options.variant ?? "warning",
  });

baseToast.loading = (message, options = {}) => {
  const result = createToast({
    ...mapMessageToToast(message, options),
    icon: options.icon ?? DEFAULT_ICONS.loading,
    duration: options.duration ?? 60000,
    variant: options.variant ?? "loading",
  });
  return result.id;
};

baseToast.dismiss = (toastId) => dispatch({ type: "DISMISS_TOAST", toastId });

export { useToast, baseToast as toast }
