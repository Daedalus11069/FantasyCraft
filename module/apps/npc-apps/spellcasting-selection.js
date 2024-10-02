import * as Utils from '../../Utils.js';


export default class Spellcasting extends Application   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "npc-spellcasting",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-spellcasting.handlebars",
            height: "auto",
            width: 250,
            title: "Spellcasting",
        });
    }

    /** @override */
    getData() 
    {

        let spells = this.actor.items.filter(function(item) {return item.type == "spell"});
        spells.sort(Utils.alphabatize)
        
        // Populate choices
        const choices = 
        {
            label: "Spellcasting",
            grade: this.actor.system.spellcasting.grade
        }        
        // Return data
        return {
            choices: choices,
            spells: spells,
            grades: {"": "", I: "I", II: "II", III: "III", IV: "IV", V: "V", VI: "VI", VII: "VII", VIII: "VIII", IX: "IX", X: "X"}
        }
    }
  
    activateListeners(html) {
        super.activateListeners(html);

        //listener to change the characters spellcasting grade select field changes
        html.find('.change-spell-grade').change( async ev => {
            var spellcasting = "system.spellcasting.grade";
            await this.actor.update({[spellcasting]: ev.currentTarget.value});
        });

        html.find('.deleteItem').click( async ev => {
            let itemId = ev.currentTarget.closest(".item").dataset.itemId;
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            this.render(false);
        });

        //close the window
        html.find('.submit').click( ev => {
            this.close();
        });
    }
  }
  