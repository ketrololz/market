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
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const productCacheStore = useProductCacheStore();
const router = useRouter();

const navigate = (path) => {
  router.push(path);
};

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

const onQuantityChange = async (item) => {
  try {
    await cartStore.updateCart([
      {
        action: 'changeLineItemQuantity',
        lineItemId: item.id,
        quantity: item.quantity,
      },
    ]);

    // optionally: reload cart and product info
    await cartStore.loadCart();
    const productIds = cartStore.cart?.lineItems.map((i) => i.productId) ?? [];
    await Promise.all(
      productIds.map((id) => productCacheStore.getProductById(id)),
    );
  } catch (err) {
    console.error('Failed to update quantity', err);
  }
};

const onDelete = async (lineItemId) => {
  try {
    await cartStore.updateCart([
      {
        action: 'removeLineItem',
        lineItemId: lineItemId,
      },
    ]);

    // optionally: reload cart and product info
    await cartStore.loadCart();
    const productIds = cartStore.cart?.lineItems.map((i) => i.productId) ?? [];
    await Promise.all(
      productIds.map((id) => productCacheStore.getProductById(id)),
    );
  } catch (err) {
    console.error('Failed to delete item', err);
  }
};
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
          <div
            class="block w-20 h-20 cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
            @click="navigate(`/product/${slotProps.data.productId}`)"
          >
            <img
              :src="slotProps.data.imageUrl"
              alt="Product Image"
              class="object-contain w-full h-full"
            />
          </div>
        </template>
      </Column>
      <Column field="description" header="Description">
        <template #body="slotProps">
          <div class="flex flex-col">
            <span
              class="text-sm text-primary font-medium text-(--p-primary-color) cursor-pointer hover:underline"
              @click="navigate(`/product/${slotProps.data.productId}`)"
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
            size="small"
            allow-empty="false"
            input-class="w-10 text-center !px-0"
            increment-button-class="!px-1 !w-6"
            decrement-button-class="!px-1 !w-6"
            @update:model-value="onQuantityChange(slotProps.data)"
          />
        </template>
      </Column>
      <Column field="unitPrice" header="Unit Price" />
      <Column field="price" header="Price" />
      <Column field="delete" header="">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            class="p-button-rounded"
            size="small"
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

<style scoped>
.p-accordionheader {
  display: flex;
  gap: 0.5rem;
}
</style>
