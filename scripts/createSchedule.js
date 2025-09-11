/**
 * Creates and displays the schedule for each year in the academic track.
 */
/* createSchedule.js
 * takes the schedule from schedule input and builds the corresponding schedule
*/

/**
 * Verifies that the number of credits in a term is within valid bounds.
 * 
 * @param {Array<Object>} term - An array of course objects for the term.
 * @param {number} [upperBound=18] - The maximum allowed credits for the term.
 * @returns {boolean} True if the term has a valid number of credits, false otherwise.
 */
const verifyTerm = (term, upperBound = 18) => {
    var totalCredits = 0
    for (var subject of term) totalCredits += subject.credits
    return 12 <= totalCredits && totalCredits <= upperBound
}

/**
 * Checks if the prerequisites for a course node are satisfied given completed and current classes.
 * 
 * @param {Object|null} node - The prerequisite tree node to check.
 * @param {Array<string>} completedClasses - List of completed class identifiers.
 * @param {Array<string>} currentClasses - List of currently enrolled class identifiers.
 * @returns {boolean} True if prerequisites are satisfied, false otherwise.
 * @throws {Error} If an unknown node type is encountered.
 */
const prereqsSatisfied = (node=null, completedClasses=[], currentClasses=[]) => {
    // no prereqs, automatically allowed
    if (node == null) return true

    switch (node.type) {
        case "ALL OF":
            for (const child of node.value) {
                if (!prereqsSatisfied(child, completedClasses, currentClasses)) return false
            }
            return true
        case "ONE OF":
            for (const child of node.value) {
                if (prereqsSatisfied(child, completedClasses, currentClasses)) return true
            }
            return false
        case "CONCURRENT":
            const allClasses = [...completedClasses, ...currentClasses]
            return prereqsSatisfied(node.value, allClasses, [])
        case "SUBJECT":
            return completedClasses.includes(node.value)
        case "DEPARTMENT":
            const completedDepartments = completedClasses.map(x => x.split('-')[0])
            return completedDepartments.includes(node.value)
        default: 
            throw new Error(`UNKNOWN TYPE IN PREREQ TREE: ${node.type}`)
    }
}

// temp DO NOT TOUCH ========================================================

/**
 * Generates a random schedule for a term from the course catalog that satisfies credit requirements.
 * 
 * @param {Object} catalog - The course catalog object.
 * @returns {Array<Object>} An array of randomly selected course objects for the term.
 */


const a = (catalog) => {
    do {
        var output = []

        const max_classes = 6 - Math.floor(3.0 *Math.random())
        for (var i = 0; i < max_classes; i++) {
            var selection = Object.keys(catalog)[Math.floor(Math.random() * Object.keys(catalog).length)]
            output.push(catalog[selection])
        }
    } while (!verifyTerm(output))
    return output
}


/**
 * Represents the academic track for a student, consisting of four years with randomly generated schedules.
 * 
 * @type {Array<Year>}
 */
var track = [
    new Year("freshman", a(fall_catalog), a(spring_catalog)),
    new Year("sophomore", a(fall_catalog), a(spring_catalog)),
    new Year("junior", a(fall_catalog), a(spring_catalog)),
    new Year("senior", a(fall_catalog), a(spring_catalog))
]

for (const year of track) year.createDisplay()
// ==========================================================================