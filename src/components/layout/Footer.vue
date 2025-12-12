<script setup lang="ts">
const currentYear = new Date().getFullYear()

const sections = [
  {
    title: 'Services',
    links: [
      { label: 'Vidange', to: '/services/vidange' },
      { label: 'Freinage', to: '/services/freinage' },
      { label: 'Pneus', to: '/services/pneus' },
      { label: 'Tous les services', to: '/services' },
    ]
  },
  {
    title: 'Gomecano',
    links: [
      { label: 'À propos', to: '/a-propos' },
      { label: 'Entreprises', to: '/entreprises' },
      { label: 'Devenir mécanicien', to: '/devenir-mecanicien' },
      { label: 'Contact', to: '/contact' },
    ]
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'CGU', to: '/cgu' },
      { label: 'CGV', to: '/cgv' },
      { label: 'Confidentialité', to: '/confidentialite' },
    ]
  },
]

const socials = [
  { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z' },
  { name: 'Twitter', icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
]
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="container-custom py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <h3 class="text-white text-2xl font-bold mb-4">Gomecano</h3>
          <p class="text-sm mb-4">
            Réparation automobile à domicile. Simple, rapide, fiable.
          </p>
          <!-- Social Links -->
          <div class="flex gap-4">
            <a
              v-for="social in socials"
              :key="social.name"
              href="#"
              :aria-label="social.name"
              class="hover:text-white transition-colors"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Links Sections -->
        <div v-for="section in sections" :key="section.title">
          <h4 class="text-white font-semibold mb-4">{{ section.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-sm hover:text-white transition-colors"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm">
          © {{ currentYear }} Gomecano. Tous droits réservés.
        </p>
        <p class="text-sm mt-4 md:mt-0">
          Fait avec ❤️ en France
        </p>
      </div>
    </div>
  </footer>
</template>






