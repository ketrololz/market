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
    <h1 class="uppercase text-lg text-bold text-center">Order</h1>
    <Stepper value="1" class="basis-[50rem]">
      <StepList>
        <Step value="1"
          ><span class="pi pi-shopping-cart pr-2"></span
          ><span class="max-lg:hidden">Cart</span>
        </Step>
        <Step value="2" :disabled="true"
          ><span class="pi pi-id-card pr-2"></span
          ><span class="max-lg:hidden">Billing and Shipping Address</span></Step
        >
        <Step value="3" :disabled="true"
          ><span class="pi pi-credit-card pr-2"></span
          ><span class="max-lg:hidden">Shipping and Payment Method</span></Step
        >
        <Step value="4" :disabled="true"
          ><span class="pi pi-check pr-2"></span
          ><span class="max-lg:hidden">Summary</span></Step
        >
      </StepList>
      <StepPanels>
        <StepPanel value="1">
          <CartStep />
          <div class="flex pt-6 justify-end">
            <Button
              label="Continue to Address"
              icon="pi pi-arrow-right"
              class="p-button"
              size="small"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
