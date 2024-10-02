export default class GearDialog extends FormApplication   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.moveOptions = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "npc-gear",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-gear.handlebars",
            height: "auto",
            width: 500,
            title: "Gear information"
        });
    }

    /** @override */
    getData() 
    {
        let XP = 0

        // Populate choices
        const choices = {
            playerControlled: this.actor.system.playerControlled
        }

        for (let [k,v] of Object.entries(this.actor.items.filter(function(item) {return item.type == "weapon"})))
            XP += v.system.complexity.number;
        for (let [k,v] of Object.entries(this.actor.items.filter(function(item) {return item.type == "armour"})))
            XP += v.system.complexity.number;
        for (let [k,v] of Object.entries(this.actor.items.filter(function(item) {return item.type == "general"})))
        {
            XP += v.system.complexity.number;
        }

        XP = Math.ceil(XP/10);

        // Return data
        return {
            choices: choices,
            exp: XP
        }
    }
  
    _updateObject(event, formData) {
        const updateData = {};
    
        updateData[`system.playerControlled`] = formData['system.playerControlled'];

        // Update the object
        this.actor.update(updateData);
    }
  }
  