/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
export default class FeatureSelector extends FormApplication {

    /** @override */
      static get defaultOptions() {
        let _resolvePromise = null;

        return foundry.utils.mergeObject(super.defaultOptions, {
        id: "feature-selector",
        classes: ["fantasycraft"],
        title: "Choose Class Ability",
        template: "systems/fantasycraft/templates/apps/trait-selector.hbs",
        width: 320,
        height: "auto",
        choices: {},
        minimum: 1,
        maximum: 1
      });
    }

    static async GetESlot(options) { 
      const sheet = new FeatureSelector(options);
      await sheet.render(true);
  
      return new Promise(resolve => {
          sheet._resolvePromise = resolve;
      });
    }
  
  
    /* -------------------------------------------- */
  
    /**
     * Return a reference to the target attribute
     * @type {String}
     */
    get attribute() {
        return this.options.name;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
  
      // Get current values
      let attr = getProperty(this.object.system, this.attribute) || {};
      attr.value = attr.value || [];
  
      // Populate choices
      const choices =foundry.utils.duplicate(this.options.choices);
      for ( let [k, v] of Object.entries(choices) ) {
        choices[v] = {
          label: k,
          chosen: attr ? attr.value.includes(v) : false
        }
      }
  
      // allow custom is false unless the list of options is empty.
      if (attr.value != [])
        this.options.allowCustom = false;

      // Return data
      return {
        allowCustom: this.options.allowCustom,
        choices: choices,
        custom: attr ? attr.custom : ""
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _updateObject(event, formData) {
      const updateData = {};
  
      // Obtain choices
      const chosen = [];
      for ( let [k, v] of Object.entries(formData) ) {
        if ( (k !== "custom") && v ) chosen.push(k);
      }
      updateData[`${this.attribute}.value`] = chosen;
  
      // Validate the number chosen
      if ( this.options.minimum && (chosen.length < this.options.minimum) ) {
        return ui.notifications.error(`You must choose at least ${this.options.minimum} options`);
      }
      if ( this.options.maximum && (chosen.length > this.options.maximum) ) {
        return ui.notifications.error(`You may choose no more than ${this.options.maximum} options`);
      }
  
      // Include custom
      if ( this.options.allowCustom ) {
        updateData[`${this.attribute}.custom`] = formData.custom;
      }
      
      // Update the object
      return updateData;
    }
  }
  