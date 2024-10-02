export default class Treasure extends Application   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "npc-treasure",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-treasure.handlebars",
            height: "auto",
            width: 300,
            title: "Treasure",
        });
    }

    /** @override */
    getData() 
    {
        let number = {};

        // Populate choices
        const choices = [
            {
                name: "Any",
                value: this.actor.system.treasure.any.value
            },
            {
                name: "Coin",
                value: this.actor.system.treasure.coin.value
            },
            {
                name: "Gear",
                value: this.actor.system.treasure.gear.value
            },
            {
                name: "Loot",
                value: this.actor.system.treasure.loot.value
            },
            {
                name: "Magic",
                value: this.actor.system.treasure.magic.value
            },
            {
                name: "Trophies",
                value: this.actor.system.treasure.trophies.value
            }
        ];
        
        for (let i = 0; i < 21; i++) 
        {
            number[i] = i.toString();
        }

        // Return data
        return {
            choices: choices,
            number: number
        }
    }
  
    activateListeners(html) {
        super.activateListeners(html);

        //listeners to change the characters treasure types grade select field changes
        html.find('.change-any-selection').change( async ev => {
            var treasureType = "system.treasure.any.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        html.find('.change-coin-selection').change( async ev => {
            var treasureType = "system.treasure.coin.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        html.find('.change-gear-selection').change( async ev => {
            var treasureType = "system.treasure.gear.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        html.find('.change-loot-selection').change( async ev => {
            var treasureType = "system.treasure.loot.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        html.find('.change-magic-selection').change( async ev => {
            var treasureType = "system.treasure.magic.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        html.find('.change-trophies-selection').change( async ev => {
            var treasureType = "system.treasure.trophies.value";
            await this.actor.update({[treasureType]: ev.currentTarget.value});
        });

        //close the window
        html.find('.submit').click( ev => {
            this.close();
        });
    }
  }
  