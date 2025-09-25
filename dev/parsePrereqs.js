
/**
 * Parses prerequisite strings into a tree structure for course catalog requirements.
 * 
 * Main Functions:
 * - initialSanitize(line): Cleans and normalizes a prerequisite string before tokenization.
 * - initialTokenize(line): Tokenizes a sanitized prerequisite string into logical tokens (PHRASE, AND, OR, SEPARATOR, EXPRESSION).
 * - sanitize(phrase): Standardizes a phrase, converting department/class formats and removing irrelevant words.
 * - parseLine(tokens): Converts preliminary tokens into specific types (SUBJECT, DEPARTMENT, YEAR, CONCURRENT, NONE, AND, OR, SEPARATOR, EXPRESSION, REPEAT).
 * - buildTree(tokens): Builds a logical tree structure from parsed tokens, grouping by AND/OR and handling REPEAT tokens.
 * - cleanTree(node): Recursively cleans a tree node, removing empty or NONE nodes.
 * - parsePrereqs(catalog): Parses all prerequisite strings in a course catalog and attaches the parsed tree to each course.
 * 
 * Token Types:
 * - PHRASE: Any phrase not recognized as a logical operator or expression.
 * - AND: Logical "and".
 * - OR: Logical "or".
 * - SEPARATOR: Comma or semicolon (converted to OR).
 * - EXPRESSION: Parenthetical expression (array of tokens).
 * - SUBJECT: A class (e.g. "COMP-0011").
 * - DEPARTMENT: A department (e.g. "COMP").
 * - YEAR: Class year (0-3 for freshman-senior).
 * - CONCURRENT: Class that can be taken concurrently.
 * - NONE: No prerequisite.
 * - REPEAT: Indicates repetition (e.g. "2 courses").
 * - ONE OF: Logical "or" group.
 * - ALL OF: Logical "and" group.
 * 
 * Error Handling:
 * - Throws errors for empty lines, unparsed phrases, malformed trees, and invalid token sequences.
 * 
 * Usage:
 * 1. Call parsePrereqs(catalog) with a catalog object containing prerequisite strings.
 * 2. Each course will have a "parsedPrereq" field containing the parsed prerequisite tree.
 */
// I WILL DIE FOR COPILOT


// use Ors for anything that needs to be filtered absolutely immediately or the parsing will break (use of booleans like OR is the main reason)
const removeOrs = ["AANDS STUDENTS WITH", "EQV", "OR HIGHER", "AANDS OR SOE STUDENTS WITH", "WITH C- OR BETTER", "OR ABOVE", "PRIOR COMPLETION OF", "REQUIRES COMPLETION OF ANY", "REQUIRES THE COMPLETION OF ANY", "REQUIRES THE COMPLETION OF"]
// use anywhere for more responsive removals
const removeAnywhere = ["PLUS", "MUST HAVE", "CLASSES", "ANY", "ENROLLMENT IN", "ENROLLMENT", "ONE OF", "PRIOR", "COURSE", "COMPLETION OF", "REQUIRES", "COMPLETION", "CLASS", "COURSES", "ABOVE", "IN", "COMPLETED"];

var debug = false
var classesToConsole = ["BIO-0015", "PHY-0011"] // any classes in this array will make debug be true when running

/**
 * Performs initial sanitization of a prerequisite line before tokenization.
 * - Converts to uppercase.
 * - Keeps only the first line.
 * - Removes text preceding a colon.
 * - Removes specific parentheticals.
 * - Normalizes slashes and department/class patterns.
 * - Applies phrase substitutions and removals.
 * - Replaces "&" with "AND" and "/" with "OR".
 * - Removes periods and empty parentheses.
 *
 * @param {string} line - The prerequisite line to sanitize.
 * @returns {string} The sanitized prerequisite line.
 */
