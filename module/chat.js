import * as Utils from "./Utils.js";
import * as Tricks from "./Tricks.js";

export function addChatListeners(html)
{
    html.on('click', 'button.attack', onAttack);
    html.on('click', 'button.damage', onDamage);
    html.on('click', 'button.apply', applyDamage);
    html.on('click', 'button.applyCondition', applyCondition);
    html.on('click', 'button.impareAttribute', applyImparement);
    html.on('click', 'button.healVitality', healVitality);
    html.on('click', 'button.minimumDamage', minimumDamage);
    html.on('click', 'button.linkOption', linkOption);
    html.on('click', 'button.spellDamage', spellDamage);
    html.on('click', 'button.spellcastingRoll', spellCasting);
}

export function spellCard(spell, actor)
{
    let chatdata = getChatBaseData(actor);

    setDicelessRenderTemplate('systems/fantasycraft/templates/chat/spell-chat.hbs', spell, chatdata)
}
export function featCard(feat, actor)
{
    let chatdata = getChatBaseData(actor);

    setDicelessRenderTemplate('systems/fantasycraft/templates/chat/spell-chat.hbs', spell, chatdata)
}
export function featureCard(feature, actor)
{
    let chatdata = getChatBaseData(actor);

    setDicelessRenderTemplate('systems/fantasycraft/templates/chat/spell-chat.hbs', spell, chatdata)
}

function getChatBaseData(actor) {
    const rollMode = game.settings.get('core', 'rollMode')

    return {
      user: game.user.id,
      speaker: {
        actor: actor.id,
        alias: actor.name,
      },
      blind: rollMode === 'blindroll',
      whisper:
        rollMode === 'selfroll'
          ? [game.user.id]
          : rollMode === 'gmroll' || rollMode === 'blindroll'
          ? ChatMessage.getWhisperRecipients('GM')
          : [],
    }
  }
  
function setRenderTemplate(diceRoll, template, rollInfo, chatData)
{
    renderTemplate(template, rollInfo).then(content => {
        chatData.content = content
        if (game.dice3d && diceRoll)
          game.dice3d
            .showForRoll(diceRoll, game.user, true, chatData.whisper, chatData.blind)
            .then(() => ChatMessage.create(chatData))
        else {
          chatData.sound = CONFIG.sounds.dice
          ChatMessage.create(chatData)
        }
    });
}

function setDicelessRenderTemplate(template, spell, chatData)
{
    renderTemplate(template, spell).then(content => {
        chatData.content = content
        ChatMessage.create(chatData)
        });
}

export function onSavingThrow(diceRoll, actor, savingThrow, dc=0)
{
    const save = actor.system.saves[savingThrow]
    savingThrow = savingThrow + " save"
    
    const rollInfo = 
    {
        actor: actor,
        save: save,
        rollDescription: savingThrow,
        data: {}
    }

    const d = rollInfo.data
    d['roll'] = diceRoll.total;
    d['formula'] = diceRoll.formula;
    d['diceRoll'] = diceRoll.terms[0].total;
    if (dc != 0) d['dc'] = dc;
    d['success'] = (dc != 0 && dc < diceRoll.total) ? true : false;

    const chatData = getChatBaseData(actor);

    setRenderTemplate(diceRoll, 'systems/fantasycraft/templates/chat/skill-chat.hbs', rollInfo, chatData);
}

