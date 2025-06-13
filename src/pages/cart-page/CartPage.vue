<script setup>
import Panel from 'primevue/panel';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import CartStep from './CartStep.vue';
</script>

<template>
  <div
    class="flex flex-col justify-start gap-4 p-4 max-w-[1536px] mx-auto w-full max-sm:px-0"
  >
    <Panel
      header="My Order"
      pt:header:class="justify-self-center text-xl pb-0!"
      pt:root:class="pb-3 text-center"
    >
      <Stepper value="1" class="basis-[50rem]">
        <StepList>
          <Step value="1">Cart</Step>
          <Step value="2">Billing and Shipping Address</Step>
          <Step value="3">Shipping and Payment Method</Step>
          <Step value="4">Summary</Step>
        </StepList>
      </Stepper>
    </Panel>

    <CartStep />
  </div>
</template>
