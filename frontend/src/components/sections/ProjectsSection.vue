<template>
  <section class="section" id="projects">
    <div class="container">
      <div class="projects-head">
        <div>
          <span class="eyebrow">{{ $t('projects.eyebrow') }}</span>
          <h2 class="h-section" style="margin-bottom: 0">{{ $t('projects.title') }}</h2>
        </div>
        <div class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['filter-tab', { active: activeFilter === tab.value }]"
            @click="activeFilter = tab.value"
          >{{ tab.label }}</button>
        </div>
      </div>

      <div class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="card card-hover project-card"
          @click="selectedProject = project"
        >
          <div class="project-thumb">
            <img v-if="project.image_url" :src="project.image_url" :alt="title(project)" />
            <span class="project-thumb-tag">{{ project.category || 'web' }}</span>
          </div>
          <div class="project-body">
            <h3>{{ title(project) }}</h3>
            <p>{{ shortDesc(project) }}</p>
            <div class="project-techs">
              <span v-for="tech in techs(project)" :key="tech" class="project-tech">{{ tech }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProjectModal
      v-if="selectedProject"
      :project="selectedProject"
      :locale="locale"
      @close="selectedProject = null"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Project } from '../../lib/types';
import { parseTechnologies } from '../../lib/utils';
import ProjectModal from '../ProjectModal.vue';

export default defineComponent({
  name: 'ProjectsSection',
  components: { ProjectModal },
  props: {
    projects: { type: Array as () => Project[], default: () => [] },
    locale: { type: String, default: 'fr' },
  },

  data() {
    return {
      activeFilter: 'all',
      selectedProject: null as Project | null,
    };
  },

  computed: {
    tabs() {
      return [
        { value: 'all',    label: this.$t('projects.filter_all') },
        { value: 'web',    label: this.$t('projects.filter_web') },
        { value: 'mobile', label: this.$t('projects.filter_mobile') },
        { value: 'tools',  label: this.$t('projects.filter_tools') },
      ];
    },
    filteredProjects(): Project[] {
      if (this.activeFilter === 'all') return this.projects;
      return this.projects.filter(p => p.category === this.activeFilter);
    },
  },

  methods: {
    title(p: Project): string {
      return (this.locale === 'en' ? p.title_en : p.title_fr) || p.title_fr || '';
    },
    shortDesc(p: Project): string {
      return (this.locale === 'en' ? p.short_description_en : p.short_description_fr) || '';
    },
    techs(p: Project): string[] {
      return parseTechnologies(p.technologies).slice(0, 4);
    },
  },
});
</script>