export function onSkillCheck(diceRoll, actor, skillName, flawless, trick = null, untrained)
{
    let skill = actor.type == "character" ? actor.system.skills[skillName] : actor.system.signatureSkills[skillName];
    let error = false;
    const naturalResult = diceRoll.dice[0].total;

    if (skillName == "competence")
        skill = { threat: 20, error: 1 };

    if (skillName == "spellcasting") 
    {
        skill = actor.type == "character" ? actor.system.arcane[skillName] : actor.system[skillName];
        if (game.settings.get('fantasycraft', 'wildMagic'))
        {
            if (actor.type == "npc") skill.threat = skill.threat -= 2;
            skill.error = 3;
        }
        let mPouch = actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.magesPouch"));
        mPouch = mPouch[0];
        if (!!mPouch && mPouch.system.itemUpgrades.masterwork)
            skill.error --;
    }

    if (skill.error == undefined || skill.error == NaN)
        skill.error = 1;
    
    if (actor.type == "npc" && skillName != "spellcasting" && skillName != "competence") 
        skillName = actor.system.signatureSkills[skillName].skillName;

    const rollInfo = 
    {
        actor: actor,
        skill: skill,
        rollDescription: skillName,
        data: {}
    }

    //If the skill is untrained cap the result at 15
    let rollResult = diceRoll.total;
    if (untrained)
    {
        if (rollResult > 15)
            rollResult = 15;

        if (naturalResult <= skill.error +2)
            error = true;
    }
    else 
    {
        if (naturalResult <= skill.error || naturalResult < 0)
            error = true;
    }

    const d = rollInfo.data
    d['roll'] = (flawless > rollResult) ? "Flawless " + flawless : rollResult;
    d['formula'] = diceRoll.formula;
    d['diceRoll'] = naturalResult;
    d['threat'] = (naturalResult >= skill.threat) ? true : false;
    d['error'] = error
    if (trick) d['trick'] = trick;

    const chatData = getChatBaseData(actor);

    setRenderTemplate(diceRoll, 'systems/fantasycraft/templates/chat/skill-chat.hbs', rollInfo, chatData);
}

export function onHealingRoll(diceRoll, actor, healingType)
{
    const rollInfo = 
    {
        actor: actor,
        rollDescription: healingType,
        data: {}
    }

    const d = rollInfo.data
    d['roll'] = diceRoll.total;
    d['formula'] = diceRoll.formula;
    d['diceRoll'] = diceRoll.terms[0].results[0].result;

    const chatData = getChatBaseData(actor);

    setRenderTemplate(diceRoll, 'systems/fantasycraft/templates/chat/healing-chat.hbs', rollInfo, chatData);
}

export function onAttack(attackRoll, attacker, item, tricks, additionalInfo, ammo)
{
    let threat = (item.system?.threatRange != undefined) ? item.system.threatRange : item.system.threat;
    threat = (tricks?.trick1 != undefined && tricks.trick1.system.effect.additionalEffect == "replaceAttackRoll") ? attacker.system.skills[tricks.trick1.system.effect.secondaryCheck].threat : threat;
    threat = (tricks?.trick2 != undefined && tricks.trick2.system.effect.additionalEffect == "replaceAttackRoll") ? attacker.system.skills[tricks.trick2.system.effect.secondaryCheck].threat : threat;

    // If the GM has enabled the Deadly Combat quality, increase the threat range further.
    if (game.settings.get('fantasycraft','deadlyCombat')) threat -= 2;

    let magicItems = _checkForThreatRangeMagicItems(attacker);

    if (tricks?.trick1?.system.effect.additionalEffect != "replaceAttackRoll" && tricks?.trick2?.system.effect.additionalEffect != "replaceAttackRoll")
    {
        let threatItem = magicItems.find(mi => mi.target == item.system.attackType);
        if (threatItem != undefined)
            threat -= (threat.greater) ? 2 : 1;
    }

    let qualities = (item.type == "attack") ? _filterQualities(item.system.naturalUpgrades) : _filterQualities(item.system.weaponProperties);
    const attackInfo = setUpAttackData(attackRoll, attacker, item, threat, qualities, ammo);

    if (item.type == "attack" && item.system.attackType != "naturalAttack")
    {
        const d = attackInfo.data;
        d['areaSize'] = item.system.area.value * CONFIG.fantasycraft.areaRangeMultiplier[item.system.area.shape];
        d['areaShape'] = item.system.area.shape;
        d['properties'] = CONFIG.fantasycraft.attackPropertiesList;
    }

    if (tricks?.trick1)
        setUpTricks(attackInfo, tricks);

    const chatData = getChatBaseData(attacker);

    setRenderTemplate(attackRoll, 'systems/fantasycraft/templates/chat/attack-chat.hbs', attackInfo, chatData);

}

function _checkForThreatRangeMagicItems(actor)
{
    let magicItems = []

    actor.items.forEach (function(item)
    {
        if (item.system?.isMagic)
        {
            if ((item.type == "armour" && !item.system.equipped) || (item.type == "weapons" && !item.system.readied))
                return;

            for (let i = 1; i <= item.system.essences.essenceNumber; i++)
            {
                let essence = item.system.essences[Object.keys(item.system.essences)[i]];
                if(essence.ability == "threatRange")
                {
                    (essence.attackType == "skill") ? magicItems.push({"target": essence.target, "greater": essence.greater}) 
                                                    : magicItems.push({"target": essence.attackType, "greater": essence.greater})
                }
            }
        }
    });

    return magicItems;
}

