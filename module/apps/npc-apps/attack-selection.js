export default class AttackDialog extends FormApplication   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.moveOptions = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "npc-attack",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-attacks.handlebars",
            height: "auto",
            width: 500,
            title: "Attack information"
        });
    }

    /** @override */
    getData() 
    {

    }
  
    _updateObject(event, formData) {
        const updateData = {};
    
        updateData[`system.playerControlled`] = formData['system.playerControlled'];

        // Update the object
        this.actor.update(updateData);
    }
  }
  