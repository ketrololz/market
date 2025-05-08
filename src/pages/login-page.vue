<script setup lang="ts">
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { loginSchema } from '../schemas/login-schema';
import BaseInput from './../components/form/BaseInput.vue';
import BasePassword from './../components/form/BasePassword.vue';
import Button from 'primevue/button';

const resolver = yupResolver(loginSchema);
</script>

<template>
  <Form>
    <BaseInput placeholder="Email" />
    <BasePassword placeholder="Password" />
    <Button label="Login" type="submit" />
  </Form>
</template>
