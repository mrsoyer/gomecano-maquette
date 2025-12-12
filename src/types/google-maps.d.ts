/**
 * Google Maps global types
 */

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

export {}
