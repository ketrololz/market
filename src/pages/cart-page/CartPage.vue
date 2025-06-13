<script setup>
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import CartStep from './CartStep.vue';
import { Button } from 'primevue';
</script>

<template>
  <div
    class="flex flex-col justify-start gap-4 p-4 max-w-[1536px] mx-auto w-full max-sm:px-0"
  >
    <Stepper value="1" class="basis-[50rem]">
      <StepList>
        <Step value="1">Cart</Step>
        <Step value="2">Billing and Shipping Address</Step>
        <Step value="3">Shipping and Payment Method</Step>
        <Step value="4">Summary</Step>
      </StepList>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <CartStep />
          <div class="flex pt-6 justify-end">
            <Button
              label="Continue to Address"
              icon="pi pi-arrow-right"
              class="p-button"
              size="small"
              @click="activateCallback('2')"
            />
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="2">
          <div class="flex flex-col h-48">
            <div
              class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
            >
              Content II
            </div>
          </div>
          <div class="flex pt-6 justify-between">
            <Button
              label="Back to Cart"
              icon="pi pi-arrow-left"
              class="p-button"
              size="small"
              @click="activateCallback('1')"
            />
            <Button
              label="Continue to Payment"
              icon="pi pi-arrow-right"
              class="p-button"
              size="small"
              @click="activateCallback('3')"
            />
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="3">
          <div class="flex flex-col h-48">
            <div
              class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
            >
              Content III
            </div>
          </div>
          <div class="pt-6">
            <Button
              label="Back to Address"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback('2')"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
