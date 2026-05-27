<template>
  <button
    type="button"
    :class="['toggle', { on: modelValue }]"
    :aria-checked="modelValue"
    role="switch"
    @click="$emit('update:modelValue', !modelValue)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppToggle',
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue'],
});
</script>
