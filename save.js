function save_file(e)
{
    store_char(e.target.char_e, e.target.slots[e.target.cur.slot].chars[e.target.cur.char]);
    store_inv(e.target.inv_e, e.target.slots[e.target.cur.slot].inv.inv[e.target.cur.inv]);
    store_skills(e.target.inv_e, e.target.slots[e.target.cur.slot].inv);
    store_party(e.target.party_e, e.target.slots[e.target.cur.slot].party);
    for (let i = 0; i < e.target.slots.length; i++)
    {
        save_char(e.target.byte_array, e.target.slots[i]);
        save_inv(e.target.byte_array, e.target.slots[i]);
        save_party(e.target.byte_array, e.target.slots[i]);
        //save_counter(e.target.byte_array, e.target.slots[i], e.target.counter_e);
        checksum(e.target.byte_array, e.target.slots[i].addr);
    }

    let output_file = new File([e.target.byte_array], e.target.filename);
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(output_file);
    link.download = e.target.filename;
    link.click();
}

function checksum(byte_array, addr)
{
    let sum = 0;

    for (let i = 0; i < 0x184f; i++)
        sum ^= byte_array[addr + i];

    byte_array[addr + 0x184f] = sum;
}

function save_char(byte_array, slot)
{
    let buffer;
    let base_addr;
    for (let i = 0; i < 7; i++)
    {
        base_addr = slot.addr + 0x180 + 0x98 * i;
        buffer = ascii_encoder(slot.chars[i].name);
        for (let j = 0; j < 6; j++)
            byte_array[base_addr + j] = buffer[j];

        byte_array[base_addr + 10] = byte_safety_u(slot.chars[i].lvl, 1);
        buffer = to_little_endian_u(slot.chars[i].exp, 4);
        for (let j = 0; j < 4; j++)
            byte_array[base_addr + 12 + j] = buffer[j];

        buffer = to_little_endian_u(slot.chars[i].chp, 4);
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].cap, 4));
        for (let j = 0; j < 8; j++)
            byte_array[base_addr + 20 + j] = buffer[j];

        buffer = to_little_endian_u(slot.chars[i].cmhp, 4);
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].cmap, 4));
        for (let j = 0; j < 8; j++)
            byte_array[base_addr + 56 + j] = buffer[j];

        buffer = to_little_endian_u(slot.chars[i].tmhp, 4);
        buffer =buffer.concat(to_little_endian_u(slot.chars[i].tmap, 4));
        for (let j = 0; j < 8; j++)
            byte_array[base_addr + 92 + j] = buffer[j];

        buffer = to_little_endian_u(slot.chars[i].cp, 2);
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].pwr, 2));
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].def, 2));
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].agl, 2));
        buffer = buffer.concat(to_little_endian_u(slot.chars[i].wis, 2));
        for (let j = 0; j < 10; j++)
            byte_array[base_addr + 100 + j] = buffer[j];

        byte_array[base_addr + 132] = byte_safety_u(slot.chars[i].master, 1);

        buffer = [slot.chars[i].lrng, slot.chars[i].cntr, slot.chars[i].crit, slot.chars[i].dodg, slot.chars[i].alrt, slot.chars[i].hits];

        for (let j = 0; j < 6; j++)
            byte_array[base_addr + 122 + j] = byte_safety_u(buffer[j], 1);

        for (let j = 0; j < 12; j++)
            byte_array[base_addr + 110 + j] = byte_safety_u(slot.chars[i].res[j], 1);

        for (let j = 0; j < 3; j++)
            byte_array[base_addr + 128 + j] = byte_safety_u(slot.chars[i].eqp[j], 1);

        for (let j = 0; j < 16; j++)
            byte_array[base_addr + 30] = byte_safety_u(slot.chars[i].abil[j], 1); 

        for (let j = 0; j < 10; j++)
            byte_array[base_addr + 46] = byte_safety_u(slot.chars[i].skil[j], 1);
    }
}

function save_inv(byte_array, slot)
{
    let base_addr = slot.addr + 0x5cc;
    let item_base_addr;
    let buffer;

    for (let i = 0; i < 4; i++)
    {
        item_base_addr = base_addr + 512  * i;
        for (let j = 0; j < 128; j++)
        {
            byte_array[id_base_addr + j * 2] = byte_safety_u(slot.inv.inv[i][j][0], 1);
            byte_array[id_base_addr + j * 2 + 1] = byte_safety_u(slot.inv.inv[i][j][1], 1);
        }
    }

    for (let i = 0; i < 10; i++)
        byte_array[base_addr + i] = byte_safety_u(slot.inv.skills[i], 1);    

    buffer = to_little_endian_u(slot.inv.zenny, 4);
    for (let i = 0; i < 4; i++)
        byte_array[slot.addr + 0x5b4 + i] = buffer[i];
}

function save_party(byte_array, slot)
{
    let base_addr = slot.addr;
    for (let i = 0; i < 6; i++)
    {
        byte_array[base_addr + 0x5bc + i] = byte_array[base_addr + 0xee2 + i] = byte_safety_u(slot.party.out[i], 1);
        byte_array[base_addr + 0xee8 + i] = byte_safety_u(slot.party.in[i], 1);
    }
}

function save_counter(byte_array, slot, counter_e)
{
    if (get_timer_status(counter_e)[0])
    {
        for (let i = 0; i < 4; i++)
        {
            byte_array[slot.addr + 0xe7c + i] = 0;
        }
    }

    if (get_timer_status(counter_e)[1])
    {
        for (let i = 0; i < 4; i++)
        {
            byte_array[slot.addr + 0xe80 + i] = 0;
        }
    }
}
