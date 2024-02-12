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