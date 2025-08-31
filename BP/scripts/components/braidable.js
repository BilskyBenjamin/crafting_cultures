import { ItemStack } from "@minecraft/server";

export function registerBraidable(itemRegistry){
  itemRegistry.registerCustomComponent('cc:braidable', {
    onUse({ source, itemStack }, { params }) {
      const equippable = source.getComponent("minecraft:equippable");
      if (!equippable) return { canceled: true };
      const offhand = equippable.getEquipment("Offhand");
      const requiredOffhand = params.required_offhand || "cc:sweetgrass_bundle";
      const requiredAmount = params.required_amount || 3;
      if (itemStack.amount !== 1) return { canceled: true };
      if (offhand?.typeId !== requiredOffhand || offhand.amount !== requiredAmount) return { canceled: true };
      return { canceled: false };
    },
    onCompleteUse({ source }, { params }) {
      const equippable = source.getComponent("minecraft:equippable");
      if (!equippable) return;
      const resultItem = params.result_item || "cc:incomplete_sweetgrass_braid_0";
      const resultDamage = params.result_damage || 3;
      const reward = new ItemStack(resultItem, 1);
      const durabilityComp = reward.getComponent("minecraft:durability");
      if (durabilityComp) durabilityComp.damage = resultDamage;
      equippable.setEquipment("Offhand", undefined);
      equippable.setEquipment("Mainhand", reward);
    }
  });
}