function _filterQualities(qualities)
{
    let newQualities = {}
    for(let [key, value] of Object.entries(qualities))
    {
        if (Number.isNumeric(value) && value > 0) newQualities[game.i18n.localize(CONFIG.fantasycraft.attackPropertiesList[key])] = value;
    }

    return newQualities;
}

function _combatActionThreatRanges(actor, combatAction)
{
    let threat = 20;
    let threatChange = 0
    
    //Get all of the actors magic items and see if any of them affect threat ranges.
    let magicItems = _checkForThreatRangeMagicItems(actor);

    //TODO get weapon for disarm from the dialog box instead of finding one here.
    let readiedWeapon = actor.items.find(item => item.type == "weapon" && item.system.readied)
    //get the base threat associated with the skill or attack, then check for a magic reduction
    //checking for magic currently only enabled on pummel and disarm since players will likely bake the magic bonus to skills right into their skills list.
    switch(combatAction)
    {
        case "anticipate":
            threat = actor.system.skills.senseMotive.threat;
            break;
        case "bullRush":
            threat = actor.system.skills.athletics.threat;
            break;
        case "distract":
            threat = actor.system.skills.bluff.threat;
            break;
        case "feint":
            threat = actor.system.skills.prestidigitation.threat;
            break;
        case "grapple":
            threat = actor.system.skills.athletics.threat;
            break;
        case "taunt":
            threat = actor.system.skills.senseMotive.threat;
            break;
        case "tire":
            threat = actor.system.skills.resolve.threat;
            break;
        case "threaten":
            threat = actor.system.skills.intimidate.threat;
            break;
        case "trip":
            threat = actor.system.skills.acrobatics.threat;
            break;
        case "disarm":
            threat = readiedWeapon.system.threat;
            break;
        case "pummel":
            if (actor.martialArts) threat = (actor.mastersArt) ? 18 : 19;
            threatChange = (magicItems.length > 0 && magicItems.find(item => item.target == "unarmed").greater) ? 2 : 1;
            break;
        default:
            console.log("No Threat Range Associated with this skill");
    }

    threat -= threatChange;

    return threat;
}

export function onCombatAction(actionRoll, actor, combatAction, trick=null)
{

    if (combatAction == "disarm")
    {
        ui.notifications.warn("Please roll from the weapon instead for better results");
    }

    let threat = _combatActionThreatRanges(actor, combatAction)
    let damage;

    const actionInfo = 
    {
        actor: actor,
        action: combatAction,
        rollDescription: (combatAction == "bullRush") ? "Bull Rush" : combatAction,
        data: {}
    }

    damage = combatActionDamage(actionInfo, actor, trick);

    if (damage == "error")
        return;

    const d = actionInfo.data;
    d['roll'] = actionRoll.total;
    d['formula'] = actionRoll.formula;
    d['diceRoll'] = actionRoll.result;
    d['threat'] = (actionRoll.result >= threat) ? true: false;
    if (trick != null) d['trick'] = trick

    if (damage.value != "") 
    {
        d['hasDamage'] = true;
        d['damageFormula'] = damage.value;
        d['damageType'] = damage.type;
    }
    
    //setUpTricks(actionInfo, trick)
    
    const chatData = getChatBaseData(actor)

    setRenderTemplate(actionRoll, 'systems/fantasycraft/templates/chat/skill-chat.hbs', actionInfo, chatData);
}

