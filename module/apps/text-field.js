/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
export default class TextField extends FormApplication {

    /** @override */
    static get defaultOptions() 
    {
      return foundry.utils.mergeObject(super.defaultOptions, 
      {
          id: "text-field",
          classes: ["fantasycraft"],
          title: "Actor Text Field",
          template: "systems/fantasycraft/templates/apps/text-field.html",
          width: 320,
          height: "auto",
          allowCustom: true,
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
    getData() 
    {
      // Get current values
      let attr = foundry.utils.getProperty(this.object, this.attribute) || {};
      attr.value = attr.value || [];
  
      // Return data
        return {
        allowCustom: true,
        choices: "",
        custom: attr ? attr.custom : ""
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _updateObject(event, formData) {
        const updateData = {};

        const chosen = [];
        for ( let [k, v] of Object.entries(formData) ) {
          if ( (k !== "custom") && v ) chosen.push(k);
        }        updateData[`${this.attribute}.custom`] = formData.custom;

        if (this.options.test)
          return formData.custom
        else
        this.object.update(updateData);         // Update the object

    }
    
  }
  