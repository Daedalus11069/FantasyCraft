/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {DocumentSheet}
 */
export default class SelectFromCompendium extends DocumentSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "selectFromCompendium",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/select-item-from-compendium.hbs",
            height: "auto",
            width: 250,
            title: "Select Item"
        });
    }


    /** @override */
    getData(options = {}) 
    {
        console.log("test")
        return
        {
            choices: compendium
        }
    }
  
    _updateObject(event, formData)
    {
        //this.object.update();
    }

}