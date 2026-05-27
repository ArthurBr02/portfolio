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
import type { Profile, Experience } from '../../lib/types';

export default defineComponent({
  name: 'AboutSection',
  props: {
    profile: { type: Object as () => Profile | null, default: null },
    projectCount: { type: Number, default: 0 },
    experienceCount: { type: Number, default: 0 },
    experiences: { type: Array as () => Experience[], default: () => [] },
    locale: { type: String, default: 'fr' },
  },
  computed: {
    paragraphs(): string[] {
      const text = this.locale === 'en' ? (this.profile?.bio_en || this.profile?.bio) : this.profile?.bio;
      if (!text) return [];
      return text.split('\n').filter(Boolean);
    },
    yearsExp(): number {
      const dates = this.experiences
        .map(e => e.start_date)
        .filter(Boolean)
        .map(d => new Date(d!));
      if (!dates.length) return 0;
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      return Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365));
    },
  },
});
</script>
