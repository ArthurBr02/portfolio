<template>
  <div>
    <HeroSection v-if="settings.isSectionEnabled('hero')" :profile="profile" />

    <div v-if="settings.isSectionEnabled('about')" class="section-divider" />
    <AboutSection
      v-if="settings.isSectionEnabled('about')"
      :profile="profile"
      :project-count="projects.length"
      :experience-count="experiences.length"
      :experiences="experiences"
    />

    <div v-if="settings.isSectionEnabled('skills')" class="section-divider" />
    <SkillsSection
      v-if="settings.isSectionEnabled('skills')"
      :skills="skills"
      :locale="locale"
    />

    <div v-if="settings.isSectionEnabled('projects')" class="section-divider" />
    <ProjectsSection
      v-if="settings.isSectionEnabled('projects')"
      :projects="projects"
      :locale="locale"
    />

    <div v-if="expEduVisible" class="section-divider" />
    <ExperienceEducationSection
      v-if="expEduVisible"
      :experiences="experiences"
      :education="education"
      :show-exp="settings.isSectionEnabled('experience')"
      :show-edu="settings.isSectionEnabled('education')"
      :show-ue="settings.isSectionEnabled('education_ue')"
      :locale="locale"
    />

    <ContactSection
      v-if="settings.isSectionEnabled('contact')"
      :profile="profile"
    />

    <FooterSection :name="profile?.name || 'Portfolio'" :email="profile?.email || ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settings';
import { api } from '../../lib/api';
import { debounce } from '../../lib/utils';
import type { Profile, Project, Skill, Experience, Education } from '../../lib/types';

import HeroSection from '../../components/sections/HeroSection.vue';
import AboutSection from '../../components/sections/AboutSection.vue';
import SkillsSection from '../../components/sections/SkillsSection.vue';
import ProjectsSection from '../../components/sections/ProjectsSection.vue';
import ExperienceEducationSection from '../../components/sections/ExperienceEducationSection.vue';
import ContactSection from '../../components/sections/ContactSection.vue';
import FooterSection from '../../components/sections/FooterSection.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    HeroSection, AboutSection, SkillsSection, ProjectsSection,
    ExperienceEducationSection, ContactSection, FooterSection,
  },

  setup() {
    const settings = useSettingsStore();
    const { locale } = useI18n();
    return { settings, locale };
  },

  data() {
    return {
      profile: null as Profile | null,
      projects: [] as Project[],
      skills: [] as Skill[],
      experiences: [] as Experience[],
      education: [] as Education[],
    };
  },

  computed: {
    expEduVisible(): boolean {
      return this.settings.isSectionEnabled('experience') || this.settings.isSectionEnabled('education');
    },
  },

  async mounted() {
    const track = debounce(() => {
      api.post('/track', { path: '/', user_agent: navigator.userAgent }).catch(() => {});
    }, 500);
    track();

    const [profile, projects, skills, experiences, education] = await Promise.all([
      api.get<Profile>('/profile').catch(() => null),
      api.get<Project[]>('/projects').catch(() => []),
      api.get<Skill[]>('/skills').catch(() => []),
      api.get<Experience[]>('/experiences').catch(() => []),
      api.get<Education[]>('/education').catch(() => []),
    ]);

    this.profile = profile;
    this.projects = projects;
    this.skills = skills;
    this.experiences = experiences;
    this.education = education;
  },
});
</script>