const initialSanitize = (line) => {
    // initial sanitization of a prerequisite line before tokenization

    // convert to uppercase
    line = line.toUpperCase();

    // only keep the first line
    line = line.split("\n")[0].trim();

    // remove any text preceding a colon
    if (line.includes(":")) {
        line = line.split(":").slice(1).join(":").trim();
    }

    // remove stupid ass parentheticals
    const stupidAssParentheticals = [
        "OR EQUIVALENTS",
        "MAY BE ENROLLED IN THE SAME SEMESTER",
        "CONCURRENT OR COMPLETED",
        "MUST BE TAKEN CONCURRENT",
        "RESTRICTED UNDERGRADUATES IN THEIR FIRST OR SECOND YEAR",
    ]
    const sapRegex = new RegExp(`\(${stupidAssParentheticals.join("|")}\)`, "g");
    line = line.replace(sapRegex, "");

    // add a space in between the slash when this pattern appears: "CLASS 0001/CLASS 0002"
    line = line.replace(/([A-Z]{2,4} \d{1,4}[A-Z]?)\/([A-Z]{2,4} \d{1,4}[A-Z]?)/g, "$1 / $2");

    // same thing but with the pattern "DEPT1/DEPT2 1234"
    line = line.replace(/([A-Z]{2,4})\/([A-Z]{2,4}) (\d{1,4}[A-Z]?)/g, "$1 / $2 $3");

    // substitute entire lines
    const entireLineSubstitutions = {
        "OPEN TO EDUCATION AND SCI, TECH, AND SOCIETY MAJOR ONLY OR CONSENT": "NONE",
    }
    if (line in entireLineSubstitutions) {
        return entireLineSubstitutions[line];
    }

    // substitute specific phrases for specific others
    const substitutions = {
        "PRE OR CO-REQUISITE": "CONCURRENT ENROLLMENT",
        "PRE OR CO REQUISITE": "CONCURRENT ENROLLMENT",
        "CONCURRENT ENROLLMENT IN OR PRIOR COMPLETION OF": "CONCURRENT ENROLLMENT IN",
        "CURRENT ENROLLMENT": "CONCURRENT ENROLLMENT",
        "PREVIOUS OR CONCURRENT": "CONCURRENT",
        "SAME TERM ENROLLMENT": "CONCURRENT ENROLLMENT",
        "COMPLETION OF OR CONCURRENT ENROLLMENT": "CONCURRENT ENROLLMENT",
        "COMPLETION OR CONCURRENT ENROLLMENT": "CONCURRENT ENROLLMENT",
        "CONCURRENT ENROLLMENT OR COMPLETION": "CONCURRENT ENROLLMENT",
        "CONCURRENT ENROLLMENT OF": "CONCURRENT ENROLLMENT IN",
        "STUDENTS MUST ALSO ENROLL IN": "CONCURRENT ENROLLMENT IN",
        "SAME TIME ENROLLMENT": "CONCURRENT ENROLLMENT",
        "SIMULTANEOUS ENROLLMENT IN": "CONCURRENT ENROLLMENT IN",
        "OR CONCURRENT": "CONCURRENT ENROLLMENT",
        "PRIOR COMPLETION OR CONCURRENT ENROLLMENT IN": "CONCURRENT ENROLLMENT IN",

        "ARCHEOLOGY": "ARCH",
        "ECONOMICS": "EC",
        "PHYSICS": "PHY",
        "ENGLISH": "ENG",
        "SOCIOLOGY": "SOC",
        "LATIN": "LAT",
        "SPANISH": "SPN",
        "TDPS": "TPS",
        "GREEK": "GRK",
        "MECHANICAL ENGINEERING": "ME",
        "CHEMISTRY": "CHEM",
        "PORTUGUESE": "POR",
        "MATHEMATICS": "MATH",
        "EDUCATION": "ED",
        "PHILOSOPHY": "PHIL",
        "COMPUTER SCIENCE": "CS",

        "PHY 1 AND 11 SHARED LAB": "PHY 1",
        "PHY 2 AND 12 SHARED LAB": "PHY 2",
        "PSY 10 LEVEL": "(PSY 12 or 13)",
        "PSY 20 LEVEL": "(PSY 22, 25, 27, or 28)",
        "AT LEAST ONE CS CLASS NUMBERED ABOVE 100": "(CS 105, 112, 115, 117, 118, 121, 131, 132, 134, 135, 136, 138, 150, 151, 152, 160, 163, 165, 166, 170, 175, 182, 191, 195, or 197)",
        "100-LEVEL LAT COURSE OTHER THAN LAT 120": "(LAT 140, 191, 181, or 132)",
        "30-LEVEL SPN": "(SPN 30, 31, 32, or 33)",
        "BIOLOGY GROUP B": "(BIO 75, 108, 110, 112, 115, 116, 117, 118, 134, 186 or 246)"
    }
    var pendingSubstitution = true;
    while (pendingSubstitution) {
        pendingSubstitution = false;
        for (const [key, value] of Object.entries(substitutions)) {
            const regex = new RegExp(`\\b${key}\\b`, "g");
            if (regex.test(line)) {
                line = line.replace(regex, value);
                pendingSubstitution = true;
            }
        }
    }

    // replace "&" with "AND"
    line = line.replace(/&/g, "AND");

    // replace "/" with "OR"
    line = line.replace(/\//g, "OR");

    // remove the following phrases wherever they appear
    const removeOrRegex = new RegExp(`\\b(${removeOrs.join("|")})\\b`, "gi");
    line = line.replace(removeOrRegex, "").replace(/\s+/g, " ").trim();

    // remove periods (can't have this in the regex because it would match any character and escaping doesnt work if you use the RegExp constructor)
    line = line.replace(/\./g, "").trim();

    // remove (s)
    line = line.replace("(S)", "").trim();

    // remove empty ()
    line = line.replace("()", " NONE ").trim();

    return line;
}


const initialTokenize = (line) => {
    // converts a line into an array of tokens of the form {type: "PHRASE"/"AND"/"OR"/"SEPARATOR/EXPRESSION", value: token/string/null}
    // where PHRASE is any phrase that is not "and" or "or", AND is the word "and" (case-insensitive), OR is the word "or" (case-insensitive), SEPARATOR is a comma or semicolon, and EXPRESSION is a parenthetical expression
    // e.g. "COMP 11, COMP 15 or COMP 40" becomes
    // [
    //   {type: "PHRASE", value: "COMP 11"},
    //   {type: "SEPARATOR", value: ","},
    //   {type: "PHRASE", value: "COMP 15"},
    //   {type: "OR", value: "or"},
    //   {type: "PHRASE", value: "COMP 40"}
    //  ]

    // if the line is empty, throw an error
    if (line.trim().length == 0) throw new Error("Empty prerequisite line");

    line = initialSanitize(line);
    if (debug) console.log("Sanitized line:", line);

    // // i aint reading all that
    // // returns NONE for anything too long
    // const maxLength = 80
    // if (line.length > maxLength) return [{ type: "NONE", value: null }];

    // return NONE for any of the following phrases
    const nonePhrases = ["MASTERS", "ONLY ONE CREDIT OF", "5TH YEARS"];
    const noneRegex = new RegExp(nonePhrases.join("|"), "i");
    if (noneRegex.test(line)) return [{ type: "NONE", value: null }];

    // array of tokens to return
    const tokens = [];

    // for each parenthetical expression, replace it with a token of type EXPRESSION and value the expression without parentheses recursively tokenized
    const parenRegex = /\(([^()]+)\)/g;
    let match;
    let lastIndex = 0;
    while ((match = parenRegex.exec(line)) !== null) {
        // add the text before the parenthetical expression as a PHRASE token, extracting any trailing boolean operators (and oxford commas) as separate tokens
        if (match.index > lastIndex) {
            const before = line.substring(lastIndex, match.index).trim();
            // check for trailing boolean operators + oxford commas
            const trailingBoolRegex = /\s+(and|or)\s*$|,\s*$/i;
            const boolMatch = before.match(trailingBoolRegex);
            if (boolMatch) {
                // add the phrase without the trailing boolean operator
                const phrase = before.substring(0, boolMatch.index).trim();
                if (phrase.length > 0) {
                    tokens.push({ type: "PHRASE", value: phrase });
                }
                // add the boolean operator as a separate token
                if (boolMatch[1]) {
                    const boolType = boolMatch[1].toLowerCase() == "and" ? "AND" : "OR";
                    tokens.push({ type: boolType, value: null });
                } else {
                    tokens.push({ type: "SEPARATOR", value: "," });
                }
            } else {
                tokens.push({ type: "PHRASE", value: before });
            }
        }
        // add the parenthetical expression as an EXPRESSION token
        const inner = match[1];
        const innerTokens = initialTokenize(inner);
        tokens.push({ type: "EXPRESSION", value: innerTokens });

        lastIndex = parenRegex.lastIndex;
    }

    // add the text after the last parenthetical expression as a PHRASE token, extracting any leading boolean operators (and oxford commas) as separate tokens
    if (lastIndex < line.length) {
        const after = line.substring(lastIndex).trim();
        // check for leading boolean operators + oxford commas
        const leadingBoolRegex = /^\s*(and|or)\s+|^\s*,\s*/i;
        const boolMatch = after.match(leadingBoolRegex);
        if (boolMatch) {
            // add the boolean operator as a separate token
            if (boolMatch[1]) {
                const boolType = boolMatch[1].toLowerCase() == "and" ? "AND" : "OR";
                tokens.push({ type: boolType, value: null });
            } else {
                tokens.push({ type: "SEPARATOR", value: "," });
            }
            // add the phrase without the leading boolean operator
            const phrase = after.substring(boolMatch[0].length).trim();
            if (phrase.length > 0) {
                tokens.push({ type: "PHRASE", value: phrase });
            }
        } else {
            tokens.push({ type: "PHRASE", value: after });
        }
    }

    // remove any stray parentheses from PHRASE tokens
    tokens.forEach((token, idx) => {
        if (token.type === "PHRASE") {
            token.value = token.value.replace(/[()]/g, "").trim();
        }
    });

    // remove any trailing commas from PHRASE tokens
    tokens.forEach((token, idx) => {
        if (token.type === "PHRASE") {
            token.value = token.value.replace(/,\s*$/g, "").trim();
        }
    });

    if (debug) console.log("Tokens after parenthetical extraction:", Array.from(tokens));

    // split PHRASE tokens by AND/OR/SEPARATOR
    const splitRegex = /\s+(and|or)\s+|([,;])/gi;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type == "PHRASE") {
            const parts = token.value.split(splitRegex).filter(s => s !== undefined && s.trim().length > 0);
            if (parts.length > 1) {
                const newTokens = [];
                for (const part of parts) {
                    const trimmed = part.trim();
                    if (/^and$/i.test(trimmed)) {
                        newTokens.push({ type: "AND", value: null });
                    } else if (/^or$/i.test(trimmed)) {
                        newTokens.push({ type: "OR", value: null });
                    } else if (/^[,;]$/.test(trimmed)) {
                        newTokens.push({ type: "SEPARATOR", value: trimmed });
                    } else {
                        newTokens.push({ type: "PHRASE", value: trimmed });
                    }
                }
                // replace the current token with the new tokens
                tokens.splice(i, 1, ...newTokens);
                i += newTokens.length - 1; // adjust index to account for new tokens
            }
        }
    }

    // remove any PHRASE tokens that are just empty strings or parentheses
    const phrasesToRemove = ["(", ")", ""]
    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type == "PHRASE" && phrasesToRemove.includes(tokens[i].value)) {
            tokens.splice(i, 1);
        }
    }

    // just in case we missed any, replace boolean AND/OR with type AND/OR
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].type == "PHRASE") {
            if (/^and$/i.test(tokens[i].value)) {
                tokens[i] = { type: "AND", value: null };
            } else if (/^or$/i.test(tokens[i].value)) {
                tokens[i] = { type: "OR", value: null };
            }
        }
    }

    // remove any separators that are back to back
    for (let i = 1; i < tokens.length - 1; i++) {
        if (tokens[i - 1].type == "SEPARATOR" && (tokens[i].type == "AND" || tokens[i].type == "OR")) tokens.splice(i - 1, 1);
    }

    if (debug) console.log("Initial tokenization result: ", tokens)
    return tokens;
}

