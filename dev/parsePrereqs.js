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

function parseNumber(text) {
    if (!isNaN(parseInt(text))) return parseInt(text)
    
    return {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9
    }[text.toLowerCase()]
}

function parsePrereq(prereqText, debug=false) {
    if (debug) console.log(prereqText)
    var splitText = prereqText.split(' ')
    var match;
    if (prereqText == "None") return null // no prereqs

    // parse parenthesis
    const parenthesisRegex = /^\((.+)\)$/g // captures whats in parenthesis
    match = parenthesisRegex.exec(prereqText)
    if (match != null) return parsePrereq(match[1])

    // remove trailing "or"s (stuff like department consent fks up the matching)
    const trailingOrRegex = /(.*) or.*(?:consent|grad.+|equivalent|\n|permission|concurrent|Postbacs)/gi
    match = trailingOrRegex.exec(prereqText)
    if (match != null) return parsePrereq(match[1])

    // SHORTHAND. GOD WHO TF WROTE THIS FKING DATABASE WHY IS IT SO INCONSISTENT
    // #region ==============
    const numberOrRegex = /([a-z]{2,4}) ([0-9]+) or ([0-9]+)/gi // Arch 26 or 27
    match = numberOrRegex.exec(prereqText) 
    if (match != null) return createNode("ONE OF", [parsePrereq(`${match[1].toUpperCase()} ${match[2].padStart(4, '0')}`), parsePrereq(`${match[1].toUpperCase()} ${match[3].padStart(4, '0')}`)])

    const numberAndRegex = /([a-z]{2,4}) ([0-9]+) (?:\&|and) ([0-9]+)/gi // PHY 11 & 12
    match = numberAndRegex.exec(prereqText) 
    if (match != null) return createNode("ALL OF", [parsePrereq(`${match[1].toUpperCase()} ${match[2].padStart(4, '0')}`), parsePrereq(`${match[1].toUpperCase()} ${match[3].padStart(4, '0')}`)])

    // #endregion

    // BOOLEANS
    // #region ==============
    const orRegex = /(.+)\sor\s(.+)/gi // A or B
    match = orRegex.exec(prereqText)
    if (match != null) {
        const req1 = parsePrereq(match[1])
        const req2 = parsePrereq(match[2])

        if (req1.type == "ONE OF") {
            req1.values.push(req2)
            return req1
        }

        if (req2.type == "ONE OF") {
            req2.values.push(req1)
            return req2
        }
        return createNode("ONE OF", [req1, req2])
    }

    const andRegex = /(.+)\s(?:and|\&)\s(.+)/gi  // A and B ; A & B
    match = andRegex.exec(prereqText)
    if (match != null) {    
        const req1 = parsePrereq(match[1])
        const req2 = parsePrereq(match[2])

        if (req1.type == "ALL OF") {
            req1.values.push(req2)
            return req1
        }

        if (req2.type == "ALL OF") {
            req2.values.push(req1)
            return req2
        }
        return createNode("ALL OF", [req1, req2])
    }
    // #endregion ==============

    // "GROUP"??? TF DOES THIS MEAN
    // #region ==============
    const groupRegex = /(\w+?) Group ([ABCQ])/ // it's a shorthand for a list of classes. check the major website
    match = groupRegex.exec(prereqText)
    if (match != null) {
        const group = `${match[1].toUpperCase()}-${match[2].toUpperCase()}`
        
        const groups = { // take this from the website, use `data`.split(/:.*\n/).join(' or ')
            "BIOLOGY-A": parsePrereq("Bio 46 or Bio 61 or Bio 103 or Bio 104 or Bio 105 or Bio 106 or Bio 109 or Bio 143 or Bio 152 or Bio 171 or Bio 188 or Bio 190 or Chem 171 or Chem 172"),
            "BIOLOGY-B": parsePrereq("Bio 75 or Bio 108 or Bio 110 or Bio 112 or Bio 115 or Bio 116 or Bio 118 or Bio 134 or Bio 186"),
            "BIOLOGY-C": parsePrereq("Bio 35 or Bio 44 or Bio 106 or Bio 130 or Bio 142 or Bio 143 or Bio 144 or Bio 164 or Bio 180 or Bio 181 or Bio 182 or Bio 183 or Bio 185 or Bio 244")
        }

        if (groups[group] == undefined) throw new Error(`Unknown group ${group}`)
        return groups[group]
    }
    // #endregion ==============

    // DEPARTMENT
    // #region ==============
    const anyDepartmentRegex = /(?:any|one) (AAST|ACL|AFR|AMER|ANTH|ARB|ARCH|AST|BIO|BIOE|BME|CEE|CER|CH|CHBE|CHEM|CHNS|CIS|CLS|CS|CSHD|CST|CVS|DATA|DEIJ|DH|DIG|DNC|DRW|DRWM|DS|EC|ECS|ED|EDS|EE|EM|EN|ENE|ENG|ENP|ENT|ENV|ES|EXP|FIB|FMS|FR|GER|GIS|GRA|GRAC|GRK|HAA|HEB|HIST|IDIS|ILCS|ILVS|INTR|ITAL|JPN|JS|LAS|LAT|LING|LST|MATH|MDIA|ME|MES|MSE|MTL|MUS|NU|OTS|PAI|PAIM|PE|PHIL|PHT|PHTM|PHY|POR|PRT|PS|PSY|RCD|REL|RS|RUS|SCP|SMFA|SOC|SPN|STS|TCS|TML|TPS|UCOE|UCPC|UEP|VMS|WGSS|MDVL|ML|SKT) course/gi
    match = anyDepartmentRegex.exec(prereqText)
    if (match != null) return createNode("DEPARTMENT", [match[1]])
    if (prereqText.match(/one sociology course/i)) return createNode("DEPARTMENT" ["SOC"])
    if (prereqText == "any computer science course") return createNode("DEPARTMENT" ["CS"])
    if (splitText.length > 1 && departments.includes(splitText[1].toUpperCase())) {
        var departmentCount = parseNumber(splitText[0])
        var requirements = []
        for (let i = 0; i< departmentCount; i++) requirements.push(splitText[1])

        return createNode("ALL OF", createNode("DEPARTMENT" [requirements]))
    }
    // #endregion ==============

    // CLASS
    // #region=======
    const classRegex = /([A-Z]+) ?([0-9]+)/gi // matches any class
    match = classRegex.exec(prereqText)
    if (match != null) {
        const parsedClass = `${match[1].toUpperCase()}-${match[2].padStart(4, '0')}`
        if (classNames.includes(parsedClass)) return createNode("CLASS", [parsedClass])
            else throw new Error(`Class ${parsedClass} does not exist???`)
    }
    const slashRegex = /([A-Z]+)\/([A-Z]+) ([0-9]+)/g // ANTH 0040 or ANTH/BIO 0044 or consent
    match = slashRegex.exec(prereqText)
    if (match != null) {
        return createNode('ONE OF', [parsePrereq(`${match[1]} ${match[3].padStart(4, '0')}`), parsePrereq(`${match[2]} ${match[3].padStart(4, '0')}`)])
    }
    // #endregion=====

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