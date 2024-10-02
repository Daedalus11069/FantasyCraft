import * as Utils from './Utils.js';

//Function to handle trick effects pre-roll adding bonuses or penalties to the roll formula or replacing it with a skill roll
export function determinePreRollTrickEffect(data, actor, rollFormula, target, trick1, trick2 = null)
{
    //If Trick 1 is defined, use that, if trick 1 is not defined but trick 2 is, use that instead

    if (!trick1 && !trick2) return rollFormula;

    //if attack trick requires a target, and there isn't one return an error
    if (checkTargets(trick1, target)) 
    {
        return "Error";
    }

    //reduce the number of uses remaining of non-unlimited tricks
    if (trick1.system.uses.timeFrame != "unlimited")
    {
        let updateString = "system.uses.usesRemaining";
        let newValue = trick1.system.uses.usesRemaining-1;
        trick1.update({[updateString]: newValue });
    }

    //If the roll has an attack roll bonus and a condition, add the attack roll bonus only if the condition is met.
    if (trick1.system.effect.rollModifier && (checkConditions(trick1, target[0]?.document.actor, 0, actor) || trick1.system.effect.condition == ""))
    {
        //Tricks that affect the attack roll by either a flat roll modifier or replacing the roll with a different kind.
        rollFormula.push("@trickBonus");
        data.modifiers.trickBonus = Utils.returnPlusOrMinusString(trick1.system.effect.rollModifier);
    }

    //This is essentially only for called shot
    if (trick1.system.effect.additionalEffect == "ignoreAP")
    {
        rollFormula.push("@calledShot");
        data.modifiers.calledShot = ignoreArmour(target);
        if (trick2 != undefined || trick2 != null) rollFormula = determinePreRollTrickEffect(data, actor, rollFormula, target, trick2)
            return rollFormula
    }

    //replace the roll with a skill check if required
    if (trick1.system.effect.additionalEffect == "replaceAttackRoll")
    {
        let skill = actor.skills[trick1.system.effect.secondaryCheck]
        rollFormula = ["1d20", "@ranks", "@misc", "@abilityBonus"];
        data.modifiers.ranks = skill.ranks;
        data.modifiers.misc = skill.misc;
        data.modifiers.abilityBonus = actor.abilityScores[skill.ability].mod;

        if (trick2 != undefined || trick2 != null) rollFormula = determinePreRollTrickEffect(data, actor, rollFormula, target, trick2)
            return rollFormula
    }

    //replace the attribute used in the roll if required
    if (trick1.system.effect.additionalEffect == "replaceAttribute")
    {
        rollFormula = "1d20 + " + actor.abilityScores[trick1.system.effect.secondaryCheck].mod + rollFormula.slice(8)
        if (trick2 != undefined || trick2 != null) rollFormula = determinePreRollTrickEffect(data, actor, rollFormula, target, trick2)
        return rollFormula
    }

    if (trick2 != undefined || trick2 != null) rollFormula = determinePreRollTrickEffect(data, actor, rollFormula, target, trick2)

    return rollFormula;
}

//Function to handle trick effects that happen after the roll has been made (mainly comparing rolls to target defense)
export function determinePostRollTrickEffect(trick, actor, item, target, attackRoll, trick2 = null)
{
    if (!trick) return null;

    //If the attack is using a trick that instantly causes a failed damage save, see if the target auto-fails a save.
    if (target != null)
    {
        if (!checkConditions(trick, target[0]?.document.actor, attackRoll, actor))
            return null;

        if (trick.system.effect.additionalEffect == "failDamageSave") autoFailSaveCheck(attackRoll, target, trick.system, item, actor);
    }

    if (trick2 != null || trick2 != undefined)
        determinePostRollTrickEffect(trick2, actor, item, target, attackRoll)
}

export function checkConditions(trick, target, attackRoll = 0, actor)
{
    const condition = trick.system.effect.condition;

    if (condition == "none") return true;
    if ((condition == "hitBy4" || condition == "hitBy10") && attackRoll.total >= target.system.defense.value + 4)
        return true;
    if (condition == "targetHasCondition" && target.getEmbeddedCollection('ActiveEffect').filter(effect => effect.label.toLowerCase() == trick.system.effect.conditionTarget).length > 0 ) 
        return true;
    if (condition == "targetIsSpecial" && target.isSpecial) return true; 
    if (condition == "targetIsStandard" && !target.isSpecial) return true;
    if (condition == "drIsGreater" && target.system.dr < actor.dr) return true;
        
    return false;
}

//If a target is required for a trick, check to see if the player has anything targeted, and if not stop the attack and give an error message. 
function checkTargets(trick, target)
{
    if (!trick) return false;

    if (trick.system.requiresTarget && target.length == 0)
    {
        ui.notifications.error(game.i18n.localize('fantasycraft.Dialog.requiresTargetWarningMessage'))
        return true;
    }

    return false
}

function ignoreArmour(target)
{
    let armour = target[0].actor.items.find(item => (item.type == "armour" && item.system.equipped == true));
    if (armour == null)
        armour = target[0].actor.items.find(item => item.name == game.i18n.localize("fantasycraft.thickHide"));
        
    if (armour == null || armour == undefined)
        return 0
        
    if (armour.type == "feature" || armour.system?.armourCoverage == "partial")
        return -3
    if (armour.system.armourCoverage == "moderate")
        return -6
    if (armour.system.armourCoverage == "full")
        return -9
}

export function autoFailSaveCheck(attackRoll, targets, trick, item, actor)
{
  for (let [k, v] of Object.entries(targets))
  {
    let t = v.document.actor;
    if (t.type != "npc") continue;

    let autoFailCheck = trick.effect.secondaryCheck;
    let lethal = (item.system.damageType == "subdual" || item.system.damageType == "cold" || item.system.damageType == "heat" || item.system.damageType == "stress") ? false : true;
    if (autoFailCheck != "beatsDefense")
    {
        if (attackRoll.total >= t.system.traits.defense.total && actor.abilityScores[autoFailCheck].value > t.system.abilityScores[autoFailCheck].value)
            t.npcDamageSave(0, lethal, true);
    } else if (autoFailCheck != "dr4")
    {
        if (t.system.dr <= 4)
            t.npcDamageSave(0, lethal, true);
    } else 
    {
        if (attackRoll.total >= (t.system.traits.defense.total + 4))
            t.npcDamageSave(0, lethal, true);
    }
  }
}

export function multipleDamageRolls(attackRoll, target, trick)
{
    const condition = trick.system.effect.condition;
    const character = target.type == "character";
    let defense = (character) ? target.system.defense.value : target.system.traits.defense.total;


    if (condition == "hitBy4" && attackRoll.total >= defense + 4)
        return 1;
    if (condition == "hitBy10" && attackRoll.total >= defense + 4 && attackRoll.total < defense + 10)
        return 1;
    if (condition == "hitBy10" && attackRoll.total >= defense + 10)
        return 2;

    return 0;
}