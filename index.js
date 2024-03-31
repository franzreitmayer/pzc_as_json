const fs = require('fs');


const csvFilename = process.argv[2];

if (csvFilename == undefined) {
    console.log(`Usage node index.js [pzc csv file]`);
    process.exit(1);
}

console.log(`Reading file ${csvFilename}`);

fs.readFile(csvFilename, 'utf-8', (err, data) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    const groups = processCsvContent(data);
    const json = JSON.stringify(groups);
    fs.writeFileSync('output.json', json);
});

const processCsvContent = (csvContent) => {
    const csvLines = csvContent.split("\n");
    let lastGroup = undefined;
    const groups = [];
    csvLines.forEach((line, index) => {
        if (index != 0) {
            const fields = line.split(";");
            const [code, name, TR, red, yellow, green] = fields;
            if (code.includes("x")) { // group in line
                lastGroup = buildGroup(name, code);
                groups.push(lastGroup);
            } else { // process an element and attacht it to group
                const element = buildElement(code, name, TR, red, green, yellow);
                if (lastGroup == undefined) {
                    console.log(`no group ${code}, ${name}`);
                    process.exit(1);
                }
                lastGroup.elements.push(element);
            }
        }
    });

    return groups;
}

const buildGroup = (name, code) => {
    return {
        code: code,
        groupName: name,
        elements: []
    }
}

const buildElement = (code, name, TR, red, yellow, green) => {
    if (TR == undefined) return {};
    const hospitalization = {
        red: false,
        yellow: false,
        green: false
    };
    if (TR.includes("1")) hospitalization.red = true;
    if (TR.includes("2")) hospitalization.yellow = true;
    if (TR.includes("3")) hospitalization.green = true;
    const element = {
        code: code,
        name: name,
        hospitalization: hospitalization
    }
    return element;

}