function combatActionDamage(actionInfo, actor, trick)
{
    let damage = 
    {
        value: "",
        type: "lethal"
    }

    if (trick?.system.effect.additionalEffect == "dealDamage" || trick?.system.effect.additionalEffect == "doubleDamage")
    {
        let weapons = actor.items.filter(item => item.type == "weapon" && item.system.weaponCategory == trick.system.trickType.keyword2 && item.system.readied)
        if (weapons.length == 0)
        {
            ui.notifications.error(game.i18n.localize('fantasycraft.Dialog.noReadiedWeapon'))
            return "error";
        }
        let weapon = weapons[0];
        let damageAbility = (weapon.system.weaponProperties.finesse && actor.system.abilityScores.dexterity.mod > actor.system.abilityScores.strength.mod) ? "dexterity" : "strength";

        damage.value = weapon.system.damage + " + " + actor.system.abilityScores[damageAbility].mod;
        let superior = (weapon.system.weaponProperties.materials == "Superior");
        if (superior)
            damage.value += " + " + 1;

        if (trick?.system.effect.additionalEffect == "doubleDamage")
            damage.value += " + " + damage.value;

        damage.type = weapon.system.damageType;

        return damage;
    }
    if (actionInfo.action == "tire")
    {
        damage.value = "1d6";
        damage.type = "subdual";

        return damage;
    }
    if (actionInfo.action == "threaten")
    {
        
        damage.value = (actor.items.filter(item => item.type == "feat" && item.name == game.i18n.localize("fantasycraft.glintOfMadness"))) ? "1d10" : "1d6";
        damage.type = "stress";

        return damage;
    }
    if (actionInfo.action == "bullRush")
    {
        damage.value = actor.system.unarmedDamage;
        damage.type = actor.system.attackTypes.unarmed.damageType;

        if (actor.system.mastersArt)
        {
            damage.value += " + " + 4 + " + " + actor.system.abilityScores[actor.system.defense.ability.name].mod;
        }
        else if (actor.system.martialArts)
            damage.value += " + " + 2 + " + " + actor.system.abilityScores.strength.mod
        else 
            damage.value += " + " + actor.system.abilityScores.strength.mod
    }

    return damage;
}

//duplicated code between natural attack and natural attack moved into 1 function.
function setUpAttackData(attackRoll, attacker, item, threat, qualities, ammo=null)
{
    let result = attackRoll.terms[0].results[0].result;
    const attackInfo = 
    {
        actor: attacker,
        token: attacker.token || canvas.tokens.placeables.find(token => token?.actor?.id === attacker.id),
        item: {id: item.id, data: item, name: item.name},
        data: {}
    }
    if (threat != null && game.settings.get('fantasycraft', 'deadlyCombat'))
        threat -= 2

    threat = (threat == null) ? 21 : threat;

    const d = attackInfo.data
    d['roll'] = attackRoll.total;
    d['formula'] = attackRoll.formula
    d['diceRoll'] = result;
    d['qualities'] = qualities;
    d['threat'] = (result >= threat) ? true : false;
    d['error'] = (result <= item.system.errorRange || attackRoll.total < 0) ? true : false;
    d['target'] = (Utils.getTargets().length > 0) ? Utils.getTargets()[0].document.actor._id : "";
    d['ammo'] = (!!ammo) ? ammo._id : null;
    d['attackType'] = item.system.attackType;
    if (item.system?.attackType == "extraSave") d['saveType'] = game.i18n.localize(CONFIG.fantasycraft.extraordinarySaveDescription[item.system.attackDescription])

    if (attacker.items.find(item => item.system.inStance && (item.system.effect1.effect == "maxDamage" || item.system.effect2.effect == "maxDamage")))
        d['maxDamage'] = true;


    return attackInfo;
}

function setUpTricks(attackInfo, tricks)
{
    if (tricks.trick1 == null || tricks.trick1 == undefined)
        return;

    const trick = tricks.trick1
    const trick2 = tricks.trick2
    
    const d = attackInfo.data;
    d["trick1"] = trick;
    d["trick2"] = trick2;
    
    return attackInfo;
}

