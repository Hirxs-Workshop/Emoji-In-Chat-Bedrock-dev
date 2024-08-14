import { system, BlockPermutation, Direction, world, ItemStack } from "@minecraft/server"
import { switchBlockFaces, getPlayerYRot } from "tests/getTargetBlocks"
import { decrementStack } from "tests/items"
import { isReplaceable } from "tests/listReplaceables"

// Array of items to use this size preset
const ItemsSize2x1x1 = [
    `ff:cherry_couch_double`

];

for (const blockIDs of ItemsSize2x1x1) {
    world.beforeEvents.itemUseOn.subscribe(
        event => {
            const player = event.source;
            const item = event.itemStack.typeId;
            const dimension = player.dimension;

            // Item Validity Detection 
            if (!(item.match(blockIDs))) return

            // Event Debounce
            const oldLog = console.log[JSON.stringify(item)];
            console.log[JSON.stringify(item)] = Date.now();
            if ((oldLog + 150) >= Date.now()) return

            // Block Target Detection: Supply Target block and facing direction
            const targetBlock = switchBlockFaces(event, Direction)

            // Block Adjacency Detection: Supply blocks Adjecent to the Target block for each cardinal rotation
            const direction = getPlayerYRot(event.source)
            let adjacentBlock
            switch (getPlayerYRot(event.source)) {
                // Facing North
                case 2:
                    adjacentBlock = targetBlock.east()
                    break
                // Facing East
                case 3:
                    adjacentBlock = targetBlock.south()
                    break
                // Facing South
                case 0:
                    adjacentBlock = targetBlock.west()
                    break
                // Facing West
                default:
                    adjacentBlock = targetBlock.north()
                    break
            }

            // Block Placeability Tests: Cancel if the Target or Adjacent blocks are invalid
            if (!(isReplaceable(targetBlock) && isReplaceable(adjacentBlock))) return

            // Block Placement: Place the actual blocks, and replace the current item with nothing 
            //   (We need not decrement the stack with a single item stack size)
            system.run(
                () => {
                    decrementStack(player, item)
                    targetBlock.setPermutation(BlockPermutation.resolve(
                        item, { "ff:direction": direction, "ff:width_piece": 0, "ff:is_placed": 1 }
                    ))
                    adjacentBlock.setPermutation(BlockPermutation.resolve(
                        item, { "ff:direction": direction, "ff:width_piece": 1, "ff:is_placed": 1 }
                    ))
                    dimension.spawnParticle("ff:block.dust", targetBlock)
                    dimension.spawnParticle("ff:block.dust", adjacentBlock)
                    world.playSound('ff:placement.medium', player.location)

                    if (!(blockIDs.includes(`_couch_double`))) return
                }
            )
        }
    )

    world.beforeEvents.playerBreakBlock.subscribe(
        event => {
            const permutation = event.block.permutation

            if (!(permutation.matches(blockIDs))) return
            const destroyedBlock = event.block

            // Appropriate Tile Destruction: Retrace previous steps to destroy the appropriate blocks
            let adjacentBlock
            switch (true) {
                case permutation.matches(blockIDs, { "ff:direction": 2, "ff:width_piece": 0, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.east()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 3, "ff:width_piece": 0, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.south()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 0, "ff:width_piece": 0, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.west()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 1, "ff:width_piece": 0, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.north()
                    break

                case permutation.matches(blockIDs, { "ff:direction": 2, "ff:width_piece": 1, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.west()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 3, "ff:width_piece": 1, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.north()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 0, "ff:width_piece": 1, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.east()
                    break
                case permutation.matches(blockIDs, { "ff:direction": 1, "ff:width_piece": 1, "ff:is_placed": 1 }):
                    adjacentBlock = destroyedBlock.south()
                    break
            }
            if (adjacentBlock === void 0) return;
            system.run(
                () => {
                    adjacentBlock.setPermutation(BlockPermutation.resolve("minecraft:air"))
                }
            )
        }
    )
}
