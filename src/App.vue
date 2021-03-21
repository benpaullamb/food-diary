<template>
  <b-container class="pt-5 pb-5">
    <h1 class="text-center">Food Diary</h1>

    <b-form class="mt-4">
      <h2>Variables</h2>

      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Stress" label-for="stress">
            <b-form-rating id="stress" v-model="values.stress" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Felt Stress" label-for="felt-stress">
            <b-form-rating id="felt-stress" v-model="values.feltStress" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Exercise Soreness" label-for="exercise-soreness">
            <b-form-rating id="exercise-soreness" v-model="values.exerciseSoreness" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Discomfort" label-for="discomfort">
            <b-form-rating id="discomfort" v-model="values.discomfort" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Bloating" label-for="bloating">
            <b-form-rating id="bloating" v-model="values.bloating" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Flatulence" label-for="flatulence">
            <b-form-rating id="flatulence" v-model="values.flatulence" stars="10" show-value />
          </b-form-group>
        </b-col>

        <b-col cols="12" md="6">
          <b-form-group label="Stool Bulk" label-for="stool-bulk">
            <b-form-rating id="stool-bulk" v-model="values.stoolBulk" stars="10" show-value />
          </b-form-group>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col>
          <h2>Foods</h2>

          <b-form-input
            v-for="(food, i) in values.foods"
            :key="`food-${i}`"
            :ref="`food-${i}`"
            v-model="food.name"
            @keydown.enter="changeFocus(`food-${i + 1}`)"
            class="mb-3"
            placeholder="Enter a food"
            list="saved-foods"
            autocomplete="off"
          />
          <datalist id="saved-foods">
            <option v-for="savedFood in savedFoods" :key="`saved-food-${savedFood}`">{{ savedFood }}</option>
          </datalist>

          <div>
            <b-button variant="primary" class="mr-2" @click="save">Save</b-button>
            <b-button variant="outline-danger" class="mr-2" @click="reset">Reset</b-button>
            <b-button variant="outline-secondary" v-b-modal.load-modal>Load</b-button>
          </div>

          <b-modal id="load-modal" title="Load from file" @ok="onModalOK">
            <b-form-select v-model="selectedEntryId" :options="entryOptions" />
          </b-modal>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
const { DateTime } = require('luxon');
const { nanoid } = require('nanoid');
const getFilename = require('./utils');

export default {
  name: 'App',

  data() {
    return {
      entries: [],
      selectedEntryId: null,
      id: null,
      date: null,
      values: {
        foods: [
          {
            name: '',
          },
        ],
        stress: 1,
        feltStress: 1,
        exerciseSoreness: 1,
        discomfort: 1,
        bloating: 1,
        flatulence: 1,
        stoolBulk: 1,
      },
    };
  },

  watch: {
    'values.foods': {
      handler() {
        const isLastFoodEmpty = this.values.foods[this.values.foods.length - 1].name === '';
        if (!isLastFoodEmpty) {
          return this.values.foods.push({ name: '' });
        }

        if (this.values.foods.length < 2) {
          return;
        }

        const isSecondLastFoodEmpty = this.values.foods[this.values.foods.length - 2].name === '';
        if (isLastFoodEmpty && isSecondLastFoodEmpty) {
          this.values.foods.pop();
        }
      },
      deep: true,
    },
  },

  computed: {
    entryOptions() {
      if (!this.entries) {
        return [];
      }

      const options = this.entries.map((entry) => {
        return {
          value: entry.id,
          text: getFilename(entry),
        };
      });

      options.unshift({ value: null, text: 'Please select a saved entry' });

      return options;
    },

    savedFoods() {
      if (!this.entries) {
        return [];
      }

      let foods = [];
      this.entries.forEach(({ values }) => {
        foods = [...foods, ...values.foods.map(({ name }) => name)];
      });

      return Array.from(new Set(foods));
    },
  },

  mounted() {
    this.loadEntries();
  },

  methods: {
    async loadEntries() {
      const res = await fetch('/food-diary', {
        headers: {
          'content-type': 'application/json',
        },
      });
      this.entries = await res.json();
    },

    changeFocus(ref) {
      this.$refs[ref][0].focus();
    },

    onModalOK() {
      const entry = this.entries.find((entry) => entry.id === this.selectedEntryId);
      if (entry) {
        this.id = entry.id;
        this.date = entry.date;
        this.values = entry.values;
      }
    },

    saveToast() {
      this.$bvToast.toast(getFilename(this.$data), {
        title: 'Saved',
        autoHideDelay: 3000,
        variant: 'success',
        toaster: 'b-toaster-bottom-center',
        solid: true,
        appendToast: true,
      });
    },

    async save() {
      const entry = {
        id: this.id || nanoid(),
        date: this.date || DateTime.now().toISO(),
        values: {
          ...this.values,
        },
      };

      entry.values.foods = entry.values.foods.filter((food) => food.name !== '');

      const { status } = await fetch('/food-diary', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'content-type': 'application/json',
        },
      });

      if (status !== 200) {
        return console.error('Something went wrong');
      }

      this.saveToast();
      this.loadEntries();
    },

    reset() {
      this.values = {
        foods: [
          {
            name: '',
          },
        ],
        stress: 1,
        feltStress: 1,
        exerciseSoreness: 1,
        discomfort: 1,
        bloating: 1,
        flatulence: 1,
        stoolBulk: 1,
      };
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
</style>
