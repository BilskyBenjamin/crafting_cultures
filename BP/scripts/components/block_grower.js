import { BlockPermutation } from "@minecraft/server";
import { tryGrowBlock } from "../helpers.js";

export function registerBlockGrower(registry){
  registry.registerCustomComponent('cc:block_grower', {
    onTick({ block }, { params }) {
      if (Math.random()<0.001){
        const blockToPlace = params.block_to_place || 'cc:sweetgrass';
        tryGrowBlock(block, blockToPlace);
      }
    }
  });
}
