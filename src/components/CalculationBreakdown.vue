<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { BreakdownStep } from '../store/taxStore'

defineProps<{
  isOpen: boolean
  title: string
  steps: BreakdownStep[]
  finalNetto: number
  mesiParagone: number
}>()

defineEmits<{
  (e: 'close'): void
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

const getOperatorColorClass = (op?: string) => {
  if (op === '+') return 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/30'
  if (op === '-') return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30'
  if (op === '=') return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-[#e2af0d] border border-amber-200/50 dark:border-amber-700/30 font-bold'
  return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30'
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/60 dark:bg-gray-955/80 backdrop-blur-xs transition-opacity print:hidden" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              
              <!-- Header -->
              <div class="flex items-start justify-between border-b border-gray-150 dark:border-gray-705 pb-4 mb-4">
                <DialogTitle as="h3" class="text-xl font-bold leading-6 text-gray-900 dark:text-white flex items-center">
                  <span class="bg-blue-50 dark:bg-blue-950/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 mr-3 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </span>
                  Spaccato Dettagliato: {{ title }}
                </DialogTitle>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  @click="$emit('close')"
                >
                  <span class="sr-only">Close</span>
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body: Steps table -->
              <div class="mt-2 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div class="align-middle inline-block min-w-full">
                  <div class="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-xl">
                    <table class="min-w-full divide-y divide-gray-150 dark:divide-gray-700">
                      <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th scope="col" class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-12 text-center">Op</th>
                          <th scope="col" class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dettaglio Voce</th>
                          <th scope="col" class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-36">Importo</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                        <tr 
                          v-for="(step, idx) in steps" 
                          :key="idx"
                          :class="[
                            step.operator === '=' 
                              ? 'bg-amber-50/20 dark:bg-amber-950/10 font-medium' 
                              : ''
                          ]"
                        >
                          <!-- Operator Badge -->
                          <td class="px-3 py-3 whitespace-nowrap text-sm text-center">
                            <span 
                              v-if="step.operator"
                              class="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-full border shrink-0"
                              :class="getOperatorColorClass(step.operator)"
                            >
                              {{ step.operator }}
                            </span>
                            <span v-else class="text-gray-400 dark:text-gray-600">—</span>
                          </td>
                          <!-- Label & Description -->
                          <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
                            <div class="font-medium" :class="{'text-amber-800 dark:text-[#e2af0d]': step.operator === '='}">
                              {{ step.label }}
                            </div>
                            <div v-if="step.details" class="text-xs text-gray-550 dark:text-gray-400 mt-1 leading-normal italic font-normal">
                              {{ step.details }}
                            </div>
                          </td>
                          <!-- Value formatted -->
                          <td class="px-3 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900 dark:text-white" :class="{'font-bold text-amber-800 dark:text-[#e2af0d]': step.operator === '='}">
                            {{ formatCurrency(step.value) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Footer with Summary -->
              <div class="mt-6 pt-4 border-t border-gray-150 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Mensilizzazione stimata</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                    {{ formatCurrency(finalNetto / mesiParagone) }} <span class="text-xs font-normal text-gray-500 dark:text-gray-400">/ mese (su {{ mesiParagone }} mensilità)</span>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer w-full sm:w-auto"
                    @click="$emit('close')"
                  >
                    Ho Capito
                  </button>
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
