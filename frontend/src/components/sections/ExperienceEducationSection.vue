<template>
  <section class="section" id="experience">
    <div class="container">
      <span class="eyebrow">{{ $t('experience.eyebrow') }}</span>
      <div :class="['exp-edu-grid', { 'single-col': !showExp || !showEdu }]">
        <div v-if="showExp">
          <h2 class="h-section">{{ $t('experience.title_exp') }}</h2>
          <div class="timeline">
            <div
              v-for="exp in experiences"
              :key="exp.id"
              :class="['timeline-item', { current: exp.current === 1 }]"
            >
              <div class="timeline-date">
                {{ formatDate(exp.start_date) }} — {{ exp.current ? $t('experience.present') : formatDate(exp.end_date) }}
              </div>
              <div class="timeline-title">{{ locale === 'en' ? exp.role_en : exp.role_fr }}</div>
              <div class="timeline-company">{{ exp.company }}</div>
              <div class="timeline-desc">{{ locale === 'en' ? exp.description_en : exp.description_fr }}</div>
            </div>
          </div>
        </div>

        <div v-if="showEdu">
          <h2 class="h-section">{{ $t('experience.title_edu') }}</h2>
          <div class="timeline">
            <div
              v-for="edu in education"
              :key="edu.id"
              class="timeline-item"
            >
              <div class="timeline-date">
                {{ formatDate(edu.start_date) }} — {{ formatDate(edu.end_date) }}
              </div>
              <div class="timeline-title">{{ locale === 'en' ? edu.degree_en : edu.degree_fr }}</div>
              <div class="timeline-company">{{ edu.school }}</div>
              <div class="timeline-desc">{{ locale === 'en' ? edu.description_en : edu.description_fr }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Experience, Education } from '../../lib/types';
import { formatDate as fmtDate } from '../../lib/utils';

export default defineComponent({
  name: 'ExperienceEducationSection',
  props: {
    experiences: { type: Array as () => Experience[], default: () => [] },
    education: { type: Array as () => Education[], default: () => [] },
    showExp: { type: Boolean, default: true },
    showEdu: { type: Boolean, default: true },
    locale: { type: String, default: 'fr' },
  },
  methods: {
    formatDate(d: string | null): string {
      return fmtDate(d, this.locale);
    },
  },
});
</script>

<style scoped>
.single-col { grid-template-columns: 1fr; }
</style>
