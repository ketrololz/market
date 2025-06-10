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
import { onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/ cartStore';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import { useProductCacheStore } from '@/stores/productCacheStore';

const cartStore = useCartStore();
const productCacheStore = useProductCacheStore();

onMounted(async () => {
  await cartStore.loadCart();

  const productIds =
    cartStore.cart?.lineItems.map((item) => item.productId) ?? [];

  await Promise.all(
    productIds.map((id) => productCacheStore.getProductById(id)),
  );
});

const cartItems = computed(() => {
  return (
    cartStore.cart?.lineItems.map((item) => {
      return {
        id: item.id,
        name: item.name.en,
        players: `${
          item.variant.attributes?.find((a) => a.name === 'players-min')?.value
        } - ${
          item.variant.attributes?.find((a) => a.name === 'players-max')?.value
        }`,
        age: `${
          item.variant.attributes?.find((a) => a.name === 'age-recommended')
            ?.value
        }+`,
        playTime: item.variant.attributes?.find(
          (a) => a.name === 'playing-time-min',
        )?.value,
        publisher: item.variant.attributes?.find((a) => a.name === 'publisher')
          ?.value?.ru,
        quantity: item.quantity,
        unitPrice: item.price.value.centAmount / 100,
        price: item.totalPrice.centAmount / 100,
        imageUrl: item.variant.images?.[0]?.url ?? '',
        productId: item.productId,
        description:
          productCacheStore.getProductDescriptionSync?.(item.productId, 'en') ??
          '',
      };
    }) ?? []
  );
});
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

  <Panel pt:header:class="pb-0!">
    <DataTable :value="cartItems" class="w-full">
      <Column field="item" header="Item">
        <template #body="slotProps">
          <a
            :href="`/product/${slotProps.data.productId}`"
            target="_blank"
            class="block w-20 h-20"
          >
            <img
              :src="slotProps.data.imageUrl"
              alt="Product Image"
              class="object-contain w-full h-full"
            />
          </a>
        </template>
      </Column>
      <Column field="description" header="Description">
        <template #body="slotProps">
          <div class="flex flex-col">
            <span
              class="text-sm text-primary font-medium text-(--p-primary-color)"
            >
              {{ slotProps.data.name }}
            </span>
            <span class="text-xs text-gray-500">
              <strong>Number of players:</strong> {{ slotProps.data.players }}
            </span>
            <span class="text-xs text-gray-500">
              <strong>Age:</strong> {{ slotProps.data.age }}
            </span>
            <span class="text-xs text-gray-500">
              <strong>Min. Playing Time:</strong> {{ slotProps.data.playTime }}
            </span>
            <span class="text-xs text-gray-500">
              <strong>Publisher:</strong> {{ slotProps.data.publisher }}
            </span>

            <Accordion value="0" unstyled="true">
              <AccordionPanel value="1">
                <AccordionHeader>
                  <strong class="text-xs text-gray-500">Details</strong>
                </AccordionHeader>
                <AccordionContent>
                  <p class="text-xs text-gray-500">
                    {{ slotProps.data.description }}
                  </p>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </template>
      </Column>
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

<style scoped>
.p-accordionheader {
  display: flex;
  gap: 0.5rem;
}
</style>
