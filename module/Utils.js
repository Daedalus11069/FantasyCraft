export function getTargets() 
{
    return [...game.user.targets]
}


export function numeralConverter(grade)
{
  if (grade == "I") return 1;
  else if (grade == "II") return 2;
  else if (grade == "III") return 3;
  else if (grade == "IV") return 4;
  else if (grade == "V") return 5;
  else if (grade == "VI") return 6;
  else if (grade == "VII") return 7;
  else if (grade == "VIII") return 8;
  else if (grade == "IX") return 9;
  else if (grade == "X") return 10;
  else return 0
}

export function numberToNumeralConverter(number)
{
    if (number == 1) return "I";
    else if (number == 2) return "II";
    else if (number == 3) return "III";
    else if (number == 4) return "IV";
    else if (number == 5) return "V";
    else if (number == 6) return "VI";
    else if (number == 7) return "VII";
    else if (number == 8) return "VIII";
    else if (number == 9) return "IX";
    else if (number == 10) return "X";
    else return ""
}

export function returnPlusOrMinusString(number)
{
  let negative;
  number = parseInt(number); //insure that the number is an int rather than a string

  if (number < 0)
  {
    negative = true
    number = number * -1;
  }
    return !negative ? " + " + number : " - " + number;
}

export function getCharmBonus(item, greater)
{
  return (!greater) ? Math.ceil(item.system.itemLevel/6) : Math.round((item.system.itemLevel-0.01)/4)+2;
}

export function getSpecificEssence(item, essenceName)
{
  for (let essence of Object.entries(item.system.essences))
  {
    if (essence[1]?.ability == essenceName)
      return essence;
  }
  
  return null;
}

export function getSpecificCharm(item, charmName)
{
  for (let charm of Object.entries(item.system.charms))
  {
    if (charm[1]?.ability == charmName)
      return charm;
  }

  return null;
}

export function alphabatize(a, b)
{
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
}

export function getMagicItems(actor)
{
  let magicItems = actor.items.filter(item => item.system?.isMagic == true);

  magicItems = magicItems.filter(item => (item.type == "weapon" && item.system.readied) || (item.type == "armour" && item.system.equipped) || item.type == "general");

  return magicItems;
}


//Reset abilities that have uses 'per X'
export function resetAbilityUsage(combatant, duration)
{
  let tricks = combatant.items.filter(item => item.type =="trick")
  let updateString = "system.uses.usesRemaining"
  for (let trick of Object.entries(tricks))
  {
    trick = trick[1];
    if (trick.system.uses.timeFrame == duration)
    {
      trick.update({[updateString]: trick.system.uses.maxUses});
    }
  }
}

export async function createMacro(data, type, slot)
{
  let newData = {};
  let icon;
  console.log("test")
  if (type == "Item")
  {
    if (game.user.isGM)
      return;

    newData = await fromUuid(data.uuid);
  }
  else if (type == undefined)
  {
    newData.name = "Unarmed Strike";
  }

  const name = newData.name;
  const id = newData.id;
  let command;

  if (type == undefined || newData.type == "weapon" || newData.type == "attack")
    command = attackMacro(name);
  if (newData.type == "spell")
    command = spellMacro(name, id);

  let macro = game.macros.find(
    (macro) => macro.name === name && macro.command === command
  );

  if (newData.type == "weapon")
    icon = newData.img;
  else if (newData.type == "attack")
    icon = "icons/svg/pawprint.svg";
  else if (newData.type == "spell")
    icon = "icons/svg/fire.svg";
  else 
    icon = "icons/svg/dice-target.svg";

  if (!macro) {
    macro = await Macro.create({
      name: name,
      type: 'script',
      img: icon,
      command: command,
    });
  }

  game.user.assignHotbarMacro(macro, slot);

  return false;
}

function attackMacro(name)
{
  return ` let weapon = game.user.character.items.find(i => i.name == "${name}")

  if ("${name}" == "Unarmed Strike")
    game.user.character.rollUnarmedAttack(weapon, event.shiftKey)
  else if (weapon.type == "weapon" && weapon.system.readied)
    game.user.character.rollWeaponAttack(weapon, event.shiftKey)
  else if (weapon.type == "weapon" && !weapon.system.readied)
    ui.notifications.warn("This Weapon is not Readied")
  else if (weapon.type == "attack")
    game.user.character.rollNaturalAttack(weapon, event.shiftKey)
  `
}

function spellMacro(name, id)
{
  return `let spell = game.user.character.items.find(i => i.name == "${name}")

  game.user.character.sheet._spellCard(event, "${id}", true)
  `
}