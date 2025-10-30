/**
 * Handles the input for creating the user's required course schedule.
 * Provides UI functionality for selecting classes, departments, and attributes,
 * as well as importing and exporting requirements.
 *
 * @file scheduleInput.js
 */

/**
 * Loads preexisting majors based on the query string and imports their requirements.
 * @function
 */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("reqs") != null) {
    const reqs = urlParams.get("reqs").split(",");

    for (var req of reqs) {
        try {
            var loadedRequirements = loadFile(
                `/premade-requirements/${req}.txt`
            )
                .split("\n")
                .map((x) => x.split("\t").join(""));

            importRequirements(loadedRequirements);
        } catch (err) {
            console.error(`No prereqs found with name "${req}"`);
        }
    }
}