const sanitize = (phrase) => {
    // converts a phrase to a standard format

    // if the phrase is a department name followed by a space then a number, return the phrase with a "-"" in between and the number padded to 4 digits
    if (/^[A-Z]{2,4} \d{1,4}[A-Z]?$/.test(phrase)) {
        const parts = phrase.split(" ");
        const dept = parts[0];
        let num = parts[1];
        // pad number to 4 digits
        num = num.padStart(4, '0');
        return `${dept}-${num}`;
    }

    // if the phrase contains one of the following, return "NONE"
    // most of these cases is utter bullshit
    const nonePhrases = ["MSCS", "PHD", "POSTBACS", "NONE", "PERMISSION", "CONSENT", "EQUIVALENT", "COLLEGE WRITING REQUIREMENT", "CAP ADVISING", "MFA", "STUDENTS ONLY", "GRADUATE", "GRADUATE STUDENTS", "OR GRADUATE STANDING", "GRAD", "RESTRICTED", "MAJOR", "NOT", "MINOR", "MAY BE ENROLLED", "SEQUENCE"];
    const noneRegex = new RegExp(nonePhrases.join("|"), "i");
    if (noneRegex.test(phrase)) return "NONE";

    // remove the following phrases if they appear at the start or end of the phrase
    const removePhrases = ["CLASSES IN", "EITHER", "THE", "STANDING", "OR", "ENROLLMENT IN", "A- IN", "SOE STUDENTS WHO HAVE", "AT LEAST", "STUDENTS WITH"]
    const removeRegex = new RegExp(`^(${removePhrases.join("|")})\\s+|\\s+(${removePhrases.join("|")})$`, "gi");
    phrase = phrase.replace(removeRegex, "").trim();

    // remove the following phrases if they appear anywhere
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

/**
 * Parses an array of preliminary prerequisite tokens into a more specific array of tokens,
 * identifying types such as SUBJECT, DEPARTMENT, YEAR, CONCURRENT, NONE, AND, OR, SEPARATOR, and EXPRESSION.
 * Handles nested expressions, department lists, class years, concurrent enrollment, and more.
 * Throws an error if any unparsed phrase tokens remain after parsing.
 *
 * @param {Array<Object>} tokens - Array of tokens from tokenizePhrases, each with a `type` and `value`.
 * @returns {Array<Object>} Array of parsed tokens with specific types and values.
 *
 * Token types:
 * - SUBJECT: A class (e.g. "COMP-0011")
 * - DEPARTMENT: A department (e.g. "COMP")
 * - YEAR: Class year (0-3 for freshman-senior)
 * - CONCURRENT: Class that can be taken concurrently
 * - NONE: No prerequisite
 * - AND: Logical "and"
 * - OR: Logical "or"
 * - SEPARATOR: Comma or semicolon (converted to OR)
 * - EXPRESSION: Parenthetical expression (array of tokens)
 * - REPEAT: Indicates repetition (e.g. "2 courses")
 *
 * @throws {Error} If any unparsed phrase tokens remain after parsing.
 */
const parseLine = (tokens) => {
    // parses a preliminarily parsed prerequisite line (array of tokens from tokenizePhrases) into a more specific array of tokens of the form {type: "SUBJECT"/"DEPARTMENT"/"YEAR"/"CONCURRENT"/"NONE"/"AND"/"OR"/"SEPARATOR"/"EXPRESSION", value: token/string/null}  
    // where SUBJECT is a class (e.g. "COMP-11"), DEPARTMENT is a department (e.g. "COMP"), YEAR is a class year (0-3 for freshman-senior), CONCURRENT is a class that can be taken concurrently (e.g. "CONCURRENT ENROLLMENT IN COMP-11"), NONE is no prerequisite, AND is the word "and", OR is the word "or", SEPARATOR is a comma or semicolon, and EXPRESSION is a parenthetical expression
    // e.g. "COMP 11, COMP 15 or COMP 40" becomes
    // [
    //   {type: "SUBJECT", value: "COMP-0011"},
    //   {type: "SEPARATOR", value: ","},
    //   {type: "SUBJECT", value: "COMP-0015"},
    //   {type: "OR", value: "or"},
    //   {type: "SUBJECT", value: "COMP-0040"}
    //  ]

    // repeatedly parse phrases into more specific types until no phrases remain or 5 iterations have occurred
    for (var tries = 0; tries < 10; tries++) {
        if (debug) console.groupCollapsed(`Parsing iteration ${tries + 1}`);
        var unparsedPhrases = false;

        // iterate through tokens, including children of EXPRESSION tokens
        for (var i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (debug) console.log("Parsing token:", token);

            if (token.type == "EXPRESSION") {
                token.value = parseLine(token.value);
                continue; // move to next token
            }

            // sort phrases into more specific types
            else if (token.type == "PHRASE") {
                unparsedPhrases = true;
                const phrase = sanitize(token.value)

                if (phrase == "CONCURRENT") {
                    token.type = "CONCURRENT"
                    token.value = null
                    continue
                }

                // check for "CONCURRENT IN XXX"
                const concurrentRegex = /^CONCURRENT (.+)$/i;
                // check for "XXX CONCURRENT"
                const concurrentRegex2 = /^(.+?) CONCURRENT$/i;
                // check for the "XXX COREQUISITE"
                const coreqRegex = /^(.+?) COREQUISITE$/i;
                if (
                    concurrentRegex.test(phrase) ||
                    concurrentRegex2.test(phrase) ||
                    coreqRegex.test(phrase)
                ) {
                    var match;
                    if (concurrentRegex.test(phrase))  match = phrase.match(concurrentRegex);
                    if (concurrentRegex2.test(phrase))  match = phrase.match(concurrentRegex2);
                    if (coreqRegex.test(phrase)) match = phrase.match(coreqRegex);

                    token.type = "CONCURRENT"                    
                    token.value = null

                    // replace the current token with the new tokens
                    tokens.splice(i, 1, [token, {type: "PHRASE", value: match}])

                    continue; // move to next token
                }

                // if the phrase is a department name followed by a list of numbers, e.g. "COMP 11 & 12", "MATH 22, 23", "CHEM 1A or 1B", split it into multiple SUBJECT tokens separated by AND/OR tokens
                const departmentRegex = /^([A-Z]{2,4})\s+((?:\d{1,4}[A-Z]?)(?:\s*([&,]|or|and)\s*\d{1,4}[A-Z]?)+)$/i;
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
                    tokens.splice(i, 1, ...newTokens);
                    continue; // move to next token
                }

                // if the phrase is "NONE", return type "NONE"
                if (phrase == "NONE") {
                    token.type = "NONE"
                    token.value = null;
                    continue; // move to next token
                }

                // if the phrase is a class year, e.g. freshman, sophomore, junior, senior, return type "YEAR"
                // maps freshman -> 0, sophomore -> 1, junior -> 2, senior -> 3
                // includes plurals and shorthand like "1st year"
                if (/^(FRESHMAN|FRESHMEN|FIRST YEARS|FIRST YEAR STUDENTS ONLY|FIRST-YEARS)$/i.test(phrase)) {
                    token.type = "YEAR"
                    token.value = 0;
                    continue; // move to next token
                }
                if (/^(SOPHOMORE|SOPHOMORES)$/i.test(phrase)) {
                    token.type = "YEAR"
                    token.value = 1;
                    continue; // move to next token
                }
                if (/^(JUNIOR|JUNIORS|JR'S|JR)$/i.test(phrase)) {
                    token.type = "YEAR"
                    token.value = 2;
                    continue; // move to next token
                }
                if (/^(SENIOR|SENIORS|SR'S)$/i.test(phrase)) {
                    token.type = "YEAR"
                    token.value = 3;
                    continue; // move to next token
                }

                // check if the phrase is formatted like a class name, e.g. "COMP-11", "MATH-22A", "ECON-101"
                const classRegex = /^[A-Z]{2,4}-\d{1,4}[A-Z]?$/;
                if (classRegex.test(phrase)) {
                    // does this class acc exist?
                    if (!class_names.includes(phrase)) {
                        if (debug) console.warn(`Warning: class ${phrase} not found in catalog`)
                    }
                    token.type = "SUBJECT"
                    token.value = phrase

                    continue; // move to next token
                }

                // if the phrase starts with a number, create a new REPEAT token with the number as the value and the rest of the phrase as a PHRASE token
                const repeatRegex = /^(\d+)\s+(.+)$/;
                if (repeatRegex.test(phrase)) {
                    const match = phrase.match(repeatRegex);
                    const count = parseInt(match[1]);
                    const rest = match[2].trim();

                    // replace the current token with a REPEAT token and a PHRASE token
                    tokens.splice(i, 1, { type: "REPEAT", value: count }, { type: "PHRASE", value: rest });
                    continue; // move to next token
                }

                // if the phrase is a department name, e.g. "COMP", "MATH", "ECON", return type "DEPARTMENT"
                if (departments.includes(phrase)) {
                    token.type = "DEPARTMENT"
                    token.value = phrase
                    continue; // move to next token
                }

                // check if the current phrase can be tokenized again
                if (phrase.trim().length > 0) { // only try if the phrase is not empty
                    const tokenizedAgain = initialTokenize(phrase);
                    if (tokenizedAgain.length > 1) {
                        // replace the current token with the new tokens
                        const index = tokens.indexOf(token);
                        tokens.splice(index, 1, ...tokenizedAgain);
                    }

                    else {
                        token.value = phrase; // update the phrase to the sanitized version
                    }

                    continue
                }
            }
        }

        // do token-wise parsing
        for (var i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            if (i < tokens.length - 1) {
                nextToken = tokens[i + 1]
                // if the previous token is a number and the next token is not a phrase, duplicate 
                if (
                    token.type === "PHRASE" &&
                    /^\d+$/.test(token.value) &&
                    nextToken.type === "EXPRESSION"
                ) {
                    token.type = "REPEAT"
                    token.value = parseInt(token.value)
                }
            }

            if (token.type == "AND" || token.type == "OR" || token.type == "SEPARATOR") {
                if (i > 0 && i < tokens.length - 1) {
                    // here we do parsing at the token scale if needed
                    const prevToken = tokens[i - 1];
                    const nextToken = tokens[i + 1];

                    // if the previous token is a SUBJECT and the next token is a PHRASE that is just a number, e.g. "COMP-11 and 15", convert the PHRASE to a SUBJECT with the same department as the previous SUBJECT
                    if (prevToken.type == "SUBJECT" && nextToken.type == "PHRASE") {

                        const numberRegex = /^\d{1,4}[A-Z]?$/;
                        if (numberRegex.test(nextToken.value)) {
                            const dept = prevToken.value.split("-")[0];
                            nextToken.type = "SUBJECT"
                            nextToken.value = `${dept}-${nextToken.value.padStart('0', 4)}`
                            i++; // skip the next token since we just parsed it
                            continue; // move to next token
                        }
                    }

                    // propogate AND/OR left to previous SEPARATOR tokens until another AND/OR is found
                    if (token.type == "AND" || token.type == "OR") {
                        // propogate left
                        for (let j = i - 1; j >= 0; j--) {
                            const t = tokens[j];
                            if (t.type == "SEPARATOR") {
                                t.type = token.type;
                                t.value = null;
                            } else if (t.type == "AND" || t.type == "OR") {
                                break; // stop propogating if we hit another AND/OR
                            }
                        }
                    }
                }
            }
        }

        if (debug) console.groupEnd();

        if (!unparsedPhrases) break
    }

    // remove any lingering phrases from the token array
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type === "PHRASE" && removeAnywhere.includes(tokens[i].value)) {
            tokens.splice(i, 1);
        }
    }

    // if there is a phrase that doesn't match, throw an error
    for (const token of tokens) {
        if (token.type === "PHRASE" && token.value.trim().length > 0) {
            throw new Error(`Unparsed phrase token detected: "${token.value}" in tokens: ${JSON.stringify(tokens, null, 2)}`);
        }
    }

    // remove any lingering separator tokens if they are the last token or if the next token is NONE
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (
            tokens[i].type === "SEPARATOR" &&
            (i === tokens.length - 1 || (tokens[i + 1] && tokens[i + 1].type === "NONE"))
        ) {
            tokens.splice(i, 1);
        }
    }

    // convert any remaining separators into OR
    for (const token of tokens) {
        if (token.type == "SEPARATOR") token.type = "OR"
    }

    return tokens
}

