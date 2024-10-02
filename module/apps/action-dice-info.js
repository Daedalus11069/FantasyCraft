/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
 export default class ActionDiceInfo extends FormApplication {

   /** @override */
     static get defaultOptions() {
       return foundry.utils.mergeObject(super.defaultOptions, {
         id: "action-dice-info",
       classes: ["fantasycraft"],
       title: "Action Dice Information",
       template: "systems/fantasycraft/templates/apps/action-dice-info.handlebars",
       width: 320,
       height: "auto"
    });
   }

    _updateObject() 
    {
        this.object.update();
    }

}