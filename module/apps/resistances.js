/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
export default class Resistances extends FormApplication {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.resistances = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "resistances",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/resistances.hbs",
            height: "auto",
            width: 250,
            title: "Resistances"
        });
    }

    /** @override */
    getData() 
    {
        let resistances = this.actor.system.resistances;
        
        //Populate choices
        const choices = foundry.utils.duplicate(resistances);

        return {
            resistances: resistances,
            choices: choices
        }
    }
  
    _updateObject() 
    {
        //this.object.update();
    }

}
  