<template>
  <footer
    class="flex flex-col items-center justify-center gap-y-3 pt-8 pb-10 bg-slate-900"
  >
    <div>
      <RouterLink to="/">
        <InlineSvg
          src="logo-inversion.svg"
          height="22"
          aria-label="logo"
          class="mb-5"
        >
        </InlineSvg>
      </RouterLink>
    </div>
    <p class="text-indigo-400 font-medium text-lg">Our Team</p>
    <ul class="flex gap-x-4">
      <li>
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/YaroshenkoAnna"
          class="text-white font-medium hover:text-indigo-400 transition duration-100 ease-in-out"
          >YaroshenkoAnna</a
        >
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/zilusion"
          class="text-white font-medium hover:text-indigo-400 transition duration-100 ease-in-out"
          >zilusion</a
        >
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/ketrololz"
          class="text-white font-medium hover:text-indigo-400 transition duration-100 ease-in-out"
          >ketrololz</a
        >
      </li>
    </ul>
    <p class="text-white text-sm">2025 RPG Heroes</p>
  </footer>
</template>

<script setup lang="ts">
import InlineSvg from 'vue-inline-svg';
import { RouterLink } from 'vue-router';
</script>