async function onDamage(event)
{
    const li = event.currentTarget.closest(".chat-card");
    const data = li.dataset;
    const attackRoll = {
        total: event.currentTarget.parentElement.dataset.attackRoll
    }
    const actor = game.actors.get(li.dataset.ownerId);
    const tokenFromUuid = (data.tokenId != "") ? await fromUuid(data.tokenId) : actor;
    const token = (data.tokenId != "") ? tokenFromUuid.delta.syntheticActor : actor;
    const item = token.items.get(data.itemId);
    const target = game.actors.get(data.targetId);
    const magicItems = Utils.getMagicItems(token);
    const damData = 
    {
        stance: actor.items.find(item => item.type == "stance" && item.system.inStance),
        trick1: (data.trick1 != "") ? actor.items.get(data.trick1) : null,
        trick2: (data.trick2 != "") ? actor.items.get(data.trick2) : null,
        ap: event.currentTarget.parentElement.dataset.ap,
        maxDamage: event.currentTarget.innerText == game.i18n.localize("fantasycraft.maxDamage") ? true : false,
        ammo: token.items.get(data.ammo),
        abilityMod: "strength",
        damageType: (event.currentTarget.parentElement.dataset.damageType != null) ? event.currentTarget.parentElement.dataset.damageType : "lethal",
        sneakAttack: actor.system.sneakAttack,
        damageModifiers: {}
    }    
    let mods = damData.damageModifiers;
    
    //const damageFormula = event.currentTarget.parentElement.dataset.damageFormula;
    //if (damageFormula)
    //{
    //    rollDamageAndSendToChat(damageFormula, token, itemInformation, damData)
    //    return;
    //}

    ////Damage Modifiers////
    // Get the ability that will be used, as well as any unique modifiers for weapons or unarmed attacks 
    if (!!item && item.type == "weapon")
    {
        if (item.type == "weapon")
        {
            let weaponProperties = item.system.weaponProperties;
            let weaponCategory = item.system.weaponCategory;

            mods.superior = (item.system.upgrades.materials == "Superior") ? 1 : 0;

            if (weaponProperties.finesse && token.system.abilityScores.dexterity.mod > token.system.abilityScores.strength.mod)
                damData.abilityMod = "dexterity"

            if (item.system.attackType == "ranged" && weaponCategory != "thrown")
                damData.abilityMod = "";
        } 
    } 
    else if (item == undefined || item.type == "attack")
    {
        if (token.system.martialArts) mods.feat += 2
        if (token.system.mastersArt)
        { 
            damData.abilityMod = (token.type == "character") ? token.system.defense.ability.name : token.system.defense.defenseAttribute;
            mods.feat += 2
        }

    }

    // Assign the ability modifier to the damage roll modifiers
    if (damData.abilityMod != "")
        mods.ability = (item?.system?.weaponCategory == "thrown" && token.items.find(item => item.name == game.i18n.localize("fantasycraft.hurledBasics"))) ? token.system.abilityScores[damData.abilityMod].mod * 2 : token.system.abilityScores[damData.abilityMod].mod;
    
    //Get any bonuses from power attack
    if (token.system?.powerAttack && (item.system.attackType == "melee" || item.system.attackType == "unarmed")) mods.powerAttack = actor.system.powerAttack * 2;
    if (token.system?.powerAttack && (item.system.attackType == "ranged")) mods.powerAttack = actor.system.powerAttack;

    //Get any bonuses from your stance
    if (!!damData.stance && damData.stance?.system.effect1.effect == "damageBonus" || damData.stance?.system.effect2.effect == "damageBonus") 
        mods.stance = (damData.stance.system.effect1.effect == "damageBonus") ? damData.stance.system.effect1.bonus : damData.stance.system.effect2.bonus;

    //Get any bonuses from your tricks
    if (damData.trick1 != null)
    {
        let trickEffect = damData.trick1.system.effect
        if (trickEffect.damageModifier > 0)
        {
            if (trickEffect.damageModifierType == "untyped")
                mods[trickEffect.damageModifierType] = mods[trickEffect.damageModifierType] + trickEffect.damageModifier;
            else 
                mods[trickEffect.damageModifierType] = (trickEffect.damageModifier > mods[trickEffect.damageModifierType]) ?  trickEffect.damageModifier : mods[trickEffect.damageModifierType];
        }

        if(damData.trick2)
        {
            let trickEffect = damData.trick2.system.effect
            if (trickEffect.damageModifier > 0)
            {
                if (trickEffect.damageModifierType == "untyped")
                    mods[trickEffect.damageModifierType] = mods[trickEffect.damageModifierType] + trickEffect.damageModifier;
                else 
                    mods[trickEffect.damageModifierType] = (trickEffect.damageModifier > mods[trickEffect.damageModifierType]) ?  trickEffect.damageModifier : mods[trickEffect.damageModifierType];
            }   
        }
    }

    //Get any bonuses from magic items
    if (magicItems.length > 0)
    {
        for (let mi of magicItems)
        {
            let charm = Utils.getSpecificCharm(mi, "damageBonus");
            
            if (charm != null && (charm[1].target == item.system.attackType || mi == item))
                mods.magicBonus = (Utils.getCharmBonus(mi, charm[1].greater) > mods.magicBonus) ? Utils.getCharmBonus(mi, charm[1].greater) : mods.magicBonus;
        }
    }
    
    ////Damage Dice////
    let damageDice;
    let itemInformation;

    //get the damage dice and item information
    if (!!item)
    {
        if (item.type == "weapon")
            damageDice = (!!damData.ammo && damData.ammo.system.damage != "") ? damData.ammo.system.damage : item.system.damage;
        else
            damageDice = item.system.damage.value;

        itemInformation = {id: item.id, data: item, name: item.name};
        damData.damageType = (!!damData.ammo) ? damData.ammo.system.damageType : item.system.damageType;
    } else 
    {
        damageDice = token.system.unarmedDamage;
        
        itemInformation = {id: "", data:actor.system.attackTypes.unarmed, name: "Unarmed Attack"}
        damData.damageType = actor.system.attackTypes.unarmed.damageType;
    }    
    
    //Compile the roll formula
    let rollFormula = [damageDice];
    for(let [key, bonus] of Object.entries(mods)) 
    {
        if (bonus > 0)
            rollFormula.push("@" + key);
    }
    
    const rollInfo = await preRollDialog(itemInformation.name, "systems/fantasycraft/templates/chat/damageRoll-Dialog.hbs", rollFormula, null)
    if (rollInfo == null) return;
    
    //Add any discretionary bonus
    if(rollInfo?.morale) {rollFormula.push("@untyped"); mods.untyped += rollInfo.morale};

    //Add any sneak attack Dice
    if(rollInfo?.sneakAttack.checked) 
    {
        if (actor.type != "character")    
        {
            let sneakAttackItem = actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.sneakAttack"));
            damData.sneakAttack = Utils.numeralConverter(sneakAttackItem[0].system.grades.value)
        }

        rollFormula.push(damData.sneakAttack + "d6");
        mod.sneakAttack = damData.sneakAttack + "d6";
    }

    //Check tricks for changes to damage type or amount
    if ((damData.trick1?.system.effect.additionalEffect == "changeDamageType" && Tricks.checkConditions(damData.trick1, target)) || (damData.trick2?.system.effect.additionalEffect == "changeDamageType" && Tricks.checkConditions(damData.trick2, target)))
        damData.damageType = damData.trick1?.system.effect.secondaryCheck;

    rollDamageAndSendToChat(rollFormula, actor, itemInformation, damData)

    if ((damData.trick1?.system.effect.additionalEffect == "bonusWeaponDamage" && Tricks.checkConditions(damData.trick1, target, attackRoll)) || (damData.trick2?.system.effect.additionalEffect == "bonusWeaponDamage" && Tricks.checkConditions(damData.trick2, target, attackRoll)))
    {
        //Only grant Sneak attack on the first damage roll
        if(rollInfo?.sneakAttack.checked) 
            mods.sneakAttack = 0;

        if (Tricks.multipleDamageRolls(attackRoll, target, damData.trick1) == 1)
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damData);
        else if (Tricks.multipleDamageRolls(attackRoll, target, damData.trick1) == 2)
        {
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damData);
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damData);
        }
    }
}

