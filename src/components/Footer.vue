<template>
  <footer class="bg-gray-900 dark:bg-black text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div class="flex items-center space-x-3 mb-4">
            <img src="/logo.svg" alt="MetaDoc" class="h-8 w-8" />
            <span class="text-xl font-bold text-white">MetaDoc</span>
          </div>
          <p class="text-gray-400">
            {{ $t('footer.description') }}
          </p>
        </div>
        
        <div>
          <h4 class="text-white font-semibold mb-4">{{ $t('footer.links.github') }}</h4>
          <ul class="space-y-2">
            <li>
              <a
                href="https://github.com/JaredYe04/MetaDoc-Releases"
                target="_blank"
                class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <img :src="githubWhite" alt="GitHub" class="w-5 h-5" />
                <span>GitHub Repository</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/JaredYe04/MetaDoc-Releases/tags"
                target="_blank"
                class="text-gray-400 hover:text-white transition-colors"
              >
                Releases & Tags
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-white font-semibold mb-4">{{ $t('footer.links.steam') }}</h4>
          <p class="text-gray-400">
            {{ $t('download.comingSoon') }}
          </p>
        </div>
      </div>
      
      <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import githubWhite from '@icons/github-white.svg'
</script>

