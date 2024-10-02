/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
export default class PathBonuses extends FormApplication {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.pathInformation = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pathBonuses",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/path-bonuses.hbs",
            height: "auto",
            width: 550,
            title: "Path Information"
        });
    }

    /** @override */
    getData() 
    {
        const act = this.actor.system;
        const path = this.pathInformation.choices.path.system;
        let pathStep = path.pathStep;
        let stepInformation = []
        
        for (let i = 1; i <= pathStep; i++)
        {
            let currentStep = path["step" + i];
            currentStep = this._getStepInformation(currentStep, pathStep)
            stepInformation.push({ name: "Step " + i, bonus: currentStep});
        }

        return {
            step: stepInformation
        }
    }

    activateListeners(html) 
    {
        html.find('.open-item').click(this._openItem.bind(this));
    }

    _getStepInformation(currentStep, pathStep)
    {
        let effect1 = currentStep.effect1;
        let effect2 = currentStep.effect2;
        let returnInformation = {effect1: {}, effect2: {}};

        if (effect1 == "other" && effect2 == "")
        {
            returnInformation.effect1.string = currentStep.value1;
            return returnInformation;
        }

        returnInformation.effect1 = (effect1 == "other") ? currentStep.value1 : this.returnTargetFromEffect(currentStep, 1, pathStep);
        returnInformation.effect2 = (effect2 == "other") ? currentStep.value2 : this.returnTargetFromEffect(currentStep, 2, pathStep);

        return returnInformation;
    }

    returnTargetFromEffect(currentStep, num, pathStep)
    {
        const effect = currentStep["effect" + num];
        const effectBonus = currentStep["value" + num];
        const damageType = currentStep["damageType" + num];
        const effectTarget = currentStep["target" + num];
        let returnString;
        let string2;
        
        //FEATS, FEATUERS, TRICKS
        if (effect == "feat" || effect == "classAbility" || effect == "npcOrOriginFeature" || effect == "trick")
        {
            returnString = game.i18n.localize("fantasycraft.Dialog.youGain");
            let targets = {target1: {name: effectBonus, id: effectTarget}};
         
            return {string: returnString, targets: targets};
        }


        //SPELLS
        if ( effect == "spell" || effect == "twoZeroLevels")
        {
            let resetNumber = " once ";
            if (currentStep.value1 == currentStep.value2) //If the spell in effect 1 and 2 are the same, only list one, but change text to indicate that there are two castings allowed
            {
                if (num == 2)
                    return;
                else 
                    resetNumber = " twice ";
            }

            returnString = game.i18n.localize("fantasycraft.Dialog.youMayCast");

            let targets = {target1: {name: effectBonus, id: effectTarget}};
            let reset = currentStep["spell" + num + "Reset"];

            string2 = (reset == "atWill") ? " at will" : resetNumber + game.i18n.localize("fantasycraft." + reset);
            if (effect == "twoZeroLevels")
                targets.target2 = {name: currentStep.special, id: currentStep.specialTarget};
            return {string: returnString, string2: string2, targets: targets, type: "spell"};
        }

        let valueBonus = (currentStep["effect" + num + "Scaling"] == "true") ? effectBonus * pathStep : effectBonus;

        //EVERYTHING ELSE
        if (effect == "skillBonus" || effect == "damageBonus" || effect == "speedBonus" || effect == "saveBonus" || effect == "attributeBonus" || effect == "adBonus")
        {
            returnString = "You gain a +" + valueBonus + " bonus to ";
            if (effect == "skillBonus") returnString += effectTarget + " checks.";
            if (effect == "damageBonus") returnString += "damage.";
            if (effect == "speedBonus") returnString += "your movement speed.";
            if (effect == "saveBonus") returnString += effectTarget + " saves.";
            if (effect == "attributeBonus") returnString += effectTarget + ".";
            if (effect == "adBonus") returnString += " action dice rolls.";
        }

        if (effect == "resistances") returnString = "You gain resistance " + valueBonus + " to " + damageType + " damage";

        if (effect == "damageImmunity") returnString = "You gain a immunity to " + damageType + " damage";
        if (effect == "convertDamage") returnString = "You may convert the damage of your melee and unarmed attacks to " + damageType + " damage";

        return {string: returnString};
    }


    async _openItem(event)
    {
        const element = event.currentTarget.closest(".item");
        const itemId = element.dataset.itemId;
        const item = await fromUuid(itemId);
        return item.sheet.render(true);  
      }

    _updateObject() 
    {
        //this.object.update();
    }

}
  