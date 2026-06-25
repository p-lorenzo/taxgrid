<template>
  <footer class="mt-16 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-12 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 print:hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Grid layout for main content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        <!-- Left Side: Credits & Socials -->
        <div class="space-y-4 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-2">
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-[#e2af0d] dark:from-blue-400 dark:via-blue-300 dark:to-[#e2af0d]">
              TaxGrid
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium border border-blue-200/50 dark:border-blue-700/30">
              Normativa 2025
            </span>
          </div>
          <p class="text-gray-500 dark:text-gray-400">
            Realizzato con ❤️ da <span class="font-semibold text-gray-800 dark:text-gray-200">Lorenzo Pesce</span>.
          </p>

          <a
            href="https://ko-fi.com/lorenzopesce"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#e2af0d]/40 bg-[#fff7d6] px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:border-[#e2af0d] hover:bg-[#ffeaa3] hover:shadow-md dark:border-[#e2af0d]/50 dark:bg-[#2f2711] dark:text-[#fff4c2] dark:hover:bg-[#3d320f]"
            aria-label="Offri un caffè a Lorenzo Pesce su Ko-fi"
          >
            <span class="text-lg" aria-hidden="true">☕</span>
            <span>Buy me a coffee su Ko-fi</span>
            <span class="text-base" aria-hidden="true">💛</span>
          </a>
          
          <!-- Social Icons / Links -->
          <div class="flex items-center justify-center md:justify-start space-x-4 pt-1">
            <a 
              href="https://github.com/p-lorenzo/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#e2af0d] transition-colors duration-250 group"
              aria-label="GitHub Profile"
            >
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium border-b border-transparent group-hover:border-blue-600 dark:group-hover:border-[#e2af0d]">GitHub</span>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/p-lorenzo/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#e2af0d] transition-colors duration-250 group"
              aria-label="LinkedIn Profile"
            >
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium border-b border-transparent group-hover:border-blue-600 dark:group-hover:border-[#e2af0d]">LinkedIn</span>
            </a>
          </div>
        </div>
        
        <!-- Right Side: Open Source Repo & Contributions -->
        <div class="space-y-4 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-2">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
              Progetto Open Source
            </span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 max-w-md">
            TaxGrid è gratuito e open source. Puoi esplorare il codice sorgente, proporre nuove feature o segnalare eventuali incongruenze nei calcoli per renderlo sempre migliore.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <a 
              href="https://github.com/p-lorenzo/taxgrid/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" />
              </svg>
              Repository GitHub
            </a>
            
            <a 
              href="https://github.com/p-lorenzo/taxgrid/issues" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors w-full sm:w-auto"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Apri una Issue
            </a>
          </div>
        </div>
      </div>
      
      <!-- Bottom Side: Legal Disclaimer -->
      <div class="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-4xl mx-auto leading-relaxed">
          <span class="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[9px] block mb-1">Disclaimer Legale</span>
          TaxGrid è un simulatore orientativo non ufficiale. Le aliquote, le soglie, i massimali contributivi e gli scaglioni IRPEF fanno riferimento alla normativa vigente per l'anno fiscale 2025. I calcoli generati sono stime matematiche semplificate e non costituiscono in alcun modo consulenza fiscale, legale o finanziaria. Per qualsiasi decisione o adempimento finanziario, rivolgiti sempre a un commercialista iscritto all'albo o a un professionista abilitato.
        </p>
      </div>
    </div>
  </footer>
</template>
