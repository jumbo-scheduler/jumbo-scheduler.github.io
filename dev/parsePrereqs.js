// welcome to regex hell
// regex101.com my beloved
const classNames = Object.keys(total_catalog)

function createNode(type, values) {
    const output = {
        type: type,
        values: values
    }
    // console.log(output)
    return output
}

function parsePrereq(prereqText, debug=false) {
    if (debug === true) console.log(prereqText) // theres some type casting stupidity happening
    var match;

    // find and replace
    prereqText = prereqText
        .replaceAll(/economics/gi, "EC")
        .replaceAll(/physics/gi, "PHY")
        .replaceAll(/education/gi, "ED")
        .replaceAll(/sociology/gi, "SOC")

    const noPrereqsRegex = /none|undergraduate students|smfa students only|co-requisite/gi
    if (noPrereqsRegex.exec(prereqText) != null) return null // no prereqs

    // ignore restrictions on major
    const majorBanRegex = /(?:not open to .+ majors)|(?:major in)|(?:majors? only)|(?:minors? only)|(?:excludes grad students)/gi
     if (majorBanRegex.exec(prereqText) != null) return null

    // remove trailing "or"s (stuff like department consent fks up the matching)
    const trailingOrRegex = /(.*)\s+or\s+(?:consent|(?:instructor )?permission|graduate students|equivalents?|grad)/gi
    match = trailingOrRegex.exec(prereqText)
    if (match != null) return parsePrereq(match[1])

    // remove leading stuff 
    const leadingRegex = /(?:(?:prior )?completion(?: of| or concurrent enrollment in)?)\s+(.*)/gi
    match = leadingRegex.exec(prereqText)
    if (match != null) return parsePrereq(match[1])

    if (prereqText.length > 200) return null // too yappy

    // YEARS
    const yearRegex = /(?:(first year)|freshm[ea]n)|(sophomore)|(junior)|(senior)/gi
    match = yearRegex.exec(prereqText)
    if (match != null) {
        var years = []
        for (let i = 1; i < 4; i++) {
            if (match[i] != undefined) years.push(createNode("YEAR", i))
        }
        return createNode("ONE OF", years)
    }

    // SHORTHAND. GOD WHO TF WROTE THIS FKING DATABASE WHY IS IT SO INCONSISTENT
    // #region ==============
    const numberOrRegex = /([a-z]{2,4}) ([0-9]+) or ([0-9]+)/gi // Arch 26 or 27
    match = numberOrRegex.exec(prereqText) 
    if (match != null) return createNode("ONE OF", [parsePrereq(`${match[1].toUpperCase()} ${match[2].padStart(4, '0')}`), parsePrereq(`${match[1].toUpperCase()} ${match[3].padStart(4, '0')}`)])

    const numberAndRegex = /([a-z]{2,4}) ([0-9]+) (?:\&|and) ([0-9]+)/gi // PHY 11 & 12
    match = numberAndRegex.exec(prereqText) 
    if (match != null) return createNode("ALL OF", [parsePrereq(`${match[1].toUpperCase()} ${match[2].padStart(4, '0')}`), parsePrereq(`${match[1].toUpperCase()} ${match[3].padStart(4, '0')}`)])

    // #endregion


    const andRegex = /\s+and\s+/gi
    if (andRegex.exec(prereqText) != null) return createNode("ALL OF", prereqText.split(andRegex).forEach(parsePrereq))


    const orRegex = /\s+or\s+/gi
    if (orRegex.exec(prereqText) != null) return createNode("ONE OF", prereqText.split(orRegex).forEach(parsePrereq))

    // DEPARTMENT
    // #region ==============
    const anyDepartmentRegex = /(?:any|one)\s+(?:prior\s+)?(AAST|ACL|AFR|AMER|ANTH|ARB|ARCH|AST|BIO|BIOE|BME|CEE|CER|CH|CHBE|CHEM|CHNS|CIS|CLS|CS|CSHD|CST|CVS|DATA|DEIJ|DH|DIG|DNC|DRW|DRWM|DS|EC|ECS|ED|EDS|EE|EM|EN|ENE|ENG|ENP|ENT|ENV|ES|EXP|FIB|FMS|FR|GER|GIS|GRA|GRAC|GRK|HAA|HEB|HIST|IDIS|ILCS|ILVS|INTR|ITAL|JPN|JS|LAS|LAT|LING|LST|MATH|MDIA|ME|MES|MSE|MTL|MUS|NU|OTS|PAI|PAIM|PE|PHIL|PHT|PHTM|PHY|POR|PRT|PS|PSY|RCD|REL|RS|RUS|SCP|SMFA|SOC|SPN|STS|TCS|TML|TPS|UCOE|UCPC|UEP|VMS|WGSS|MDVL|ML|SKT)\s+course/gi
    match = anyDepartmentRegex.exec(prereqText)
    if (match != null) return createNode("DEPARTMENT", [match[1]])
    // #endregion ==============

    // CLASS
    // #region=======
    const classRegex = /([A-Z]+) ?([0-9]+)/gi // matches any class
    match = classRegex.exec(prereqText)
    if (match != null) {
        const parsedClass = `${match[1].toUpperCase()}-${match[2].padStart(4, '0')}`
        if (!classNames.includes(parsedClass)) console.error(`Class ${parsedClass} does not exist???`)
        return createNode("CLASS", [parsedClass])
    }
    const slashRegex = /([A-Z]+)\/([A-Z]+) ([0-9]+)/g // ANTH 0040 or ANTH/BIO 0044 or consent
    match = slashRegex.exec(prereqText)
    if (match != null) {
        return createNode('ONE OF', [parsePrereq(`${match[1]} ${match[3].padStart(4, '0')}`), parsePrereq(`${match[2]} ${match[3].padStart(4, '0')}`)])
    }
    // #endregion=====

    throw new Error(`Could not parse the phrase "${prereqText}"`) // default
}

function parseCatalogPrereqs() {
    for (const className in total_catalog) {
        const subjectData = total_catalog[className]
        
        try {
            const parsedPrereqs = parsePrereq(subjectData.prereqs)
            subjectData.parsedPrereqs = parsedPrereqs
        }
        catch(err) {
            throw new Error(`Could not parse "${subjectData.prereqs}", received ${err} for class "${className}"`)
        }
    }
}
parseCatalogPrereqs()