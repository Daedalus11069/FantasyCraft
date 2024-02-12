import * as Utils from './Utils.js';

//Function to handle trick effects pre-roll adding bonuses or penalties to the roll formula or replacing it with a skill roll
export function determinePreRollTrickEffect(trick, actor, rollInfo, rollFormula, target, trick2 = null)
{
    if (!trick && trick2 != null)
        trick = trick2
        
    if (!trick) return rollFormula;

    //if attack trick
    if (checkTargets(trick, target)) 
    {
        return "Error";
    }

    if (trick.system.uses.timeFrame != "unlimited")
    {
        let updateString = "system.uses.usesRemaining";
        let newValue = trick.system.uses.usesRemaining-1;
        trick.update({[updateString]: newValue });
    }

    //If the roll has an attack roll bonus and a condition, add the attack roll bonus only if the condition is met.
    if (trick.system.effect.rollModifier && (checkConditions(trick, target[0]?.document.actor, 0, actor) || trick.system.effect.condition == ""))
        //Tricks that affect the attack roll by either a flat roll modifier or replacing the roll with a different kind.
        rollFormula += Utils.returnPlusOrMinusString(trick.system.effect.rollModifier);

    //This is essentially only for called shot
    if (trick.system.effect.additionalEffect == "ignoreAP")
    {
        rollFormula += ignoreArmour(target);
        if (trick2 != null) rollFormula = determinePreRollTrickEffect(trick2, actor, rollInfo, rollFormula, target)
        return rollFormula
    }

    //replace the roll with a skill check if required
    if (trick.system.effect.additionalEffect == "replaceAttackRoll")
    {
      let skill = actor.skills[rollInfo.trick1.system.effect.secondaryCheck]
      rollFormula = "1d20" + " + " + skill.ranks + " + " + skill.misc + " + " + actor.abilityScores[skill.ability].mod;
      if (trick2 != null) rollFormula = determinePreRollTrickEffect(trick2, actor, rollInfo, rollFormula, target)
      return rollFormula
    }

    //replace the attribute used in the roll if required
    if (trick.system.effect.additionalEffect == "replaceAttribute")
    {
      rollFormula = "1d20 + " + actor.abilityScores[trick.system.effect.secondaryCheck].mod + rollFormula.slice(8)
      if (trick2 != null) rollFormula = determinePreRollTrickEffect(trick2, actor, rollInfo, rollFormula, target)
      return rollFormula
    }

    if (trick2 != null) rollFormula = determinePreRollTrickEffect(trick2, actor, rollInfo, rollFormula, target)

    return rollFormula;
    
    //if combat action trick
}

//Function to handle trick effects that happen after the roll has been made (mainly comparing rolls to target defense)
export function determinePostRollTrickEffect(trick, actor, item, target, attackRoll)
{
    if (!trick) return null;

    //If the attack is using a trick that instantly causes a failed damage save, see if the target auto-fails a save.
    if (target != null)
    {
        if (!checkConditions(trick, target[0]?.document.actor, attackRoll, actor))
            return null;

        if (trick.system.effect.additionalEffect == "failDamageSave") autoFailSaveCheck(attackRoll, target, trick.system, item, actor);
    }
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
        
    if (armour  == null)
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

    if (condition == "hitBy4" && attackRoll.total >= target.system.traits.defense.total + 4)
        return 1;
    if (condition == "hitBy10" && attackRoll.total >= target.system.traits.defense.total + 4 && attackRoll.total < target.system.traits.defense.total + 10)
        return 1;
    if (condition == "hitBy10" && attackRoll.total >= target.system.traits.defense.total + 10)
        return 2;

    return 0;
}