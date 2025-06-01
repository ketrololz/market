import type { BaseAddress } from '@commercetools/platform-sdk';

export interface CustomerAddressData extends BaseAddress {
  id?: string;
  isNew?: boolean;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}
