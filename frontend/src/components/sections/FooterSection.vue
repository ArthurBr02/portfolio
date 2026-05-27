<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <span class="footer-credit">© {{ year }} {{ name }} — {{ $t('footer.rights') }}</span>
        <div class="footer-socials">
          <a v-if="email" :href="`mailto:${email}`" class="btn-icon" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 3h14v10H1V3z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M1 3l7 5 7-5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FooterSection',
  props: {
    name: { type: String, default: 'Portfolio' },
    email: { type: String, default: '' },
  },
  computed: {
    year(): number {
      return new Date().getFullYear();
    },
  },
});
</script>
