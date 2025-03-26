import { system, world } from '@minecraft/server';

const Lang = {
    'emojis': {
        ':grinning:': '',
        ':smiley:': '',
        ':smile:': '',
        ':grin:': '',
        ':laughing:': '',
        ':face_holding_back_tears:': '',
        ':sweat_smile:': '',
        ':joy:': '',
        ':rofl:': '',
        ':smiling_face_with_tear:': '',
        ':relaxed:': '',
        ':blush:': '',
        ':innocent:': '',
        ':slight_smile:': '',
        ':upside_down:': '',
        ':wink:': '',
        // 10 - 1F
        ':relieved:': '',
        ':heart_eyes:': '',
        ':smiling_face_with_3_hearts:': '',
        ':kissing_heart:': '',
        ':kissing:': '',
        ':kissing_smiling_eyes:': '',
        ':kissing_closed_eyes:': '',
        ':yum:': '',
        ':stuck_out_tongue:': '',
        ':stuck_out_tongue_closed_eyes:': '',
        ':stuck_out_tongue_winking_eye:': '',
        ':zany_face:': '',
        ':face_with_raised_eyebrow:': '',
        ':face_with_monocle:': '',
        ':nerd:': '',
        ':sunglasses:': '',
        // 20 - 2F
        ':disguised_face:': '',
        ':star_struck:': '',
        ':partying_face:': '',
        ':smirk:': '',
        ':unamused:': '',
        ':disappointed:': '',
        ':pensive:': '',
        ':worried:': '',
        ':confused:': '',
        ':slight_frown:': '',
        ':frowning2:': '',
        ':persevere:': '',
        ':confounded:': '',
        ':tired_face:': '',
        ':weary:': '',
        ':pleading_face:': '',
        // 30 - 3F
        ':cry:': '',
        ':sob:': '',
        ':triumph:': '',
        ':angry:': '',
        ':rage:': '',
        ':face_with_symbols_over_mouth:': '',
        ':exploding_head:': '',
        ':flushed:': '',
        ':hot_face:': '',
        ':cold_face:': '',
        ':face_in_clouds:': '',
        ':scream:': '',
        ':fearful:': '',
        ':cold_sweat:': '',
        ':disappointed_relieved:': '',
        ':sweat:': '',
        // 40 - 4F
        ':hugging:': '',
        ':thinking:': '',
        ':face_with_peeking_eye:': '',
        ':face_with_hand_over_mouth:': '',
        ':face_with_open_eyes_and_hand_over_mouth:': '',
        ':saluting_face:': '',
        ':shushing_face:': '',
        ':melting_face:': '',
        ':lying_face:': '',
        ':no_mouth:': '',
        ':dotted_line_face:': '',
        ':neutral_face:': '',
        ':face_with_diagonal_mouth:': '',
        ':expressionless:': '',
        ':shaking_face:': '',
        ':grimacing:': '',
        // 50 - 5F
        ':rolling_eyes:': '',
        ':hushed:': '',
        ':frowning:': '',
        ':anguished:': '',
        ':open_mouth:': '',
        ':astonished:': '',
        ':yawning_face:': '',
        ':sleeping:': '',
        ':drooling_face:': '',
        ':sleepy:': '',
        ':dizzy_face:': '',
        ':zipper_mouth:': '',
        ':woozy_face:': '',
        ':nauseated_face:': '',
        // 60 - 6F
        ':face_vomiting:': '',
        ':sneezing_face:': '',
        ':mask:': '',
        ':thermometer_face:': '',
        ':head_bandage:': '',
        ':money_mouth:': '',
        ':cowboy:': '',
        ':smiling_imp:': '',
        ':imp:': '',
        ':japanese_ogre:': '',
        ':japanese_goblin:': '',
        ':clown:': '',
        ':poop:': '',
        ':ghost:': '',
        ':skull:': '',
        ':skull_crossbones:': '',
        // 70 - 7F
        ':alien:': '',
        ':space_invader:': '',
        ':robot:': '',
        ':jack_o_lantern:': '',
        ':smiley_cat:': '',
        ':smile_cat:': '',
        ':joy_cat:': '',
        ':heart_eyes_cat:': '',
        ':smirk_cat:': '',
        ':kissing_cat:': '',
        ':scream_cat:': '',
        ':crying_cat_face:': '',
        ':pouting_cat:': '',
        ':handshake:': '',
        ':heart_hands:': '',
        ':palms_up_together:': '',
        //80 - 8F
        ':open_hands:': '',
        ':raised_hands:': '',
        ':clap:': '',
        ':thumbsup:': '',
        ':thumbsdown:': '',
        ':punch:': '',
        ':fist:': '',
        ':left_facing_fist:': '',
        ':right_facing_fist:': '',
        ':leftwards_pushing_hand:': '',
        ':rightwards_pushing_hand:': '',
        ':face_exhaling:': '',
        ':face_with_spiral_eyes:': '',
        // Unsorted
        ':wave:': '',
        ':pray:': '',
        ':kiss:': '',
        ':lips:': '',
        ':biting_lip:': '',
        ':tooth:': '',
        ':tongue:': '',
        ':eye:': '',
        ':eyes:': '',
        ':moyai:': '',
        ':cat:': '',
        ':speaking_head:': '',
        ':point_left:': '',
        ':point_right:': '',
        ':fire:': '',
        ':apple:': '',
        ':pineapple:': '',
        // emojiL
        ':face_exhaling:': '',
        ':face_with_spiral_eyes:': '',
        ':pog:': '',
        ':tilin:': '',
        ':purple_guy:': '',
        ':mewing:': '',
        ':oreo:': '',
        ':silly_face:': '',
        ':aw_man:': '',
        ':cringe:': '',
        ':traumatized:': '',
        // Cubes
        ':grass:': '',
        ':dirt:': '',
        ':oak_log:': '',
        ':oak_planks:': '',
        ':stone:': '',
        ':cobblestone:': '',
        ':sand:': '',
        ':gravel:': '',
        ':bricks:': '',
        ':netherrack:': '',
        ':soul_sand:': '',
        ':glow_stone:': '',
        ':obsidian:': '',
        ':crying_obsidian:': '',
        ':glass:': '',
        ':beacon:': '',
        ':crafting_table:': '',
        ':furnance:': '',
        ':chest:': '',
        ':ender_chest:': '',
        ':redstone_lamp': '',
        ':redstone_lamp_lit': '',
        ':tnt:': '',
        ':bedrock:': '',
        ':command_block:': '',
        ':missing_texture:': '',
    'list': function (emojiL = false) {
        let emojisList = [];
            Object.keys(Lang.emojis).forEach(key => {
                if (key === 'list') { return; };
                if (emojiL === false && key.startsWith('eic') === true) { return; };
                if (emojiL === true && key.startsWith('eic') === false) { return; };
                emojisList.push([`§r${Lang.emojis[key]} §7- ${key}`]);
            });
            return `§6§lAll emojis available:\n\n${emojisList.join('\n')}\n\n§f(!) This list of emojis includes more than 191 emojis`;
    
        },
    },
    
    'translateEmojis': function (string) {
        Object.keys(Lang.emojis).forEach(key => {
            if (key === 'list') { return; };
            string = string.replaceAll(`${key}`, `${Lang.emojis[key]}`);
        });
        return string;
    },
};

