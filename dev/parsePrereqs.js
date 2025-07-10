// welcome to regex hell
// regex101.com my beloved
const classNames = Object.keys(total_catalog);

const createPrereqParser = (regex, handler) => {
    return { regex: regex, handler: handler };
};
const createNode = (type, value) => {
    return { type: type, value: value };
};

const prereqPatterns = [
    // the phrase "None"
    createPrereqParser(/none/, (_) => null),

    // booleans
    createPrereqParser(/\&/),
    createPrereqParser(/\|/),

    // years
    createPrereqParser(/freshm[ea]n/, (_) => createNode("YEAR", 0)),
    createPrereqParser(/sophomore/, (_) => createNode("YEAR", 1)),
    createPrereqParser(/sophomore/, (_) => createNode("YEAR", 2)),
    createPrereqParser(/sophomore/, (_) => createNode("YEAR", 3)),

    // department (wtf is an 80 character limit)
    createPrereqParser(
        /(aast|acl|afr|amer|anth|arb|arch|ast|bio|bioe|bme|cee|cer|ch|chbe|chem|chns|cis|cls|cs|cshd|cst|cvs|data|deij|dh|dig|dnc|drw|drwm|ds|ec|ecs|ed|eds|ee|em|en|ene|eng|enp|ent|env|es|exp|fib|fms|fr|ger|gis|gra|grac|grk|haa|heb|hist|idis|ilcs|ilvs|intr|ital|jpn|js|las|lat|ling|lst|math|mdia|me|mes|mse|mtl|mus|nu|ots|pai|paim|pe|phil|pht|phtm|phy|por|prt|ps|psy|rcd|rel|rs|rus|scp|smfa|soc|spn|sts|tcs|tml|tps|ucoe|ucpc|uep|vms|wgss|mdvl|ml|skt)/,
        (match) => createNode("DEPARTMENT", match[1])
    ),
];

// find regex, replace with replace
const createPrereqSanitizer = (regex, replace) => {
    return { regex: regex, replace: replace };
};
const textSanitizers = [
    // numbers
    createPrereqSanitizer(/ one /g, " 1 "),

    // booleans
    createPrereqSanitizer(/ and /g, " & "),
    createPrereqSanitizer(/ or /g, " | "),

    // remove
    createPrereqSanitizer(/ prior /g, " "),
    createPrereqSanitizer(/\| grad/g, ""),
    createPrereqSanitizer(/\| graduate students/g, ""),
    createPrereqSanitizer(/\| permission/g, ""),
    createPrereqSanitizer(/\| equivalent/g, ""),
];

function parsePrereq(prereqText) {
    // sanitize text
    prereqText = prereqText.toLowerCase();
    for (const sanitizer of textSanitizers)
        prereqText = prereqText.replaceAll(sanitizer.regex, sanitizer.replace);
    prereqText = prereqText.trim();

    var pattern, match;
    for (pattern of prereqPatterns) {
        match = prereqText.match(pattern.regex);
        if (match != null) return pattern.handler(match);
    }

    console.log(prereqText, pattern, match);
    throw new Error(`Could not parse the phrase "${prereqText}"`); // default
}

function parseCatalogPrereqs() {
    for (const className in total_catalog) {
        const subjectData = total_catalog[className];

        try {
            const parsedPrereqs = parsePrereq(subjectData.prereqs);
            subjectData.parsedPrereqs = parsedPrereqs;
        } catch (err) {
            throw new Error(
                `Could not parse "${subjectData.prereqs}", received ${err} for class "${className}"`
            );
        }
    }
}
parseCatalogPrereqs();
