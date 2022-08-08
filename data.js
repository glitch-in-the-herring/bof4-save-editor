function load_slot(byte_array, address)
{
    let slot = {};

    slot["addr"] = address;
    slot["chars"] = load_char(byte_array.slice(address + 0x290, address + 0x7B0));
    slot["inv"] = load_inv(byte_array.slice(address + 0x974, address + 0xe9f));
    slot["inv"].zenny = String(from_little_endian_u(byte_array.slice(address + 0x878, address + 0x87c)));
    slot["party"] = load_party(byte_array.slice(address + 0x882, address + 0x888));

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
        char["lvl"] = String(byte_array[base_address + 8]);
        char["exp"] = String(from_little_endian_u(byte_array.slice(base_address + 12, base_address + 16)));
        char["chp"] = String(from_little_endian_u(byte_array.slice(base_address + 20, base_address + 22)));
        char["cap"] = String(from_little_endian_u(byte_array.slice(base_address + 24, base_address + 26)));
        char["cmhp"] = String(from_little_endian_u(byte_array.slice(base_address + 56, base_address + 58)));
        char["cmap"] = String(from_little_endian_u(byte_array.slice(base_address + 60, base_address + 62)));
        char["tmhp"] = String(from_little_endian_u(byte_array.slice(base_address + 92, base_address + 94)));
        char["tmap"] = String(from_little_endian_u(byte_array.slice(base_address + 96, base_address + 98)));
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
            char.eqp[j] = String(byte_array[base_address + 14 + j]);

        char["abil"] = [];
        char["skil"] = [];
        for (let j = 0; j < 16; j++)
        {
            char["abil"] = String(byte_array[base_address + 30 + j]);
        }
        for (let j = 0; j < 10; j++)
        {
            char["abil"] = String(byte_array[base_address + 46 + j]);
        }

        char_array.push(char);
    }

    return char_array;
}

function load_inv(byte_array)
{
    let inv = {};
    let id_base_addr;
    let n_base_addr;

    inv["inv"] = [];

    for (let i = 0; i < 4; i++)
    {
        id_base_addr = 128 * i;
        n_base_addr = 512 + id_base_addr
        inv.inv[i] = [];
        for (let j = 0; j < 128; j++)
        {
            inv.inv[i][j] = [];
            inv.inv[i][j][0] = String(byte_array[id_base_addr + j]);
            inv.inv[i][j][1] = String(byte_array[n_base_addr + j]);
        }
    }

    inv["skill"] = [];
    for (let i = 0; i < 128; i++)
        inv["skill"][i] = String(byte_array[1056 + i]);

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

    for (let i = 0; i < 3; i++)
    {
        party.out[i] = String(byte_array[i]);
        party.in[i] = String(byte_array[i + 3]);
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

    key = Object.keys(char_e.sg);
    for (let i = 0; i < key.length; i++)
    {
        index = key[i];
        char.sg[index.split("_")[2]] = char_e.sg[index].value;
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

    for (let i = 0; i < 128; i++)
        inv.skill[i] = inv_e.skill[i].value;

    let gene_group;
    for (let i = 0; i < 18; i++)
    {
        gene_group = i >> 3;
        if (inv_e.genes[i].checked)
            inv.genes[gene_group] = inv.genes[gene_group] | (0b1 << (i % 8));
        else
            inv.genes[gene_group] = inv.genes[gene_group] & (logical_not(0b1 << (i % 8), 1));
    }

    for (let i = 0; i < 17; i++)
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
