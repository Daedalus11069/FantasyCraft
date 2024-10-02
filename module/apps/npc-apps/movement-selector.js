export default class MoveSelector extends Application   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.moveOptions = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "move-selector",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/movement-selector.handlebars",
            height: "auto",
            width: 250,
            title: "Select Movement Types"
        });
    }

    /** @override */
    getData() 
    {
        // Populate choices
        const choices =foundry.utils.duplicate(this.moveOptions.choices);
        for ( let [k, v] of Object.entries(choices) ) {
            choices[k] = {
            label: v,
            speed: (k == "immobile") ? 0 : this.actor.system.movement[k].value
            }
        }        
        // Return data
        return {
            choices: choices
        }
    }
  
    activateListeners(html) {
        super.activateListeners(html);

        //listener to change the characters movement type when the select field changes
        html.find('.change-base-movement').change( async ev => {
            var primaryMovement = "system.primaryMovement";
            await this.actor.update({[primaryMovement]: ev.currentTarget.value});
        });

        //listener to update movement values when the number in the input fields change
        html.find('.move-value').change( async ev => {
            var movementType = "system." + ev.currentTarget.name + ".value";
            await this.actor.update({[movementType]: ev.currentTarget.value});
        });

        //close the window
        html.find('.submit').click( ev => {
            this.close();
        });
    }
  }
  