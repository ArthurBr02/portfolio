<template>
  <button
    :class="['btn', variantClass, sizeClass, { 'btn-icon': icon }]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppButton',
  inheritAttrs: false,
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    icon: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    variantClass(): string {
      return `btn-${this.variant}`;
    },
    sizeClass(): string {
      return this.size === 'sm' ? 'btn-sm' : '';
    },
  },
});
</script>