async function preRollDialog(attackName, template, formula, tricks=null)
{
    const content = await renderTemplate(template, {
        formula: formula.join(" + "),
        tricks: tricks
    });

    return new Promise(resolve => {
    new Dialog({
        title: attackName,
        content,
        buttons: {
        accept: {
            label: game.i18n.localize("fantasycraft.accept"),
            callback: html => resolve(onDialogSubmit(html))
        }
        },
        close: () => resolve(null)
    }).render(true);
    });
}

function onDialogSubmit(html)
{
    const form = html[0].querySelector("form");
    let dialogOptions = {};

  
    if (form.moraleValue.value != 0)
        dialogOptions.morale = form.moraleValue.value

    dialogOptions.sneakAttack = form.sneakAttack;
    dialogOptions.trick = form.trick;

    return dialogOptions;
}

async function rollDamageAndSendToChat(rollFormula, actor, itemInformation, data)
{
    let rollString = rollFormula.join(" + ");
    if (data.trick1?.system?.effect.damageModifierStyle == "halfDamage" || data.trick2?.system?.effect.damageModifierStyle == "halfDamage")
    {
        rollString = "(" + rollString + ") * @halfDamage";
        data.damageModifiers.halfDamage = 0.5;
    }

    const damageRoll = new Roll(rollString, data.damageModifiers);
    if (data.maxDamage) 
        await damageRoll.evaluate({maximize: true})
    else
        await damageRoll.evaluate()

    const damageInfo = 
    {
        actor: actor,
        item: itemInformation,
        data: {}
    }

    const d = damageInfo.data
    d['roll'] = Math.ceil(damageRoll.total);
    d['formula'] = damageRoll.formula;
    d['diceRoll'] = damageRoll.terms[0].results;
    d['damageType'] = data.damageType;
    d['ap'] = data.ap;
    if (data.trick1) d['trick1'] = data.trick1;
    if (data.trick2) d['trick2'] = data.trick2;

    const chatData = getChatBaseData(actor);

    setRenderTemplate(damageRoll, 'systems/fantasycraft/templates/chat/damage-chat.hbs', damageInfo, chatData);

}
export function linkOptionFromContextMenu(element, actor)
{
    let option = actor.items.get(element.data("item-id"));

    let chatdata = getChatBaseData(actor);

    let template = 'systems/fantasycraft/templates/chat/';
    if (option.type == "spell")
        template += 'spellCard-chat.hbs';
    else 
        template += 'feature-chat.hbs';

    setDicelessRenderTemplate(template, option, chatdata);
}

