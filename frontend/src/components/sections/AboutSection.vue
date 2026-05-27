<template>
  <section class="section" id="about">
    <div class="container">
      <span class="eyebrow">{{ $t('about.eyebrow') }}</span>
      <div class="about-grid">
        <div class="about-portrait">
          <img v-if="profile?.avatar_url" :src="profile.avatar_url" :alt="profile?.name || ''" />
        </div>
        <div class="about-body">
          <h2 class="h-section">{{ $t('about.title') }}</h2>
          <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
          <div class="about-stats">
            <div>
              <div class="about-stat-num">{{ projectCount }}+</div>
              <div class="about-stat-label">{{ $t('about.stats_projects') }}</div>
            </div>
            <div>
              <div class="about-stat-num">{{ yearsExp }}+</div>
              <div class="about-stat-label">{{ $t('about.stats_years') }}</div>
            </div>
            <div>
              <div class="about-stat-num">{{ experienceCount }}+</div>
              <div class="about-stat-label">{{ $t('about.stats_clients') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Profile } from '../../lib/types';

export default defineComponent({
  name: 'AboutSection',
  props: {
    profile: { type: Object as () => Profile | null, default: null },
    projectCount: { type: Number, default: 0 },
    experienceCount: { type: Number, default: 0 },
  },
  computed: {
    paragraphs(): string[] {
      if (!this.profile?.bio) return [];
      return this.profile.bio.split('\n').filter(Boolean);
    },
    yearsExp(): number {
      return this.experienceCount > 0 ? this.experienceCount + 1 : 1;
    },
  },
});
</script>
