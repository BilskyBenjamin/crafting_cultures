import { BlockPermutation, ItemStack } from "@minecraft/server";

export function tryGrowBlock(block, blockToPlace){
  const abovePos = { x:block.location.x, y:block.location.y+1, z:block.location.z };
  try {
    const aboveBlock = block.dimension.getBlock(abovePos);
    if (aboveBlock && aboveBlock.typeId === 'minecraft:air') {
      aboveBlock.setPermutation(BlockPermutation.resolve(blockToPlace));
    }
  } catch {}
}

export function trySpread(block){
  const directions = [ {x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1} ];
  const dir = directions[Math.floor(Math.random()*directions.length)];
  const targetPos = { x:block.location.x+dir.x, y:block.location.y, z:block.location.z+dir.z };
  try {
    const targetBlock = block.dimension.getBlock(targetPos);
    if (targetBlock && (targetBlock.typeId==='minecraft:dirt' || targetBlock.typeId==='minecraft:grass_block') && targetBlock.typeId!=='cc:sweetgrass_roots'){
      targetBlock.setPermutation(BlockPermutation.resolve('cc:sweetgrass_roots'));
    }
  } catch {}
}
