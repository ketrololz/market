<script setup>
import Panel from 'primevue/panel';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import Divider from 'primevue/divider';
</script>

<template>
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
  <Panel pt:header:class="pb-0!">
    <p>Your order ships free of charge</p>
    <!-- <p>Your basket is empty. </p>
 <p>Add items for another 50 € and receive free shipping </p> -->
  </Panel>
  <Panel>
    <table class="w-full">
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit price</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr class="text-center">
          <td><img src="" alt="" /></td>
          <td class="flex flex-col">
            <span class="text-sm text-(--p-primary-color)">Product Name</span>
            <span class="text-xs text-gray-500"
              ><strong>Number of players:</strong> 2-4
            </span>
            <span class="text-xs text-gray-500"><strong>Age:</strong> 8+ </span>
            <span class="text-xs text-gray-500"
              ><strong>Min. Playing Time:</strong> 60 min</span
            >
            <span class="text-xs text-gray-500"
              ><strong>Publisher:</strong> Hobby World
            </span>
          </td>
          <td>1</td>
          <td>$10.00</td>
          <td>$10.00</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </Panel>
  <Panel pt:header:class="pb-0!">
    <DataTable
      :value="[]"
      class="w-full"
      pt:root:class="!border-0 !shadow-none"
      pt:header:class="!border-0 !shadow-none"
      pt:body:class="!border-0 !shadow-none"
    >
      <Column field="name" header="Name" />
      <Column field="description" header="Description" />
      <Column field="quantity" header="Quantity">
        <template #body="slotProps">
          <InputNumber
            v-model="slotProps.data.quantity"
            show-buttons
            button-layout="horizontal"
            :step="1"
            :min="1"
            :max="100"
            class="w-20"
          />
        </template>
      </Column>
      <Column field="unitPrice" header="Unit Price" />
      <Column field="price" header="Price" />
      <Column field="delete" header="">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            class="p-button-danger p-button-rounded p-button-sm"
            @click="onDelete(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>
    <Form class="flex gap-2"
      ><InputText
        v-model="couponCode"
        placeholder="Enter Promo Code"
        class="w-1/2 max-w-[15rem]"
        size="small" />
      <Button label="Apply" class="w-1/2 max-w-[10rem]" size="small"
    /></Form>

    <div class="flex justify-between">
      <span>Shopping Cart (2 Item )</span> <span>24,98 €</span>
    </div>
    <div class="flex justify-between">
      <span>Discount with Promocode</span>
      <span> -4,98 €</span>
    </div>
    <Divider />
    <div class="flex justify-between">
      <span>Total</span>
      <span> 20 €</span>
    </div>
  </Panel>
</template>
