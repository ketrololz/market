import type { BaseAddress } from '@commercetools/platform-sdk';

export interface CustomerAddressData extends BaseAddress {
  id?: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
  type?: 'shipping' | 'billing';
}
