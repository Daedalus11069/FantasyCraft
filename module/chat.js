import * as Utils from "./Utils.js";
import * as Tricks from "./Tricks.js";
import { fantasycraft } from "./config.js";

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
        token: actor.token,
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
    d['formula'] = diceRoll.formula
    d['diceRoll'] = diceRoll.terms[0].results[0].result
    if (dc != 0) d['dc'] = dc;
    d['success'] = (dc != 0 && dc < diceRoll.total) ? true : false;

    const chatData = getChatBaseData(actor);

    setRenderTemplate(diceRoll, 'systems/fantasycraft/templates/chat/skill-chat.hbs', rollInfo, chatData);
}

export function onSkillCheck(diceRoll, actor, skillName, flawless, trick = null)
{
    let skill = actor.type == "character" ? actor.system.skills[skillName] : actor.system.signatureSkills[skillName];
    
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
    
    if (actor.type == "npc" && skillName != "spellcasting" && skillName != "competence") 
        skillName = actor.system.signatureSkills[skillName].skillName;

    const rollInfo = 
    {
        actor: actor,
        skill: skill,
        rollDescription: skillName,
        data: {}
    }

    const d = rollInfo.data
    d['roll'] = (flawless > diceRoll.total) ? flawless : diceRoll.total;
    d['formula'] = diceRoll.formula;
    d['diceRoll'] = diceRoll.terms[0].results[0].result;
    d['threat'] = (diceRoll.dice[0].results[0].result >= skill.threat) ? true : false;
    d['error'] = (diceRoll.dice[0].results[0].result <= skill.error || diceRoll.total < 0) ? true : false;
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

export function onAttack(attackRoll, attacker, item, trick=null, trick2=null, additionalInfo, ammo)
{
    const threat = (trick?.system.effect.additionalEffect == "replaceAttackRoll") ? attacker.system.skills[trick.system.effect.secondaryCheck].threat : item.system.threatRange;

    const attackInfo = setUpAttackData(attackRoll, attacker, item, threat, item.system.weaponProperties, ammo);
 
    setUpTricks(attackInfo, this, trick)
    setUpTricks(attackInfo, this, trick2)

    const chatData = getChatBaseData(attacker)

    setRenderTemplate(attackRoll, 'systems/fantasycraft/templates/chat/weapon-chat.hbs', attackInfo, chatData);
}

export function onCombatAction(actionRoll, actor, combatAction, trick=null)
{
    //TODO get threatrange for each skill/attack for combat actions
    let threat = 20;
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
    d['diceRoll'] = actionRoll.terms[0].results[0].result;
    d['threat'] = (actionRoll.total >= threat) ? true: false;
    if (trick != null) d['trick'] = trick

    if (damage.value != "") 
    {
        d['hasDamage'] = true;
        d['damageFormula'] = damage.value;
        d['damageType'] = damage.type;
    }
    
    //setUpTricks(actionInfo, this, trick)
    
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

export function onNaturalAttack(attackRoll, attacker, item, trick, trick2, supernaturalAttack)
{
    const attackInfo = setUpAttackData(attackRoll, attacker, item, item.system.threatRange, item.system.naturalUpgrades);
 
    const d = attackInfo.data
    d['areaSize'] = item.system.area.value * CONFIG.fantasycraft.areaRangeMultiplier[item.system.area.shape]
    d['areaShape'] = item.system.area.shape
    d['properties'] = CONFIG.fantasycraft.attackPropertiesList

    setUpTricks(attackInfo, this, trick)
    setUpTricks(attackInfo, this, trick2)

    const chatData = getChatBaseData(attacker)

    setRenderTemplate(attackRoll, 'systems/fantasycraft/templates/chat/natural-chat.hbs', attackInfo, chatData);
}

//duplicated code between natural attack and natural attack moved into 1 function.
function setUpAttackData(attackRoll, attacker, item, threat, qualities, ammo=null)
{
    const attackInfo = 
    {
        actor: attacker,
        item: {id: item.id, data: item, name: item.name},
        data: {}
    }

    const d = attackInfo.data
    d['roll'] = attackRoll.total;
    d['formula'] = attackRoll.formula
    d['diceRoll'] = attackRoll.terms[0].results[0].result
    d['qualities'] = qualities;
    d['threat'] = (attackRoll.dice[0].results[0].result >= threat) ? true : false;
    d['error'] = (attackRoll.dice[0].results[0].result <= item.system.errorRange || attackRoll.total < 0) ? true : false;
    d['target'] = (Utils.getTargets().length > 0) ? Utils.getTargets()[0].document.actor._id : "";
    d['ammo'] = (!!ammo) ? ammo._id : null;
    d['attackType'] = item.system.attackType;
    if (item.system?.attackType == "extraSave") d['saveType'] = game.i18n.localize(CONFIG.fantasycraft.extraordinarySaveDescription[item.system.attackDescription])

    if (attacker.items.find(item => item.system.inStance && (item.system.effect1.effect == "maxDamage" || item.system.effect2.effect == "maxDamage")))
        d['maxDamage'] = true;


    return attackInfo;
}

function setUpTricks(attackInfo, attacker, trick)
{
    if (trick == null)
        return;

    const trickEffect = trick.system.effect?.additionalEffect;
    let trickTarget;
    if (trickEffect)
        trickTarget = trick.system.effect.secondaryCheck;
    
    const d = attackInfo.data;
    const dTrick = (d['trick1'] == null) ? 'trick1' : 'trick2';
    d[dTrick] = trick;

    return attackInfo;
}

async function onDamage(event)
{
    const li = event.currentTarget.closest(".chat-card");
    const attackRoll = {
        total: event.currentTarget.parentElement.dataset.attackRoll
    }
    const actor = game.actors.get(li.dataset.ownerId);
    const speaker = ChatMessage.getSpeaker();
    const token = ChatMessage.getSpeakerActor(speaker);
    const item = token.items.get(li.dataset.itemId);
    const target = game.actors.get(li.dataset.targetId);
    const trick1 = actor.items.get(li.dataset.trick1);
    const trick2 = actor.items.get(li.dataset.trick2);
    const ammo = token.items.get(li.dataset.ammo);
    const maxDamage = event.currentTarget.innerText == game.i18n.localize("fantasycraft.maxDamage") ? true : false;
    const ap = event.currentTarget.parentElement.dataset.ap;
    let damageModifiers;
    let damageDice;
    let abilityMod = "strength";
    let itemInformation;
    let damageType = (event.currentTarget.parentElement.dataset.damageType != null) ? event.currentTarget.parentElement.dataset.damageType : "lethal";
    let sneakAttack = actor.system.sneakAttack;

    const damageFormula = event.currentTarget.parentElement.dataset.damageFormula;
    if (damageFormula)
    {
        rollDamageAndSendToChat(damageFormula, token, itemInformation, damageType, ap, trick1)
        return;
    }

    if (!!item){
        if (item.type == "weapon")
        {
            let weaponProperties = item.system.weaponProperties;
            let weaponCategory = item.system.weaponCategory;
            if (weaponProperties.finesse && token.system.abilityScores.dexterity.mod > token.system.abilityScores.strength.mod)
                abilityMod = "dexterity"

            if (item.system.attackType == "ranged" && weaponCategory != "thrown")
                abilityMod = ""

            damageDice = (!!ammo) ? ammo.system.damage : item.system.damage;
            let superior = (item.system.upgrades.materials == "Superior") ? 1 : 0

            damageModifiers = [];

            //ability mod, tricks, class bonus, all out attack/bullseye, magic, moral bonuses, misc, sneak attack dice
            if (abilityMod != "") 
            {
                if (weaponCategory == "thrown" && token.items.find(item => item.name == game.i18n.localize("fantasycraft.hurledBasics")))
                    damageModifiers.push(token.system.abilityScores[abilityMod].mod * 2)
                else
                    damageModifiers.push(token.system.abilityScores[abilityMod].mod)
            }
            if (superior != 0) damageModifiers.push(superior)
            if (token.system?.powerAttack && (item.system.attackType == "melee" || item.system.attackType == "unarmed")) damageModifiers.push(actor.system.powerAttack * 2);
            if (token.system?.powerAttack && (item.system.attackType == "ranged")) damageModifiers.push(actor.system.powerAttack);
        }

        if (item.type =="attack")
        {
            let featBonus = 0
            damageDice = item.system.damage.value;
      
            if (token.system.martialArts) featBonus += 2
            if (token.system.mastersArt)
            { 
                abilityMod = (token.type == "character") ? token.system.defense.ability.name : token.system.defense.defenseAttribute;
                featBonus += 2
            }

            if (item.system.attackType == "naturalAttack")
            {
                damageModifiers = 
                [
                    token.system.abilityScores[abilityMod].mod,
                ];

                if (featBonus > 0) damageModifiers.push(featBonus)
            }
        }
        itemInformation = {id: item.id, data: item, name: item.name};
        damageType = (!!ammo) ? ammo.system.damageType : item.system.damageType;
    } else 
    {
        let featBonus = 0
        damageModifiers = [];
        damageDice = actor.system.unarmedDamage;

        if (actor.system.martialArts) featBonus += 2
        if (actor.system.mastersArt)
        { 
            abilityMod = (this.type == "character") ? actor.defense.ability.name : actor.defense.defenseAttribute;
            featBonus += 2
        }

        //ability mod, tricks, class bonus, all out attack/bullseye, magic, moral bonuses, misc, sneak attack dice
        if (abilityMod != "") damageModifiers.push(actor.system.abilityScores[abilityMod].mod)
        if (featBonus > 0) damageModifiers.push(featBonus)
        

        itemInformation = {id: "", data:actor.system.attackTypes.unarmed, name: "Unarmed Attack"}

        damageType = actor.system.attackTypes.unarmed.damageType;
    }

    //Add any Stance bonus
    let stances = actor.items.filter(item => item.type == "stance" && item.system.inStance);
    if (stances.length > 0)
    {
      if (stances[0].system.effect1.effect == "damageBonus") damageModifiers.push(stances[0].system.effect1.bonus)
      if (stances[0].system.effect2.effect == "damageBonus") damageModifiers.push(stances[0].system.effect2.bonus)
    }

    //Add any magic item damage bonus
    let magicItems = Utils.getMagicItems(token);
    let magicBonus = 0;

    if (magicItems.length > 0)
    {
        for (let mi of magicItems)
        {
            let charm = Utils.getSpecificCharm(mi, "damageBonus");
            
            if (charm != null && (charm[1].target == item.system.attackType || mi == item))
                magicBonus = (Utils.getCharmBonus(mi, charm[1].greater) > magicBonus) ? Utils.getCharmBonus(mi, charm[1].greater) : magicBonus;
        }
    }
    if (magicBonus > 0)
        damageModifiers.push(magicBonus);
    
    let rollFormula = [damageDice].concat(damageModifiers).join(" + ");
    
    const rollInfo = await preRollDialog(itemInformation.name, "systems/fantasycraft/templates/chat/damageRoll-Dialog.hbs", rollFormula, null)
    if (rollInfo == null) return;
    
    if(rollInfo?.morale) rollFormula += Utils.returnPlusOrMinusString(rollInfo.morale);
    if(rollInfo?.sneakAttack.checked) 
    {
        if (actor.type != "character")    
        {
            let sneakAttackItem = actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.sneakAttack"));
            sneakAttack = Utils.numeralConverter(sneakAttackItem[0].system.grades.value)
        }

        rollFormula += " + " + sneakAttack + "d6";
    }

    if ((trick1?.system.effect.additionalEffect == "bonusDamage" && Tricks.checkConditions(trick1, target)) || (trick2?.system.effect.additionalEffect == "bonusDamage" && Tricks.checkConditions(trick2, target)))
        rollFormula = rollFormula + " + " + li.dataset.bonusDamage;

    rollDamageAndSendToChat(rollFormula, actor, itemInformation, damageType, ap, trick1, trick2, maxDamage)

    if ((trick1?.system.effect.additionalEffect == "bonusWeaponDamage" && Tricks.checkConditions(trick1, target, attackRoll)) || (trick2?.system.effect.additionalEffect == "bonusWeaponDamage" && Tricks.checkConditions(trick2, target, attackRoll)))
    {
        if (Tricks.multipleDamageRolls(attackRoll, target, trick1) == 1)
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damageType, ap, trick1, trick2)
        else if (Tricks.multipleDamageRolls(attackRoll, target, trick1) == 2)
        {
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damageType, ap, trick1, trick2)
            rollDamageAndSendToChat(rollFormula, actor, itemInformation, damageType, ap, trick1, trick2)
        }
    }
}

