<script setup lang="ts">
import { Panel, Tag, Tabs, Tab, TabList, TabPanel, TabPanels } from 'primevue';
</script>

<template>
  <div class="flex flex-col items-center gap-y-4 py-10 px-4">
    <h1
      class="font-bold text-(--p-primary-color) text-center text-3xl md:text-4xl"
    >
      Our heroes
    </h1>
    <h2 class="max-w-300 text-center">
      Three heroes, each with their own destiny, unite for a great goal - to
      create a store worthy of legends. Their path lies through forests of bugs,
      fields of mockups, and mountains of shuffles. Anna is the keeper of order
      and validation, Daniel is a young mage of precise code, Bogdan is a
      commander and architect of digital lands. Together they are not just a
      team, but a synergy of skills, dedication, and the pursuit of excellence.
      Their front is impregnable, their code is clean, and their interface is
      eye-catching. Where RPG Heroes appears, a reliable and beautiful product
      emerges.
    </h2>
    <div class="flex gap-3 py-4 flex-col md:flex-row flex-wrap w-full">
      <Panel class="flex-1 min-w-50 md:min-w-120">
        <template #header>
          <div class="flex flex-1 flex-col gap-y-2">
            <div class="flex gap-x-4">
              <img
                class="rounded-md w-18 h-18"
                src="/images/our-team/Anna.jpg"
              />
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
            <Tab value="1"
              ><i class="fa-solid fa-star mr-1"></i>Achievements</Tab
            >
            <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <p class="m-0">
                Previously led construction legions, now taking on data sliming.
                Harsh to a fault and generous with checks. She wears regular
                expression armor and is armed with the Validator Supreme
                artifact. No crooked input will slip past her watchful eye.
              </p>
            </TabPanel>
            <TabPanel value="1">
              <ul>
                <li class="mark">Login page</li>
                <li class="mark">Registration page</li>
                <li class="mark">Profile page</li>
                <li class="mark">Cart page</li>
                <li class="mark">Task board</li>
              </ul>
            </TabPanel>
            <TabPanel value="2">
              <ul>
                <li>
                  <i
                    class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">YaroshenkoAnna</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">derSemila</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">annay.1935</span>
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
            <Tab value="1"
              ><i class="fa-solid fa-star mr-1"></i>Achievements</Tab
            >
            <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <p class="m-0">
                Servant of the Web Development Academy. Master of concentration,
                adept at analyzing and selecting solutions. Immersed in scrolls
                of ecommerce knowledge, scrutinizes every element before
                battling it out. Calm yet powerful - like a Map + Filter spell.
              </p>
            </TabPanel>
            <TabPanel value="1">
              <ul>
                <li class="mark">Commercetools</li>
                <li class="mark">Product page</li>
                <li class="mark">Product list</li>
                <li class="mark">Bug fixes</li>
              </ul>
            </TabPanel>
            <TabPanel value="2">
              <ul>
                <li>
                  <i
                    class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">zilusion</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">sudorgindaniil</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">daniil_sudorgin</span>
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
            <Tab value="1"
              ><i class="fa-solid fa-star mr-1"></i>Achievements</Tab
            >
            <Tab value="2"><i class="fa-solid fa-tree mr-1"></i>Locations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <p class="m-0">
                Team lead in class, former visual style mage. Possesses CI/CD
                artifacts and configuration scrolls that keep the project in
                balance. Creator of the Catalog Page is his frontline fortress.
                Leads the squad with confidence and attention to every detail.
              </p>
            </TabPanel>
            <TabPanel value="1">
              <ul>
                <li class="mark">CI/CD</li>
                <li class="mark">Header and footer</li>
                <li class="mark">Main page</li>
                <li class="mark">404 page</li>
                <li class="mark">Catalog page</li>
                <li class="mark">About us page</li>
              </ul>
            </TabPanel>
            <TabPanel value="2">
              <ul>
                <li>
                  <i
                    class="fa-brands fa-github w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">ketrololz</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-telegram w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">ketrolz</span>
                </li>
                <li>
                  <i
                    class="fa-brands fa-discord w-5 text-center text-(--p-primary-color)"
                  ></i
                  ><span class="ml-2">ketrolz</span>
                </li>
              </ul>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Panel>
    </div>
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
