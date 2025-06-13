<script setup>
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import Divider from 'primevue/divider';
import { onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';

const cartStore = useCartStore();
const router = useRouter();
const confirm = useConfirm();

const totalQuantity = computed(() => {
  return cartStore.cart?.lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
});

const totalPrice = computed(() => {
  return cartStore.cart?.totalPrice.centAmount / 100;
});

onMounted(async () => {
  await cartStore.loadCart();

  const productIds =
    cartStore.cart?.lineItems.map((item) => item.productId) ?? [];

  await Promise.all(
    productIds.map((id) => productCacheStore.getProductById(id)),
  );
});

function getPlayersText(item) {
  const min = item.variant.attributes?.find(
    (a) => a.name === 'players-min',
  )?.value;
  const max = item.variant.attributes?.find(
    (a) => a.name === 'players-max',
  )?.value;

  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `up to ${max}`;

  return null;
}

const cartItems = computed(() => {
  return (
    cartStore.cart?.lineItems.map((item) => {
      return {
        id: item.id,
        name: item.name.en,
        players: getPlayersText(item),
        age: item.variant.attributes?.find((a) => a.name === 'age-recommended')
          ?.value,
        playTime: item.variant.attributes?.find(
          (a) => a.name === 'playing-time-min',
        )?.value,
        publisher: item.variant.attributes?.find((a) => a.name === 'publisher')
          ?.value?.ru,
        quantity: item.quantity,
        originalUnitPrice: item.price.value.centAmount / 100,
        unitPrice:
          (item.price.discounted?.value.centAmount ??
            item.price.value.centAmount) / 100,
        discountedPrice: item.price.discounted?.value.centAmount !== undefined,
        hasDiscount: item.price.discounted?.value?.centAmount !== undefined,
        price: item.totalPrice.centAmount / 100,
        imageUrl: item.variant.images?.[0]?.url ?? '',
        productId: item.productId,
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

    await reloadCartAndProducts();
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

    await reloadCartAndProducts();
  } catch (err) {
    console.error('Failed to delete item', err);
  }
};

const reloadCartAndProducts = async () => {
  await cartStore.loadCart();
  const productIds = cartStore.cart?.lineItems.map((i) => i.productId) ?? [];
  await Promise.all(
    productIds.map((id) => productCacheStore.getProductById(id)),
  );
};

const showClearCartDialog = () => {
  confirm.require({
    message: 'Are you sure you want to clear the cart?',
    header: 'Clear Cart',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-sm',
    rejectClass: 'p-button-sm',
    rejectLabel: 'Cancel',
    acceptLabel: 'Clear Cart',
    rejectIcon: 'pi pi-times',
    acceptIcon: 'pi pi-check',
    accept: async () => {
      try {
        await cartStore.clearCart();
        await reloadCartAndProducts();
      } catch (err) {
        console.error('Failed to clear cart', err);
      }
    },
  });
};
</script>

<template>
  <div class="flex flex-col gap-4 max-w-[1536px] mx-auto w-full max-sm:px-0">
    <Panel pt:header:class="pb-0!">
      <p v-if="!cartItems.length">
        Your cart is currently empty. Check out our
        <RouterLink
          to="/catalog"
          class="underline text-(--p-primary-color) hover:text-indigo-700 active:text-indigo-800"
          >catalog</RouterLink
        >
        to get started!
      </p>
      <p v-else-if="totalPrice < 100">
        Add items for another {{ (100 - totalPrice).toFixed(2) }} € and receive
        free shipping
      </p>
      <p v-else>Your order ships free of charge</p>
    </Panel>

    <Panel v-if="cartItems.length > 0" pt:header:class="p-0!">
      <DataTable :value="cartItems" class="w-full">
        <Column field="item" header="Item" header-class="max-md:text-sm">
          <template #body="slotProps">
            <div
              class="block w-20 h-20 cursor-pointer hover:scale-105 transition duration-300 ease-in-out mx-auto max-sm:w-16 max-sm:h-16"
              @click="() => router.push(`/product/${slotProps.data.productId}`)"
            >
              <img
                :src="slotProps.data.imageUrl"
                alt="Product Image"
                class="object-contain h-full"
              />
            </div>
          </template>
        </Column>
        <Column
          field="description"
          header="Description"
          header-class="max-md:text-sm max-md:w-[160px] md:w-[250px] lg:w-[320px]"
        >
          <template #body="slotProps">
            <div class="flex">
              <div class="flex flex-col items-start text-left">
                <span
                  class="text-sm text-primary font-medium text-(--p-primary-color) cursor-pointer hover:underline text-ellipsis overflow-hidden"
                  style="
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    line-clamp: 1;
                    -webkit-box-orient: vertical;
                  "
                  @click="
                    () => router.push(`/product/${slotProps.data.productId}`)
                  "
                >
                  {{ slotProps.data.name }}
                </span>
                <span
                  v-if="slotProps.data.players"
                  class="text-xs text-gray-500"
                >
                  <strong>Number of players:</strong>
                  {{ slotProps.data.players }}
                </span>
                <span
                  v-if="
                    (slotProps.data.age !== undefined &&
                      slotProps.data.age !== '') ||
                    slotProps.data.age === 0
                  "
                  class="text-xs text-gray-500"
                >
                  <strong>Age:</strong> {{ slotProps.data.age }}<span>+</span>
                </span>
                <span
                  v-if="slotProps.data.playTime"
                  class="text-xs text-gray-500"
                >
                  <strong>Min. Playing Time:</strong>
                  {{ slotProps.data.playTime }}
                </span>
                <span class="text-xs text-gray-500">
                  <strong>Publisher:</strong> {{ slotProps.data.publisher }}
                </span>
              </div>
            </div>
          </template>
        </Column>
        <Column
          field="quantity"
          header="Quantity"
          header-class="max-md:text-sm max-sm:hidden"
          body-class="max-sm:hidden"
        >
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
              input-class="w-10 text-center !px-0 max-md:!text-xs"
              increment-button-class="!px-1 !w-6 max-md:!hidden"
              decrement-button-class="!px-1 !w-6 max-md:!hidden"
              @update:model-value="onQuantityChange(slotProps.data)"
            />
          </template>
        </Column>
        <Column
          header="Unit Price"
          header-class="max-md:text-sm max-sm:hidden"
          body-class="max-sm:hidden"
        >
          <template #body="slotProps">
            <div class="flex flex-col items-center text-sm max-md:text-xs">
              <span
                v-if="slotProps.data.hasDiscount"
                class="line-through text-xs text-gray-500 max-md:text-[10px]"
              >
                {{ slotProps.data.originalUnitPrice.toFixed(2) }} €
              </span>
              <span> {{ slotProps.data.unitPrice.toFixed(2) }} € </span>
            </div>
          </template>
        </Column>
        <Column
          header="Price"
          header-class="max-md:text-sm max-sm:hidden"
          body-class="max-sm:hidden"
        >
          <template #body="slotProps">
            <div class="text-center text-sm max-md:text-xs">
              {{ slotProps.data.price.toFixed(2) }} €
            </div>
          </template>
        </Column>

        <Column
          header=""
          header-class="hidden max-sm:table-cell max-sm:text-sm"
          body-class="hidden max-sm:table-cell"
        >
          <template #body="slotProps">
            <div class="flex flex-col gap-1 text-xs text-center">
              <div>
                <InputNumber
                  v-model="slotProps.data.quantity"
                  :step="1"
                  :min="1"
                  :max="100"
                  size="small"
                  allow-empty="false"
                  input-class="w-9 text-center !px-1 !py-0 !text-xs"
                  increment-button-class="!hidden"
                  decrement-button-class="!hidden"
                  @update:model-value="onQuantityChange(slotProps.data)"
                />
              </div>
              <div>
                <span class="flex flex-col justify-center items-center">
                  <span
                    v-if="slotProps.data.hasDiscount"
                    class="line-through text-gray-500 text-[10px] mr-1"
                    >{{ slotProps.data.originalUnitPrice.toFixed(2) }} €</span
                  >
                  <span>{{ slotProps.data.unitPrice.toFixed(2) }} €</span>
                </span>
              </div>
              <div>
                <span class="text-nowrap"
                  >{{ slotProps.data.price.toFixed(2) }} €</span
                >
              </div>
            </div>
            <div>
              <Button
                icon="pi pi-trash"
                class="p-button-rounded"
                size="small"
                :pt="{
                  root: { class: '!w-5 !h-5 !p-1' },
                  icon: { class: '!text-xs' },
                }"
                @click="onDelete(slotProps.data.id)"
              />
            </div>
          </template>
        </Column>

        <Column
          header=""
          header-class="max-md:text-sm max-sm:hidden"
          body-class="max-sm:hidden"
        >
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
      <Form class="flex gap-2 my-4" @submit.prevent="() => {}"
        ><InputText
          v-model="couponCode"
          placeholder="Enter Promo Code"
          class="w-1/2 max-w-[15rem]"
          size="small" />
        <Button label="Apply" class="w-1/2 max-w-[10rem]" size="small"
      /></Form>

      <div class="flex justify-between max-sm:text-sm">
        <span>Shopping Cart ( {{ totalQuantity }} Item )</span>
        <span>{{ totalPrice.toFixed(2) }} €</span>
      </div>
      <div class="flex justify-between max-sm:text-sm">
        <span>Discount with Promocode</span>
        <span> 0 €</span>
      </div>
      <Divider />
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span> {{ totalPrice.toFixed(2) }} €</span>
      </div>
      <Divider />
      <div class="flex justify-between mt-4">
        <ConfirmDialog></ConfirmDialog>
        <Button
          label="Clear Cart"
          icon="pi pi-trash"
          class="p-button-outlined"
          size="small"
          @click="showClearCartDialog()"
        />
        <Button
          label="Continue to Address"
          icon="pi pi-arrow-right"
          class="p-button"
          size="small"
          @click="(event) => eventPreventDefault()"
        />
      </div>
    </Panel>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable-column-header-content) {
  justify-content: center;
}
::v-deep(.p-datatable-tbody > tr > td) {
  text-align: center;
  padding: 0.75rem 0.3rem;
}
</style>