system.runInterval(
    () => {
        world.getAllPlayers().forEach(
            (player) => {
                if (player) {
                    let playerHeldItemInv = player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex);
                    if (playerHeldItemInv) {
                        const inv = player.getComponent("minecraft:inventory")?.container;
                        const playerHeldItemInv = inv.getItem(player?.selectedSlotIndex);
                        let previousName = playerHeldItemInv.nameTag;
                        if (previousName && previousName.slice(0, 2) !== "") {
                            playerHeldItemInv.nameTag = "" + Lang.translateEmojis(previousName, Lang.emojis.list);
                            inv.setItem(player?.selectedSlotIndex, playerHeldItemInv)
                        }
                    };
                    let signLoad = player.getBlockFromViewDirection()?.block
                    if (signLoad) {
                        let previousTextSign = signLoad?.getComponent("minecraft:sign")?.getText();
                        if (previousTextSign) {
                            signLoad?.getComponent("minecraft:sign")?.setText(Lang.translateEmojis(previousTextSign));
                        }
                    };
                }
            },
        );
    },
);

for (let i = 14; i < 257; i++) {
    Lang.emojis[`eic${i}`] = String.fromCharCode(parseInt(`0xE3${Number(i).toString(16)}`));
};


world.beforeEvents.chatSend.subscribe(event => {
    event.cancel = true;
    let content = event.message;
    if (content === '-emojis list') {
        event.sender.sendMessage(Lang.emojis.list(false));
        return;
    }
    content = Lang.translateEmojis(content);
    system.run(() => {
        world.sendMessage(`<${event.sender.name}> ${content}`);
    });
});