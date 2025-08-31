import { ItemStack } from "@minecraft/server";

const DEBUG = true;
const log = (...args) => { if (DEBUG) console.warn('[cc:dryable]', ...args); };

export function registerDryable(registry){
  registry.registerCustomComponent('cc:dryable', {
    onTick(e, custom){
      const block = e.block;
      const params = custom?.params;
      const chance = params.dry_chance || 0.002;
      let dryStage = 0; try { dryStage = block.permutation.getState('cc:dry_stage')?.value || 0; } catch(e) {log(e)}
      if (dryStage === 1) return;
      if (Math.random() < chance){
        try { block.setPermutation(block.permutation.withState('cc:dry_stage',1)); } catch(e) {log(e)}
      }
    },
    onPlayerInteract(e, custom){
      const block = e.block;
      const params = custom?.params || {};
      const dropItem = params.drop_item || 'minecraft:air';
      try {
        const dryStage = block.permutation.getState('cc:dry_stage')?.value || 0;
        if (dryStage === 1 && dropItem !== 'minecraft:air'){
          block.dimension.spawnItem(new ItemStack(dropItem, params.drop_amount || 1), block.center());
          block.setPermutation(block.permutation.withState('cc:dry_stage',0));
        }
      } catch(e) {log(e)}
    }
  });
}
