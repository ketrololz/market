<script setup lang="ts">
import { Panel, Tag, Tabs, Tab, TabList, TabPanel, TabPanels } from 'primevue';
</script>

<template>
  <h1
    class="font-bold text-(--p-primary-color) text-center text-3xl md:text-4xl"
  >
    Our heroes
  </h1>
  <div class="flex gap-3 p-4 flex-col md:flex-row flex-wrap">
    <Panel class="flex-1 min-w-50 md:min-w-120">
      <template #header>
        <div class="flex flex-1 flex-col gap-y-2">
          <div class="flex gap-x-4">
            <img class="rounded-md w-18 h-18" src="/images/our-team/Anna.jpg" />
            <div class="flex flex-col gap-y-1">
              <h2 class="font-semibold text-(--p-primary-color) text-xl">
                Yaroshenko Anna
              </h2>
              <Tag
                icon="fa-solid fa-wand-sparkles"
                value="Validation Master"
                severity="success"
                pt:icon:class="mt-px mr-px"
              ></Tag>
            </div>
          </div>
        </div>
      </template>
      <Tabs value="0" scrollable class="max-w-[80vmin] md:max-w-full">
        <TabList>
          <Tab value="0"><i class="fa-solid fa-scroll mr-1"></i>Story</Tab>
          <Tab value="1"><i class="fa-solid fa-star mr-1"></i>Achievements</Tab>
          <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </TabPanel>
          <TabPanel value="1">
            <ul>
              <li class="mark">Login page</li>
              <li class="mark">Registration page</li>
              <li class="mark">Profile page</li>
              <li class="mark">Task board</li>
            </ul>
          </TabPanel>
          <TabPanel value="2">
            <ul>
              <li>
                <i
                  class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Panel>

    <Panel class="flex-1 min-w-50 md:min-w-120">
      <template #header>
        <div class="flex flex-1 flex-col gap-y-2">
          <div class="flex gap-x-4">
            <img
              class="rounded-md w-18 h-18"
              src="/images/our-team/Daniil.jpg"
            />
            <div class="flex flex-col gap-y-1">
              <h2 class="font-semibold text-(--p-primary-color) text-xl">
                Sudorgin Daniil
              </h2>
              <Tag
                icon="fa-solid fa-shield-halved"
                value="API Guardian"
                severity="info"
                pt:icon:class="mt-px mr-px"
              ></Tag>
            </div>
          </div>
        </div>
      </template>
      <Tabs value="0" scrollable class="max-w-[80vmin] md:max-w-full">
        <TabList>
          <Tab value="0"><i class="fa-solid fa-scroll mr-1"></i>Story</Tab>
          <Tab value="1"><i class="fa-solid fa-star mr-1"></i>Achievements</Tab>
          <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </TabPanel>
          <TabPanel value="1">
            <ul>
              <li class="mark">Feature 1</li>
              <li class="mark">Feature 2</li>
              <li class="mark">Feature 3</li>
              <li class="mark">Feature 4</li>
            </ul>
          </TabPanel>
          <TabPanel value="2">
            <ul>
              <li>
                <i
                  class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Panel>

    <Panel class="flex-1 min-w-50 md:min-w-120">
      <template #header>
        <div class="flex flex-1 flex-col gap-y-2">
          <div class="flex gap-x-4">
            <img
              class="rounded-md w-18 h-18"
              src="/images/our-team/Bogdan.jpg"
            />
            <div class="flex flex-col gap-y-1">
              <h2 class="font-semibold text-(--p-primary-color) text-xl">
                Nurgatin Bodgan
              </h2>
              <Tag
                icon="fa-solid fa-trophy"
                value="Party Leader"
                severity="warn"
                pt:icon:class="mt-px mr-px"
              ></Tag>
            </div>
          </div>
        </div>
      </template>
      <Tabs value="0" scrollable class="max-w-[80vmin] md:max-w-full">
        <TabList>
          <Tab value="0"><i class="fa-solid fa-scroll mr-1"></i>Story</Tab>
          <Tab value="1"><i class="fa-solid fa-star mr-1"></i>Achievements</Tab>
          <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </TabPanel>
          <TabPanel value="1">
            <ul>
              <li class="mark">Feature 1</li>
              <li class="mark">Feature 2</li>
              <li class="mark">Feature 3</li>
              <li class="mark">Feature 4</li>
            </ul>
          </TabPanel>
          <TabPanel value="2">
            <ul>
              <li>
                <i
                  class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
              <li>
                <i
                  class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                ></i
                ><span class="ml-2">Username</span>
              </li>
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Panel>
  </div>
</template>

<style scoped>
.mark {
  position: relative;
  margin-left: 12px;
}

.mark::before {
  position: absolute;
  content: '';
  top: 10px;
  left: -10px;
  height: 5px;
  width: 5px;
  border-radius: 5px;
  background-color: var(--p-primary-color);
}
</style>