const buildTree = (tokens) => {
    // builds a tree structure from an array of parsed tokens
    // mainly focuses on grouping booleans and handling REPEAT tokens
    // the tree will only have nodes of the form {type: "SUBJECT"/"DEPARTMENT"/"YEAR"/"CONCURRENT"/"ONE OF"/"ALL OF", value: token/string/null/array}

    // if the tokens is NONE, return null
    if (tokens.length == 1 && tokens[0].type == "NONE") {
        return null;
    }

    // if the tokens is a single token, return the token
    if (tokens.length == 1) {
        const token = tokens[0];
        if (token.type == "EXPRESSION") {
            return buildTree(token.value);
        }

        return token;
    }

    // iterate through the tokens and build the tree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type == "EXPRESSION") {
            tokens[i] = buildTree(token.value)
        }
    }

    // iterate through the tokens and build the tree
    for (let i = tokens.length - 1; i >= 0; i++) {
        const token = tokens[i];
        if (token.type == "CONCURRENT") { // a CONCURRENT token should take whatever follows it as a value
            if (i == tokens.length - 1) throw new Error(`CANNOT END A TREE WITH CONCURRENT`)
            token.value = tokens.splice(i + 1, 1)[0]
        }
    }

    // iterate through the tokens and build the tree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // a REPEAT and DEPARTMENT/SUBJECT token should be replaced by an ALL OF node with REPEAT.value copies of DEPARTMENT/SUBJECT
        if (token.type == "REPEAT") {
            if (token.type == "REPEAT") {
                if (i >= tokens.length - 1) throw new Error(`REPEAT node without anything to repeat`)

                if ((tokens[i + 1].type == "DEPARTMENT" || tokens[i + 1].type == "SUBJECT")) {
                    const deptToken = tokens[i + 1];
                    const allOfNode = {
                        type: "ALL OF",
                        value: Array.from({ length: token.value }, () => ({ ...deptToken }))
                    };
                    // Replace REPEAT and DEPARTMENT tokens with the ALL OF node
                    tokens.splice(i, 2, allOfNode);
                    // Move index back to account for removed tokens
                    i -= 1;
                    continue
                }

                var toRepeat

                if (tokens[i + 1].type == "EXPRESSION") {
                    expression = tokens[i + 1].value
                    toRepeat = buildTree(expression)
                }
                else {
                    toRepeat = tokens[i + 1]
                }

                const allOfNode = {
                    type: "ALL OF",
                    value: []
                }
                if (toRepeat.type == "ALL OF") {
                    for (var j = 0; j < token.value; j++) {
                        for (const node of toRepeat.value) allOfNode.value.push(node)
                    }
                }
                else {
                    for (var j = 0; j < token.value; j++) {
                        allOfNode.value.push(toRepeat)
                    }
                }

                tokens.splice(i, 2, allOfNode);
                // Move index back to account for removed tokens
                i -= 1;
            }
        }
    }

    // iterate through the tokens and build the tree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        // convert a group of tokens seperated by AND into an ALL OF node
        if (token.type == "AND") {
            if (i == 0 || i == tokens.length - 1) {
                throw new Error("AND token cannot be at the start or end of the token list");
            }

            const left = tokens[i - 1];
            const right = tokens[i + 1];

            // if the right side is an expression, build its tree
            if (right.type == "EXPRESSION") {
                right.value = buildTree(right.value);
            }

            // if the left side is an ALL OF node, merge the right side into it
            if (left.type == "ALL OF") {
                if (right.type != "ALL OF") left.value.push(right);
                else {
                    for (const node of right.value) left.value.push(node)
                }

                tokens.splice(i, 2); // remove the AND and right tokens
                i -= 1; // move the index back to account for the removed tokens
                continue; // move to next token
            }

            const allOfNode = { type: "ALL OF", value: [left, right] };

            // replace the left, AND, and right tokens with the ALL OF node
            tokens.splice(i - 1, 3, allOfNode);

            // move the index back to account for the removed tokens
            i -= 1;
        }

        // convert a group of tokens seperated by OR into a ONE OF node
        if (token.type == "OR") {
            if (i == 0 || i == tokens.length - 1) {
                throw new Error("OR token cannot be at the start or end of the token list");
            }

            const left = tokens[i - 1];
            const right = tokens[i + 1];

            // if the right side is an expression, build its tree
            if (right.type == "EXPRESSION") {
                right.value = buildTree(right.value);
            }

            // if the left side is an ALL OF node, merge the right side into it
            if (left.type == "ONE OF") {
                left.value.push(right);
                tokens.splice(i, 2); // remove the AND and right tokens
                i -= 1; // move the index back to account for the removed tokens
                continue; // move to next token
            }

            const oneOfNode = { type: "ONE OF", value: [left, right] };

            // replace the left, OR, and right tokens with the ONE OF node
            tokens.splice(i - 1, 3, oneOfNode);

            // move the index back to account for the removed tokens
            i -= 1;
        }
    }

    if (tokens.length > 1) {
        if (tokens[1].type == "NONE") return cleanTree(tokens[0])

        console.error("Failed tree: ", tokens, "Token types:", tokens.map(t => t.type), "Context:", JSON.stringify(tokens, null, 2))
        throw new Error(`buildTree failed`)
    }

    return cleanTree(tokens[0]);
}

