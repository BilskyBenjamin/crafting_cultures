// Item component cc:smudgeable holds effect parameters for smudging items
export function registerSmudgeable(itemRegistry){//"effect":,"duration":,"amount":
  itemRegistry.registerCustomComponent('cc:smudgeable', {
    // purely data container; no behavior
  });
}