export function linkOption(event)
{
    event.preventDefault()
    let element = event.currentTarget.parentElement.parentElement.dataset;
    let actor = game.actors.get(element.actorId);
    let spell = actor.items.get(element.optionId);

    let chatdata = getChatBaseData(actor);

    let template = 'systems/fantasycraft/templates/chat/spellCard-chat.hbs';

    setDicelessRenderTemplate(template, spell, chatdata);
}

async function spellCasting(event)
{
    event.preventDefault()
    let element = event.currentTarget.parentElement;
    let parentElement = element.parentElement;
    let act = game.actors.get(parentElement.dataset.actorId)
    let skillName ="spellcasting"
    let spell = act.items.get(parentElement.dataset.optionId)
    act.rollSkillCheck(skillName, act, spell);
}

function spellDamage(event)
{
    event.preventDefault()
    let element = event.currentTarget.parentElement;
    let parentElement = element.parentElement;
    let actor = game.actors.get(parentElement.dataset.actorId)
    let spell = actor.items.get(parentElement.dataset.optionId)
    let dmg = spell.system.damage;
    let damageBase = (dmg.flatOrRandom == "flat") ? dmg.flatDamage : dmg.diceNum;
    let scaleBy = (actor.type == "character") ? actor.system.castingLevel : actor.system.threat;
    let scalingValue = (dmg.scaling > 0 ) ? Math.ceil(scaleBy / dmg.scaling) : 0;
    let scaledDamage = ((damageBase * scalingValue) > dmg.maxDamage) ? dmg.maxDamage : damageBase * scalingValue;
    let formula;

    const data = 
    {
        damageType: spell.system.damage.damageType,
        maximum: false
    }

    if (dmg.flatOrRandom == "flat")
    {
        if(!dmg.bonusDamage)
            formula = (scalingValue) ? (scaledDamage).toString() : damageBase.toString();
     
        //I don't think a single spell uses this currently, but just future proofing. 
        else
            formula = damageBase.toString() + " + " + (dmg.bonusDamage * scalingValue).toString();

        rollDamageAndSendToChat(formula, actor, spell, data)
        return;
    }

    if (dmg.flatOrRandom == "random")
    {
        if(!dmg.bonusDamage)
            formula = (scalingValue) ? (scaledDamage).toString() + dmg.diceSize : damageBase.toString() + dmg.diceSize;
        else
            formula = damageBase.toString() + dmg.diceSize + " + " + (dmg.bonusDamage * scalingValue).toString();


        rollDamageAndSendToChat(formula, actor, spell, data)
        return;
    }
}

