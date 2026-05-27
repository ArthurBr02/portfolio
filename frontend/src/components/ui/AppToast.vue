<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', type === 'error' ? 'toast-error' : '']">
        <svg v-if="type === 'success'" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 5v4M8 11v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppToast',
  props: {
    message: { type: String, default: '' },
    type: { type: String, default: 'success' },
    duration: { type: Number, default: 3000 },
  },
  emits: ['close'],
  data() {
    return { visible: false, timer: 0 };
  },
  watch: {
    message(val: string) {
      if (val) this.show();
    },
  },
  methods: {
    show() {
      this.visible = true;
      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.visible = false;
        this.$emit('close');
      }, this.duration);
    },
  },
});
</script>

<style scoped>
.toast-error { background: var(--color-error); }
.toast-enter-active, .toast-leave-active { transition: all 250ms ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
