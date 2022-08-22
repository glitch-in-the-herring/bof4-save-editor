function load_slot(byte_array, address)
{
    let slot = {};

    slot["addr"] = address;
    slot["chars"] = load_char(byte_array.slice(address + 0x180, address + 0x5A7));
    slot["inv"] = load_inv(byte_array.slice(address + 0x5cc, address + 0xe06));
    slot["inv"].zenny = String(from_little_endian_u(byte_array.slice(address + 0x5b4, address + 0x5b8)));
    slot["inv"].gp = String(from_little_endian_u(byte_array.slice(address + 0xf98, address + 0xf9c)));
    slot["party"] = load_party(byte_array.slice(address + 0xee2, address + 0xeee));

    return slot;
}

function load_char(byte_array)
{
    let char_array = []; 
    let char;
    let base_address;

    for (let i = 0; i < 7; i++)
    {
        char = {};
        base_address = 0x98 * i;
        char["name"] = ascii_decoder(byte_array.slice(base_address, base_address + 6));
        char["lvl"] = String(byte_array[base_address + 10]);
        char["exp"] = String(from_little_endian_u(byte_array.slice(base_address + 12, base_address + 16)));
        char["chp"] = String(from_little_endian_u(byte_array.slice(base_address + 20, base_address + 24)));
        char["cap"] = String(from_little_endian_u(byte_array.slice(base_address + 24, base_address + 28)));
        char["cmhp"] = String(from_little_endian_u(byte_array.slice(base_address + 56, base_address + 60)));
        char["cmap"] = String(from_little_endian_u(byte_array.slice(base_address + 60, base_address + 64)));
        char["tmhp"] = String(from_little_endian_u(byte_array.slice(base_address + 92, base_address + 96)));
        char["tmap"] = String(from_little_endian_u(byte_array.slice(base_address + 96, base_address + 100)));
        char["cp"] = String(from_little_endian_u(byte_array.slice(base_address + 100, base_address + 102)));
        char["pwr"] = String(from_little_endian_u(byte_array.slice(base_address + 102, base_address + 104)));
        char["def"] = String(from_little_endian_u(byte_array.slice(base_address + 104, base_address + 106)));
        char["agl"] = String(from_little_endian_u(byte_array.slice(base_address + 106, base_address + 108)));
        char["wis"] = String(from_little_endian_u(byte_array.slice(base_address + 108, base_address + 110)));
        char["lrng"] = String(byte_array[base_address + 122])
        char["cntr"] = String(byte_array[base_address + 123]);
        char["crit"] = String(byte_array[base_address + 124]);
        char["dodg"] = String(byte_array[base_address + 125]);
        char["alrt"] = String(byte_array[base_address + 126])
        char["hits"] = String(byte_array[base_address + 127]);
        char["master"] = String(byte_array[base_address + 132]);

        char["res"] = [];
        for (let j = 0; j < 12; j++)
            char.res[j] = String(byte_array[base_address + 110 + j]);

        char["eqp"] = [];
        for (let j = 0; j < 3; j++)
            char.eqp[j] = String(byte_array[base_address + 128 + j]);

        char["abil"] = byte_array.slice(base_address + 30, base_address + 46);
        char["skil"] = byte_array.slice(base_address + 46, base_address + 56);

        char_array.push(char);
    }

    return char_array;
}

function load_inv(byte_array)
{
    let inv = {};
    let base_addr;

    inv["inv"] = [];

    for (let i = 0; i < 4; i++)
    {
        base_addr = 512 * i;
        inv.inv[i] = [];
        for (let j = 0; j < 128; j++)
        {
            inv.inv[i][j] = [];
            inv.inv[i][j][0] = String(byte_array[base_addr + j * 2]);
            inv.inv[i][j][1] = String(byte_array[base_addr + j * 2 + 1]);
        }
    }

    inv["skills"] = [];
    for (let i = 0; i < 10; i++)
        inv["skills"][i] = byte_array[2096 + i];

    inv["genes"] = [];
    for (let i = 0; i < 3; i++)
        inv["genes"][i] = byte_array[1276 + i];

    inv["masters"] = [];
    for (let i = 0; i < 3; i++)
        inv["masters"][i] = byte_array[1280 + i];

    return inv;
}

function load_party(byte_array)
{
    let party = {};
    party["out"] = [];
    party["in"] = [];

    for (let i = 0; i < 6; i++)
    {
        party.out[i] = String(byte_array[i + 6]);
        party.in[i] = String(byte_array[i]);
    }

    return party;
}

function store_char(char_e, char)
{
    let index;
    let key = Object.keys(char_e.stat);
    for (let i = 0; i < key.length; i++)
    {
        index = key[i];
        char[index.split("_")[1]] = char_e.stat[index].value;
    }

    store_parts(char_e.res, char.res);
    store_parts(char_e.eqp, char.eqp);
    store_parts(char_e.abil, char.abil[char_e.cur.abil]);   
    char.master = char_e.master.value;
}

function store_inv(inv_e, inv)
{
    for (let i = 0; i < 128; i++)
    {
        inv[i][0] = inv_e.inv[i][0].value;
        inv[i][1] = inv_e.inv[i][1].value;
    }
}

function store_skills(inv_e, inv)
{
    inv.zenny = inv_e.zenny.value;

    let skill_group;
    for (let i = 0; i < 76; i++)
    {
        skill_group = i >> 3;
        if (inv_e.skills[i].checked)
            inv.skills[skill_group] = inv.skills[skill_group] | (0b1 << (i % 8));
        else
            inv.skills[skill_group] = inv.skills[skill_group] & (logical_not(0b1 << (i % 8), 1));
    }

    let gene_group;
    for (let i = 0; i < 18; i++)
    {
        gene_group = i >> 3;
        if (inv_e.genes[i].checked)
            inv.genes[gene_group] = inv.genes[gene_group] | (0b1 << (i % 8));
        else
            inv.genes[gene_group] = inv.genes[gene_group] & (logical_not(0b1 << (i % 8), 1));
    }

    for (let i = 0; i < 13; i++)
    {
        master_group = i >> 3;
        if (inv_e.masters[i].checked)
            inv.masters[master_group] = inv.masters[master_group] | (0b1 << (i % 8));
        else
            inv.masters[master_group] = inv.masters[master_group] & (logical_not(0b1 << (i % 8), 1));
    }
}

function store_party(party_e, party)
{
    for (let i = 0; i < 3; i++)
    {
        party.in[i] = party_e.in[i].value;
        party.out[i] = party_e.out[i].value;
    }
}

function store_parts(e, data)
{
    let index;
    let keys = Object.keys(e);

    for (let i = 0; i < keys.length; i++)
    {
        index = keys[i];
        data[i] = e[index].value;
    }
}
