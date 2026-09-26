<template>
  <Dialog v-model:visible="visible" modal header="New Graph" @hide="reset">
    <span class="p-text-secondary block mb-5">Give it a name that says what it does. You can change everything later in the editor.</span>

    <div class="flex flex-col gap-2 mb-4">
      <label for="name">Name <span class="text-red-500">*</span></label>
      <InputText id="name" v-model="name" placeholder="e.g. Asset Turntable" :invalid="submitted && !!errors.name"/>
      <Message v-if="submitted && errors.name" severity="error" size="small" variant="simple">
        {{ errors.name }}
      </Message>
    </div>

    <div class="flex flex-col gap-2">
      <label for="description">Description <span class="text-red-500">*</span></label>
      <InputText id="description" v-model="description" placeholder="What does this graph do?" :invalid="submitted && !!errors.description"/>
      <Message v-if="submitted && errors.description" severity="error" size="small" variant="simple">
        {{ errors.description }}
      </Message>
    </div>

    <div class="flex justify-end gap-2 mt-12">
      <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
      <Button type="button" label="Create and open editor" outlined :loading="isSaving" @click="continueCreation" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { createGraph, type VexsGraphCreate } from '@/api/graph.api';
import { computed, ref } from 'vue';
import { useToast } from 'primevue';
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();

const visible = defineModel<boolean>('visible', { default: false });

const name = ref('');
const description = ref('');
const submitted = ref(false);
const isSaving = ref(false);

const errors = computed(() => ({
  name: name.value.trim() ? null : 'Name is required.',
  description: description.value.trim() ? null : 'Description is required.',
}));

const isValid = computed(() => !errors.value.name && !errors.value.description);

const continueCreation = async () => {
  submitted.value = true;
  if (!isValid.value) return;

  console.log(name.value.trim());
  
  const graph: VexsGraphCreate = {
    name: name.value.trim(),
    description: description.value.trim(),
    flowpipe_graph: {
      module: 'flowpipe.graph',
      cls: 'Graph',
      name: name.value.trim(),
      nodes: []
    }
  };

  isSaving.value = true;
  try {
    let createdGraph = await createGraph(graph);
    visible.value = false;

    // Show success toast
    toast.add({ severity: 'success', summary: 'Graph created', detail: `Graph ${createdGraph.name} has been created.`, life: 3000 });

    // Open the newly created graph in the editor
    router.push({ name: 'graph-editor', params: { id: createdGraph.id } });
  } catch (e) {
    console.error('Failed to create graph:', e);
    toast.add({ severity: 'error', summary: 'Graph creation failed', detail: e instanceof Error ? e.message : String(e), life: 3000 });
  }
  
  finally {
    isSaving.value = false;
  }
};

const reset = () => {
  name.value = '';
  description.value = '';
  submitted.value = false;
};
</script>