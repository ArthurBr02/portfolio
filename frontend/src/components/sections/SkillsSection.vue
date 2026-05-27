<template>
  <section class="section" id="skills">
    <div class="container">
      <span class="eyebrow">{{ $t('skills.eyebrow') }}</span>
      <h2 class="h-section">{{ $t('skills.title') }}</h2>
      <div class="skills-grid">
        <div
          v-for="(group, cat) in groupedSkills"
          :key="cat"
          class="card skills-cat"
          :ref="el => registerRef(el, cat)"
        >
          <h3>{{ cat }}</h3>
          <p class="skills-cat-sub">{{ group.length }} {{ group.length > 1 ? 'compétences' : 'compétence' }}</p>
          <div v-for="skill in group" :key="skill.id" class="skill-row">
            <div class="skill-head">
              <span class="skill-name">{{ skill.name }}</span>
              <span>{{ skill.level }}%</span>
            </div>
            <div class="skill-bar">
              <div
                class="skill-bar-fill"
                :style="{ width: animatedIds.has(skill.id) ? `${skill.level}%` : '0%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Skill } from '../../lib/types';

export default defineComponent({
  name: 'SkillsSection',
  props: {
    skills: { type: Array as () => Skill[], default: () => [] },
    locale: { type: String, default: 'fr' },
  },

  data() {
    return {
      animatedIds: new Set<number>(),
      observers: [] as IntersectionObserver[],
      catRefs: {} as Record<string, Element>,
    };
  },

  computed: {
    groupedSkills(): Record<string, Skill[]> {
      const groups: Record<string, Skill[]> = {};
      for (const skill of this.skills) {
        const cat = (this.locale === 'en' ? skill.category_en : skill.category_fr) || 'Autres';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(skill);
      }
      return groups;
    },
  },

  mounted() {
    this.$nextTick(() => this.setupObservers());
  },

  beforeUnmount() {
    this.observers.forEach(o => o.disconnect());
  },

  methods: {
    registerRef(el: unknown, cat: string) {
      if (el instanceof Element) this.catRefs[cat] = el;
    },

    setupObservers() {
      for (const [cat, el] of Object.entries(this.catRefs)) {
        const obs = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                const group = this.groupedSkills[cat] || [];
                group.forEach(s => this.animatedIds.add(s.id));
                obs.disconnect();
              }
            }
          },
          { threshold: 0.3 }
        );
        obs.observe(el);
        this.observers.push(obs);
      }
    },
  },
});
</script>
