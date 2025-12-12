<script setup lang="ts">
interface NavLink {
  label: string
  to: string
}

const navLinks: NavLink[] = [
  { label: 'Services', to: '/services' },
  { label: 'Entreprises', to: '/entreprises' },
  { label: 'Devenir mécanicien', to: '/devenir-mecanicien' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
]
</script>

<template>
  <nav class="flex items-center gap-2 lg:gap-3" aria-label="Navigation principale">
    <RouterLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="nav-link"
      active-class="nav-link-active"
    >
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.nav-link {
  /* Touch targets 44x44px minimum sur mobile */
  @apply relative text-gray-700 font-medium text-xs lg:text-sm transition-all duration-300;
  @apply hover:text-blue-primary focus:text-blue-primary;
  @apply focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2 rounded-md;
  @apply px-2 py-3 lg:px-1 lg:py-1;
  white-space: nowrap;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Underline animé au hover : Desktop uniquement */
.nav-link::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #2f6883, #29c99e);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
}

/* Underline uniquement sur hover desktop (pas touch) */
@media (hover: hover) {
  .nav-link:hover::before {
    width: 100%;
  }
}

/* Active state */
.nav-link-active {
  @apply text-blue-primary font-semibold;
}

.nav-link-active::before {
  width: 100%;
}

/* Animation d'entrée */
.nav-link {
  animation: fadeInNav 0.5s ease-in-out backwards;
}

.nav-link:nth-child(1) { animation-delay: 0.05s; }
.nav-link:nth-child(2) { animation-delay: 0.1s; }
.nav-link:nth-child(3) { animation-delay: 0.15s; }
.nav-link:nth-child(4) { animation-delay: 0.2s; }
.nav-link:nth-child(5) { animation-delay: 0.25s; }

@keyframes fadeInNav {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

