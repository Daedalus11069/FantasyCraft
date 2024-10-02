export default class ArmourResistance extends FormApplication   {
    constructor(item, options, ...args)
    {
        super(...args);
        this.resistances = options;
        this.item = item; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "armour-resistances",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/armour-resistances.hbs",
            height: "auto",
            width: 250,
            title: "Manage Armour Resistances"
        });
    }

    /** @override */
    getData() 
    {
        let armourResistances = this.item.system.resistances;
        
        //Populate choices
        const choices =foundry.utils.duplicate(this.resistances.choices);
        for ( let [k, v] of Object.entries(choices) ) {
            
        }

        return {
            resistances: armourResistances,
            choices: choices
        }
    }
  
    _updateObject(event, formData) 
    {
        const updateData = {};
        
        // Obtain choices
        const resistanceValue = [];
        let index = 0;
      
        for ( let [k, v] of Object.entries(CONFIG.fantasycraft.damageResistanceArmour) ) 
        {
            resistanceValue.push({'name': k, 'value': formData.resistanceValue[index] })
            index++;
        }

        updateData[`system.resistances`] = resistanceValue;
        
        //return that array to the armour
        this.item.update(updateData);
    }

}
  