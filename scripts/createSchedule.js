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