function applyDamage(event)
{
    event.preventDefault()
    let element = event.currentTarget.parentElement;
    let parentElement = element.parentElement;
    let attacker = game.actors.get(parentElement.dataset.ownerId)
    let ap = element.dataset.ap;
    let trick1 = (parentElement.dataset.trick1 != "") ? attacker.items.get(parentElement.dataset.trick1) : ""
    let trick2 = (parentElement.dataset.trick2 != "") ? attacker.items.get(parentElement.dataset.trick2) : ""
     
    let targets = Utils.getTargets();

    if (event.currentTarget.innerText == game.i18n.localize("fantasycraft.normal"))
        targets.forEach(token => token.actor.applyDamage(parseInt(element.dataset.damage), {damageType: element.dataset.type, ap: ap, trick1: trick1, trick2: trick2}));

    //Crit
    if (event.currentTarget.innerText == game.i18n.localize("fantasycraft.criticalHit"))
        targets.forEach(token => token.actor.applyDamage(parseInt(element.dataset.damage), {damageType: element.dataset.type, crit: true, ap: ap, trick1: trick1, trick2: trick2}));

    //halfDamage
    if (event.currentTarget.innerText == game.i18n.localize("fantasycraft.half"))
        targets.forEach(token => token.actor.applyDamage(Math.floor(parseInt(element.dataset.damage)/2), {damageType: element.dataset.type, ap: ap, trick1: trick1, trick2: trick2}));

}


function minimumDamage(event)
{
    event.preventDefault();
    let element = event.currentTarget.parentElement;
    let parentElement = element.parentElement;
    let attacker = game.actors.get(parentElement.dataset.ownerId)
    let weapon = attacker.items.get(parentElement.dataset.itemId);
    let trick = (attacker.items.get(parentElement.dataset.trick1).system.effect.additionalEffect == "minimumDamage") ? attacker.items.get(parentElement.dataset.trick1) : attacker.items.get(parentElement.dataset.trick2);
    let damage = (attacker.system.abilityScores[trick.system.effect.secondaryCheck].mod > 1) ? attacker.system.abilityScores[trick.system.effect.secondaryCheck].mod : 1;

    let targets = Utils.getTargets();

    targets.forEach(token => token.actor.applyDamage(parseInt(damage), {damageType: weapon.system.damageType}));
}


function applyImparement(event)
{
    event.preventDefault();
    let element = event.currentTarget.parentElement.parentElement.dataset;
    let act = game.actors.get(element.ownerId);

    let attribute = act.items.get(element.trick1).system.effect.secondaryCheck;

    let targets = Utils.getTargets();

    targets.forEach(token => token.actor.applyImparement(attribute));
}

function applyCondition(event, condition="")
{
    event.preventDefault();
    let element = event.currentTarget.parentElement.parentElement.dataset;
    let act = game.actors.get(element.ownerId);
    let item = act.items.get(element.itemId); 
    let targets = Utils.getTargets();  //get the actors that it will be applied to


    //get the condition that will be applied
    if (condition == "" && item.system?.attackType != "extraSave")
        condition = act.items.get(element.trick1).system.effect.secondaryCheck;

    if (condition == "" && item.system?.attackType == "extraSave")
    {
        let attackType = item.system.attackDescription;
        if (attackType == "drainingSoul" || attackType == "drainingLife" || attackType == "drainingAttribute")
        {
            //handle draining attacks
            drainingAttacks(attackType, act, targets);
            return;
        }
        condition = item.system.attackDescription.replace('ing', '');
        condition = CONFIG.statusEffects.find(e => e.id.includes(condition)).id;
    }

    targets.forEach(token => token.actor.applyCondition(condition));
}

function drainingAttacks(attackType, actor, targets)
{
    if (attackType == "drainingSoul")
    {
        (targets.forEach(function(token){
            //if standard, they die
            if (token.actor.type == "npc") token.actor.applyCondition("dead");

            //if special, reduce max vitality, reduce current vitality if it's now more than max
            if (token.actor.type == "character")
            {
                //this.system.conditions.soulDrain = (!!this.system.conditions.soulDrain) ? this.system.conditions.soulDrain += 1 : 1;

                token.actor.applyCondition("drainingSoul");

                //reduce current AD by 1 to a minimum of 0
                token.actor.system.actionDice = (token.actor.system.actionDice > 0) ? token.actor.system.actionDice -- : 0;
            }
        }))
    }
    else if (attackType == "drainingLife")
    {
        targets.forEach(token => token.actor.applyDamage(actor.system.threat, {damageType: 'lethal', ap: 9999}));
    }
}

function healVitality(event)
{
    event.preventDefault();
    let element = event.currentTarget.parentElement.parentElement.dataset;
    let act = game.actors.get(element.ownerId);

    let healing = act.items.get(element.trick1).system.effect.secondaryCheck;

    act.applyHealing(healing, "vitality")
}