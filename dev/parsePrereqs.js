// I WILL DIE FOR COPILOT
// parses prerequisite strings into a tree structure

const tokenizePhrases = (line) => {
    // converts a line into an array of tokens of the form {type: "PHRASE"/"AND"/"OR"/"SEPARATOR", value: string/null}
    // where PHRASE is any phrase that is not "and" or "or", AND is the word "and" (case-insensitive), OR is the word "or" (case-insensitive), and SEPARATOR is a comma or semicolon
    // e.g. "COMP 11, COMP 15 or COMP 40" becomes
    // [
    //   {type: "PHRASE", value: "COMP 11"},
    //   {type: "SEPARATOR", value: ","},
    //   {type: "PHRASE", value: "COMP 15"},
    //   {type: "OR", value: "or"},
    //   {type: "PHRASE", value: "COMP 40"}
    //  ]

    // CS11 80 character limit
    // returns NONE for anything over 100 characters
    if (line.length > 100) return [{ type: "NONE", value: null }];
    
    // Find all "and"/"or" (case-insensitive) positions
    const boolRegex = /\b(and|or)\b/gi;
    let match, boolPositions = [];
    while ((match = boolRegex.exec(line)) !== null) {
        boolPositions.push({ index: match.index, value: match[1].toUpperCase() });
    }

    // Identify the last boolean operator
    const lastBool = boolPositions.length > 0 ? boolPositions[boolPositions.length - 1] : null;

    // Split the line into segments before, at, and after the last boolean
    let tokens = [];
    if (lastBool) {
        // Before last boolean
        const before = line.slice(0, lastBool.index).trim();
        // At last boolean
        const boolValue = lastBool.value;
        // After last boolean
        const after = line.slice(lastBool.index + boolValue.length).trim();

        // Tokenize phrases before last boolean, using comma/semicolon as separators
        const prePhrases = before.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 0);
        for (let i = 0; i < prePhrases.length; i++) {
            tokens.push({ type: "PHRASE", value: prePhrases[i] });
            // Add separator if not last phrase before boolean
            if (i < prePhrases.length - 1) {
                tokens.push({ type: "SEPARATOR", value: "," });
            }
        }

        // Add the last boolean operator
        tokens.push({ type: boolValue, value: boolValue.toLowerCase() });

        // Tokenize phrases after last boolean, using comma/semicolon as separators
        const postPhrases = after.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 0);
        for (let i = 0; i < postPhrases.length; i++) {
            tokens.push({ type: "PHRASE", value: postPhrases[i] });
            if (i < postPhrases.length - 1) {
                tokens.push({ type: "SEPARATOR", value: "," });
            }
        }
    } else {
        // No boolean operator, just split by comma/semicolon
        const phrases = line.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 0);
        for (let i = 0; i < phrases.length; i++) {
            tokens.push({ type: "PHRASE", value: phrases[i] });
            if (i < phrases.length - 1) {
                tokens.push({ type: "SEPARATOR", value: "," });
            }
        }
    }

    return tokens;
}

const sanitize = (phrase) => { 
    // converts a phrase to a standard format

    // convert to uppercase
    phrase = phrase.toUpperCase();

    // if the phrase is a department name followed by a space then a number, return the phrase with a "-"" in between and the number padded to 4 digits
    if (/^[A-Z]{2,4} \d{1,4}[A-Z]?$/.test(phrase)) {
        const parts = phrase.split(" ");
        const dept = parts[0];
        let num = parts[1];
        // pad number to 4 digits
        num = num.padStart(4, '0');
        return `${dept}-${num}`;
    }


    // if the phrase is a department name followed by a space then a list of numbers separated by slashes or commas, return an array of the phrases with a "-" in between
    if (/^[A-Z]{2,4} (\d{1,4}[A-Z]?([\/,] ?\d{1,4}[A-Z]?)+)$/.test(phrase)) {
        console.log(phrase)
    }

    // if the phrase contains one of the following, return "NONE"
    const nonePhrases = ["NONE", "GRADUATE", "GRAD", "PERMISSION", "CONSENT", "EQUIVALENT", "RESTRICTED", "MAJOR", "NOT", "MINOR"];
    const noneRegex = new RegExp(nonePhrases.join("|"), "i");
    if (noneRegex.test(phrase)) return "NONE";

    // remove the following phrases if they appear at the start or end of the phrase
    const removePhrases = ["STANDING", "1"]
    const removeRegex = new RegExp(`^(${removePhrases.join("|")})\\s+|\\s+(${removePhrases.join("|")})$`, "gi");
    phrase = phrase.replace(removeRegex, "").trim();

    // remove the following phrases wherever they appear
    const removeAnywhere = ["COURSE", "COURSES", "PRIOR", "COMPLETION OF", "REQUIRES"]
    const removeAnywhereRegex = new RegExp(`\\b(${removeAnywhere.join("|")})\\b`, "gi");
    phrase = phrase.replace(removeAnywhereRegex, "").replace(/\s+/g, " ").trim();

    // replace words with numbers
    const numberMap = {
        "ONE": "1",
        "TWO": "2",
        "THREE": "3",
    }
    for (const [word, num] of Object.entries(numberMap)) {
        const numRegex = new RegExp(`\\b${word}\\b`, "gi");
        phrase = phrase.replace(numRegex, num);
    }

    return phrase;
}

