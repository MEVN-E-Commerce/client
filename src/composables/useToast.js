import { ref } from 'vue';

let _id = 0;

// Singleton toast list — shared across the entire app
export const toasts = ref([]);

const add = (type, message, duration = 4500) => {
  const id = ++_id;
  toasts.value.push({ id, type, message, duration });
  setTimeout(() => remove(id), duration);
  return id;
};

const remove = (id) => {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx !== -1) toasts.value.splice(idx, 1);
};

/**
 * useToast — singleton composable, consumable anywhere in the app.
 * @example
 * const toast = useToast();
 * toast.success('Saved!');
 * toast.error('Something went wrong');
 */
export const useToast = () => ({
  success: (msg, duration) => add('success', msg, duration),
  error: (msg, duration) => add('error', msg, duration),
  warning: (msg, duration) => add('warning', msg, duration),
  info: (msg, duration) => add('info', msg, duration),
  remove
});
