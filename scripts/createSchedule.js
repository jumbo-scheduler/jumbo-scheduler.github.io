/* createSchedule.js
 * takes the schedule from schedule input and builds the corresponding schedule
*/

/*  verifyTerm
 *  
 *  Purpose: Verifies that the number of credits are valid for a term
 *  Input:   An array of Courses from the course catalog
 */
const verifyTerm = (term, upperBound = 18) => {
    var totalCredits = 0
    for (var subject of term) totalCredits += subject.credits
    return 12 <= totalCredits && totalCredits <= upperBound
}



// temp DO NOT TOUCH ========================================================
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


var track = [
    new Year("freshman", a(fall_catalog), a(spring_catalog)),
    new Year("sophomore", a(fall_catalog), a(spring_catalog)),
    new Year("junior", a(fall_catalog), a(spring_catalog)),
    new Year("senior", a(fall_catalog), a(spring_catalog))
]

for (const year of track) year.createDisplay()
// ==========================================================================