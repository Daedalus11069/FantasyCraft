import {resetAbilityUsage} from './Utils.js';

const _createCondition = (name, icon, changes = []) => ({
    id: name,
    name: game.i18n.localize("fantasycraft." + name),
    img: icon,
    transfer: true,
    duration: {},
    flags: {
      sourceType: 'condition',
      permanent: false,
    },
    changes: changes
})

const _addEffect = (key, value) => ({
    key: key,
    value: value,
    mode: CONST.ACTIVE_EFFECT_MODES.ADD
  })

export function onCombatEnd(combatant)
{
    clearStances(combatant)
    resetAbilityUsage(combatant, "combat");
}

//go through all stances on the character and disable any that the character is still in.
function clearStances(combatant)
{
    let stances = combatant.items.filter(item => item.type == "stance" && item.system.inStance);

    if (stances.length > 0)
    {
        combatant.removeCondition("stance")
        stances[0].update({'system.inStance': false});

        stances[0].system.inStance = false;
    }
}

//clear short term status conditions
function clearStatusAilments(combatant)
{

}

export class Conditions {

    static createAllConditions()
    {
        const conditionsList = [];

        conditionsList.push(_createCondition('dead', 'icons/svg/skull.svg'));

        conditionsList.push(_createCondition('unconscious', 'icons/svg/unconscious.svg'));


        conditionsList.push(_createCondition('acid', 'icons/svg/acid.svg'));

        conditionsList.push(_createCondition('asleep', 'icons/svg/sleep.svg'));

        conditionsList.push(_createCondition('baffled', 'systems/fantasycraft/assets/icons/brain.svg',
        [
            _addEffect('system.conditionBonuses.allSkills', -2)
        ]));

        conditionsList.push(_createCondition('bleeding', 'icons/svg/blood.svg'));
        
        conditionsList.push(_createCondition('blinded', 'icons/svg/blind.svg',
            [
                _addEffect('system.conditionBonuses.attackMelee', -8),
                _addEffect('system.conditionBonuses.attackRanged', -8)
            ]
        ));

        conditionsList.push(_createCondition('burning', 'icons/svg/fire.svg'));
        
        conditionsList.push(_createCondition('deafened', 'icons/svg/deaf.svg'));
        
        conditionsList.push(_createCondition('enraged', 'systems/fantasycraft/assets/icons/enrage.svg'));
        
        conditionsList.push(_createCondition('entangled', 'icons/svg/net.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -2),
            _addEffect('system.conditionBonuses.attackRanged', -2),
            _addEffect('system.conditionBonuses.dexteritySkills', -4),
            _addEffect('system.conditionBonuses.speedMultiplier', 0.5),
        ]
        ));

        conditionsList.push(_createCondition('fatigued', '/systems/fantasycraft/assets/icons/tired-eye.svg',
        [
            _addEffect('system.conditionBonuses.strength', -2),
            _addEffect('system.conditionBonuses.dexterity', -2),
            _addEffect('system.conditionBonuses.speed', -5)
        ]
        ));
        
        conditionsList.push(_createCondition('fixated', '/systems/fantasycraft/assets/icons/smitten.svg'));
        
        conditionsList.push(_createCondition('flanked', '/systems/fantasycraft/assets/icons/face-to-face.svg'));
        
        conditionsList.push(_createCondition('flatFooted', '/systems/fantasycraft/assets/icons/cement-shoes.svg'));
        
        conditionsList.push(_createCondition('frightened', 'icons/svg/terror.svg'));
        
        conditionsList.push(_createCondition('held', 'systems/fantasycraft/assets/icons/grab.svg'));

        conditionsList.push(_createCondition('helpless', 'systems/fantasycraft/assets/icons/knockout.svg'));
        
        conditionsList.push(_createCondition('hidden', 'systems/fantasycraft/assets/icons/hidden.svg'));
        
        conditionsList.push(_createCondition('incorporeal', 'systems/fantasycraft/assets/icons/ghost.svg'));
        
        conditionsList.push(_createCondition('invisible', 'icons/svg/invisible.svg'));
        
        conditionsList.push(_createCondition('paralyzed', 'icons/svg/paralysis.svg'));
        
        conditionsList.push(_createCondition('pinned', 'systems/fantasycraft/assets/icons/pin.svg'));
        
        conditionsList.push(_createCondition('prone', 'systems/fantasycraft/assets/icons/despair.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -2),
        ]));
        
        conditionsList.push(_createCondition('shaken', 'systems/fantasycraft/assets/icons/salt-shaker.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -2),
            _addEffect('system.conditionBonuses.attackRanged', -2),
            _addEffect('system.conditionBonuses.wisdomSkills', -2),
            _addEffect('system.conditionBonuses.charismaSkills', -2)
        ]
        ));
        
        conditionsList.push(_createCondition('sickened', 'systems/fantasycraft/assets/icons/vomiting.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -2),
            _addEffect('system.conditionBonuses.attackRanged', -2),
            _addEffect('system.conditionBonuses.allSkills', -2),
            _addEffect('system.conditionBonuses.damage', -2),
            _addEffect('system.conditionBonuses.fortitude', -2),
            _addEffect('system.conditionBonuses.reflex', -2),
            _addEffect('system.conditionBonuses.will', -2),
        ]
        ));
        
        conditionsList.push(_createCondition('slowed', 'systems/fantasycraft/assets/icons/pocket-watch.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -1),
            _addEffect('system.conditionBonuses.attackRanged', -1),
            _addEffect('system.conditionBonuses.defense', -1),
            _addEffect('system.conditionBonuses.reflex', -1),
            _addEffect('system.conditionBonuses.speedMultiplier', 0.5),
        ]
        ));

        conditionsList.push(_createCondition('haste', 'systems/fantasycraft/assets/icons/stopwatch.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', 1),
            _addEffect('system.conditionBonuses.attackRanged', 1),
            _addEffect('system.conditionBonuses.reflex', 1)
        ]
        ));
        
        conditionsList.push(_createCondition('sprawled', 'icons/svg/falling.svg',
        [
            _addEffect('system.conditionBonuses.attackMelee', -1),
            _addEffect('system.conditionBonuses.attackRanged', -1),
        ]
        ));
        
        conditionsList.push(_createCondition('stunned', 'icons/svg/daze.svg'));

        conditionsList.push(_createCondition('stance', 'systems/fantasycraft/assets/icons/shield-bash.svg'));
        
        conditionsList.push(_createCondition('drainingSoul', 'icons/svg/sun.svg'));

        conditionsList.push(_createCondition('tainted', 'systems/fantasycraft/assets/icons/evil-heart.svg',
            [
                _addEffect('system.conditionBonuses.will', -2),
                _addEffect('system.conditionBonuses.charismaSkills', -2)
            ]
        ));

        return conditionsList;
    }
}