function cleanTree(node) {
    if (!node) return null;
    if (node.type === "NONE") return null;

    // Handle group nodes recursively
    if ((node.type === "ONE OF" || node.type === "ALL OF") && Array.isArray(node.value)) {
        // Clean each child node
        const cleanedChildren = node.value
            .map(cleanTree)
            .filter(child => child !== null);

        // If no children remain, remove this node
        if (cleanedChildren.length === 0) return null;

        // Return the cleaned group node
        return { type: node.type, value: cleanedChildren };
    }

    // For SUBJECT, YEAR, and DEPARTMENT, just return the node
    return node;
}

const parsePrereqs = (catalog) => {
    // run parseLine on each class's prereq string and store the result in a new field "parsedPrereq"
    for (const subject in catalog) {
        debug = classesToConsole.includes(subject)
        if (debug) console.group(`Parsing prereqs for ${subject}`)
        if (debug) console.log("Original prereq string:", catalog[subject].prereqs)
        const initialTokens = initialTokenize(catalog[subject].prereqs)
        if (debug) console.log("Initial tokens:", Array.from(initialTokens))
        const parsedTokens = parseLine(initialTokens)
        if (debug) console.log("Parsed tokens:", Array.from(parsedTokens))
        const prereqTree = buildTree(parsedTokens)
        if (debug) console.log("Prereq tree:", prereqTree)

        if (prereqTree != null && prereqTree.length > 1) throw new Error(subject)

        catalog[subject].parsedPrereq = prereqTree;
        if (debug) console.groupEnd();
    }
}