function load_file(filename)
{
    let xhr = new XMLHttpRequest();
    let result = null;
    xhr.open("GET", filename, false);
    xhr.send();
    if (xhr.readyState === 4 && xhr.status === 200)
    {
        return xhr.responseText;
    }
}

const item_array = [
    load_file("items/items.txt").split("\n"),
    load_file("items/weapons.txt").split("\n"),
    load_file("items/armor.txt").split("\n"),
    load_file("items/accs.txt").split("\n"),
    load_file("items/fishing.txt").split("\n"),
    load_file("items/abils.txt").split("\n")
]

function load_item_select(select, data)
{
    for (let i = 0; i < data.length; i++)
    {
        for (let j = 0; j < select.length; j++)
            select[j].innerHTML += "<option value=\"" + i.toString()  + "\">" + data[i] +  "</option>\n";
    }    
}

const genes = 
[
    "flame", "frost", "thunder",
    "shadow", "radiance", "force",
    "defender", "eldritch", "miracle",
    "gross", "thorn", "reverse",
    "mutant", "question", "trance",
    "failure", "fusion", "infinity"
];

const gene_names = 
[
    "Flame", "Frost", "Thunder",
    "Shadow", "Radiance", "Force",
    "Defender", "Eldritch", "Miracle",
    "Gross", "Thorn", "Reverse",
    "Mutant", "???", "Trance",
    "Failure", "Fusion", "Infinity"
];

const masters =
[
    "Rwolf", "Momo", "Kryrik", "Abbess",
    "Njomo", "Gyosil", "Stoll", "Stoll",
    "Una", "Bunyan", "Lyta", "Khan", "Marlok"
];