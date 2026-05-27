<template>
  <section class="hero" id="hero">
    <div class="hero-mesh" />
    <div class="hero-grid" />
    <div class="container">
      <div class="hero-content">
        <div class="hero-greeting">
          <span class="status-dot" />
          {{ $t('hero.greeting') }} — {{ profile?.name || 'Arthur' }}
        </div>

        <h1>
          <span>{{ profile?.title?.split(' ').slice(0, 2).join(' ') || 'Développeur' }}</span>
          <span><span class="accent">{{ profile?.title?.split(' ').slice(2).join(' ') || 'Fullstack' }}</span></span>
        </h1>

        <p class="hero-lede">{{ profile?.bio || '' }}</p>

        <div class="hero-cta">
          <a href="#projects" class="btn btn-primary">{{ $t('hero.cta_primary') }}</a>
          <a v-if="profile?.cv_url" :href="profile.cv_url" class="btn btn-ghost" download>
            {{ $t('hero.cta_secondary') }}
          </a>
        </div>

        <div class="hero-meta">
          <div class="hero-meta-item">
            <span class="hero-meta-label">{{ $t('hero.meta_availability') }}</span>
            <span class="hero-meta-val">{{ profile?.available_for_work ? $t('hero.meta_available') : $t('hero.meta_unavailable') }}</span>
          </div>
          <div v-if="profile?.location" class="hero-meta-item">
            <span class="hero-meta-label">Location</span>
            <span class="hero-meta-val">{{ profile.location }}</span>
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
  name: 'HeroSection',
  props: {
    profile: { type: Object as () => Profile | null, default: null },
  },
});
</script>