async function preRollDialog(attackName, template, formula, tricks=null)
{
    const content = await renderTemplate(template, {
        formula: formula,
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

function rollDamageAndSendToChat(rollFormula, actor, itemInformation, damageType, ap=0, trick1=null, trick2=null, maximum = false)
{
    if (trick1?.system.effect.damageModifierStyle == "halfDamage" || trick2?.system.effect.damageModifierStyle == "halfDamage")
    {
        rollFormula = "(" + rollFormula + ") / 2"
    }

    const damageRoll = new Roll(rollFormula)
    if (maximum) 
        damageRoll.evaluate({maximize: true, async: false})
    else
        damageRoll.evaluate({async: false})

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
    d['damageType'] = damageType;
    d['ap'] = ap;
    if (trick1) d['trick1'] = trick1;
    if (trick2) d['trick2'] = trick2;

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
    let actor = act.system;
    let skillName ="spellcasting"
    let spell = act.items.get(parentElement.dataset.optionId)
    let tricks = act.items.filter(item => (item.type == "trick" && item.system.trickType.keyword == "spellcasting"));
    let skill = act.type == "character" ? actor.arcane[skillName] : actor[skillName];
    let trick = null;
    let skillModifiers = []

    let magicItems = Utils.getMagicItems(act);
    let magicBonus = 0;

    //ranks, ability mod, misc, threat range
    if (act.type == "character")
    {
        if (!skill.ranks) skill.ranks = 0;
        let arcaneMight = 0;
        if (spell.system.arcaneMight)
            arcaneMight = 2;
        skillModifiers =
        [
            actor.abilityScores[skill.ability].mod,
            skill.ranks,
            skill.misc,
            arcaneMight
        ]
    }
    else if (act.type == "npc")
    {
        skillModifiers = 
        [
            actor.abilityScores.intelligence.mod,
            actor[skillName].value
        ]
    }

    if (magicItems.length > 0)
    {
        for (let item of magicItems)
        {
            let charm = Utils.getSpecificCharm(item, "skillRanks")
            if (charm != null && charm[1].target == skillName)
            magicBonus = (Utils.getCharmBonus(item, charm[1].greater) > magicBonus) ? Utils.getCharmBonus(item, charm[1].greater) : magicBonus;
        }
    }

    if (magicBonus > 0)
        skillModifiers.push(magicBonus);

    let rollFormula = ["1d20"];
    for (let bonus of skillModifiers)
    {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
    }

    const rollInfo = await preRollDialog("spellcasting", "systems/fantasycraft/templates/chat/attackRoll-Dialog.hbs", rollFormula, tricks);
    if (rollInfo == null) return;

    //check for spellcasting trick
    if (rollInfo.trick.value != "")
        trick = act.items.get(rollInfo.trick.value);

    //roll the dice
    const skillRoll = new Roll(rollFormula)
    skillRoll.evaluate({async: false})

    onSkillCheck(skillRoll, act, skillName, null, trick);

    if (act.tpe =="character")
    {
        //reduce spellpoints by the spell level, or spell level modified by the trick
        let spellPointCost = parseInt(spell.system.level);
        if (trick != null)
            spellPointCost += trick.system.effect.secondaryCheck;

        await act.update({"system.arcane.spellPoints": actor.arcane.spellPoints - spellPointCost});
    }
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

    if (dmg.flatOrRandom == "flat")
    {
        if(!dmg.bonusDamage)
            formula = (scalingValue) ? (scaledDamage).toString() : damageBase.toString();
     
        //I don't think a single spell uses this currently, but just future proofing. 
        else
            formula = damageBase.toString() + " + " + (dmg.bonusDamage * scalingValue).toString();

        rollDamageAndSendToChat(formula, actor, spell, dmg.damageType)
        return;
    }

    if (dmg.flatOrRandom == "random")
    {
        if(!dmg.bonusDamage)
            formula = (scalingValue) ? (scaledDamage).toString() + dmg.diceSize : damageBase.toString() + dmg.diceSize;
        else
            formula = damageBase.toString() + dmg.diceSize + " + " + (dmg.bonusDamage * scalingValue).toString();


        rollDamageAndSendToChat(formula, actor, spell, dmg.damageType)
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