const parseLine = (line) => {
    // parses a single prerequisite line into an array of tokens of the form {type: "YEAR"/"SUBJECT"/"DEPARTMENT"/"NONE"/"AND"/"OR"/"SEPARATOR", value: string/int/null}
    
    // split the line into phrases
    var tokens = tokenizePhrases(line)

    // repeatedly parse phrases into more specific types until no phrases remain or 100 iterations have occurred
    for (var tries = 0; tries < 100; tries++) { 
        var unparsedPhrases = false;
        for (var i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // sort phrases into more specific types
            if (token.type == "PHRASE") {
                unparsedPhrases = true;
                const phrase = sanitize(token.value)
      
                // check for "CONCURRENT ENROLLMENT IN XXX"
                const concurrentRegex = /^CONCURRENT ENROLLMENT IN (.+)$/i;
                if (concurrentRegex.test(phrase)) {
                    const match = phrase.match(concurrentRegex);
                    token.type = "CONCURRENT"
                    token.value = match[1].trim()
                    continue; // move to next token
                }

                // if the phrase is a department name followed by a list of numbers, e.g. "COMP 11 & 12", "MATH 22, 23", "CHEM 1A or 1B", split it into multiple SUBJECT tokens separated by AND/OR tokens
                const departmentRegex = /^([A-Z]{2,4})\s+((?:\d{1,3}[A-Z]?)(?:\s*([&,]|or|and)\s*\d{1,3}[A-Z]?)+)$/i;
                if (departmentRegex.test(phrase)) {
                    const match = phrase.match(departmentRegex);
                    const dept = match[1];
                    const numbers = match[2].split(/\s*([&,]|or|and)\s*/).filter(s => s.trim().length > 0);
                    const newTokens = [];
                    for (let i = 0; i < numbers.length; i++) {
                        const part = numbers[i].trim();
                        if (part === "&" || part === ",") {
                            newTokens.push({ type: "AND", value: "and" });
                        } else if (part.toLowerCase() === "or") {
                            newTokens.push({ type: "OR", value: "or" });
                        } else {
                            newTokens.push({ type: "SUBJECT", value: `${dept}-${part}` });
                        }
                    }
                    // replace the current token with the new tokens
                    const index = tokens.indexOf(token);
                    tokens.splice(index, 1, ...newTokens);
                    continue; // move to next token
                }

                // if the phrase is "NONE", return type "NONE"
                if (phrase == "NONE") {
                    token.type = "NONE"
                    token.value = null;
                }

                // if the phrase is a class year, e.g. freshman, sophomore, junior, senior, return type "YEAR"
                const yearMap = {
                    "FRESHMAN": 0,
                    "SOPHOMORE": 1,
                    "JUNIOR": 2,
                    "SENIOR": 3
                }

                if (phrase in yearMap) {
                    token.type = "YEAR"
                    token.value = yearMap[phrase]
                }

                // check if the phrase is formatted like a class name, e.g. "COMP-11", "MATH-22A", "ECON-101"
                const classRegex = /^[A-Z]{2,4}-\d{1,3}[A-Z]?$/;
                if (classRegex.test(phrase)) {
                    // does this class acc exist?
                    if (!class_names.includes(phrase)) {
                        console.warn(`Warning: class ${phrase} not found in catalog`)
                        // just classify as NONE
                        token.type = "NONE"
                        token.value = null;
                    }
                    else {
                        token.type = "SUBJECT"
                        token.value = phrase
                    }
                }
                // if the phrase is just a class name
                if (class_names.includes(phrase)) {
                    token.type = "SUBJECT"
                    token.value = phrase
                }

                // if the phrase is a department name, e.g. "COMP", "MATH", "ECON", return type "DEPARTMENT"
                if (departments.includes(phrase)) {
                    token.type = "DEPARTMENT"
                    token.value = phrase
                }

                // check if the current phrase can be tokenized again
                const tokenizedAgain = tokenizePhrases(phrase);
                if (tokenizedAgain.length > 1) {
                    // replace the current token with the new tokens
                    const index = tokens.indexOf(token);
                    tokens.splice(index, 1, ...tokenizedAgain);
                    continue; // move to next token
                }


                // nothing else worked, just try again next iteration
                if (token.type == "PHRASE") token.value = phrase
            }
        }

        if (!unparsedPhrases) break
    }

    if (unparsedPhrases) {
        console.log(tokens)
        throw new Error(`Infinite loop detected in parseLine when parsing class: ${line}`)
    }

    return tokens
}

const buildTree = (tokens) => {
}

const parsePrereqs = (catalog) => {
    // run parseLine on each class's prereq string and store the result in a new field "parsedPrereq"
    for (const subject in catalog) {
        console.log(`Parsing prereqs for ${subject}`)
        catalog[subject].parsedPrereq = buildTree(parseLine(catalog[subject].prereqs))
    }
}