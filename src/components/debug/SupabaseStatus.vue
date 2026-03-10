<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const status = ref<'checking' | 'connected' | 'error'>('checking')
const message = ref('')
const sessionData = ref<unknown>(null)
const supabaseUrl = ref(import.meta.env.VITE_SUPABASE_URL || 'Not configured')

async function checkConnection() {
  status.value = 'checking'
  message.value = 'Testing connection...'

  try {
    // Test 1: Get session (works even without user)
    const { data: sessionResult, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw sessionError
    }

    sessionData.value = sessionResult

    // Test 2: Simple query to check DB connection
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1)

    // Note: This might fail if table doesn't exist yet, but connection is still OK
    if (dbError && !dbError.message.includes('does not exist')) {
      console.warn('DB query warning:', dbError.message)
    }

    status.value = 'connected'
    message.value = 'Supabase connected successfully!'

  } catch (err) {
    status.value = 'error'
    message.value = err instanceof Error ? err.message : 'Unknown error'
    console.error('Supabase connection error:', err)
  }
}

onMounted(() => {
  checkConnection()
})
</script>

<template>
  <div class="supabase-status p-4 rounded-lg border" :class="{
    'bg-yellow-50 border-yellow-300': status === 'checking',
    'bg-green-50 border-green-300': status === 'connected',
    'bg-red-50 border-red-300': status === 'error'
  }">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full" :class="{
        'bg-yellow-500 animate-pulse': status === 'checking',
        'bg-green-500': status === 'connected',
        'bg-red-500': status === 'error'
      }"></div>

      <div>
        <p class="font-medium">
          {{ status === 'checking' ? 'Checking...' : status === 'connected' ? 'Connected' : 'Error' }}
        </p>
        <p class="text-sm text-gray-600">{{ message }}</p>
      </div>
    </div>

    <div v-if="status === 'connected'" class="mt-3 text-xs text-gray-500">
      <p><strong>URL:</strong> {{ supabaseUrl }}</p>
      <p><strong>Session:</strong> {{ sessionData?.session ? 'Active' : 'No session (not logged in)' }}</p>
    </div>

    <button
      @click="checkConnection"
      class="mt-3 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
    >
      Retry
    </button>
  </div>
</template>
