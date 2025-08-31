import { BlockPermutation, world } from "@minecraft/server";

const sideAttachmentCache = new Map();
function posKey(b){ return `${b.location.x},${b.location.y},${b.location.z},${b.dimension.id}`; }

function faceDir(f){
  switch(f){
    case "north": return {x:0,z:1};
    case "south": return {x:0,z:-1};
    case "east": return {x:-1,z:0};
    case "west": return {x:1,z:0};
    default: return {x:0,z:0};
  }
}

export function registerSideAttachment(registry){
  world.afterEvents.playerBreakBlock.subscribe(ev => invalidateNeighbors(ev.block.location, ev.block.dimension.id));
  world.afterEvents.playerInteractWithBlock.subscribe(ev => invalidateNeighbors(ev.block.location, ev.block.dimension.id));

  function invalidateNeighbors(loc, dimId){
    const dirs = [ [1,0,0],[-1,0,0],[0,0,1],[0,0,-1] ];
    for (const [dx,dy,dz] of dirs){
      const key = `${loc.x+dx},${loc.y+dy},${loc.z+dz},${dimId}`;
      sideAttachmentCache.delete(key);
    }
  }

  registry.registerCustomComponent('cc:side_attachment', {
    tickInterval: 5,
    onPlace({ block, dimension }, { params }) {
      validateOrRotate(block, dimension, params);
    },
    onTick({ block }, { params }) {
      validateOrRotate(block, block.dimension, params);
    }
  });
}

function validateOrRotate(block, dim, params){
  try {
    const supportList = new Set(params?.support_blocks || ["minecraft:birch_log","minecraft:birch_wood"]);
    const faces = ["north","south","east","west"];
    const face = block.permutation.getState?.("minecraft:block_face");
    const key = posKey(block);
    if (sideAttachmentCache.has(key)) return;

    function hasSupport(f){
      const d = faceDir(f);
      const b = dim.getBlock({x:block.location.x + d.x, y:block.location.y, z:block.location.z + d.z});
      return b && supportList.has(b.typeId);
    }
    if (hasSupport(face)) { sideAttachmentCache.set(key,true); return; }

    for (const f of faces){
      if (hasSupport(f)){
        block.setPermutation(BlockPermutation.resolve(block.typeId, { "minecraft:block_face": f }));
        sideAttachmentCache.set(key,true);
        return;
      }
    }
  } catch(e) { world.sendMessage(e.message); }
}
