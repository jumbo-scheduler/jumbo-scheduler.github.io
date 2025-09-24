class Schedule {
    constructor() {
        this.years = [
            [new Term(), new Term()],
            [new Term(), new Term()],
            [new Term(), new Term()],
            [new Term(), new Term()]
        ],
        // 1D array of all classes that have been added to the schedule
        this.completedClasses = []

        // 1D array of all classes, departments, and attributes.
        this.requirements = []
    }

    /**
     * merges all majors into one array
     * @returns an array of requirements
     */
    static getRequirements() {
        let allMajors = fetch_all_requirements();
        var output = []
        for (var major of allMajors) {
            for (var course of major.classes) {
                output.push({
                    type: "CLASS",
                    value: course.config[0]
                });
            }

            for (var department of major.departments) {
                output.push({
                    type: "DEPARTMENT",
                    value: department.config[0]
                });
            }

            for (var attribute of major.attributes) {
                output.push({
                    type: "ATTRIBUTE",
                    value: attribute.config[0]
                });
            }

            for (var multi of major.multis) {
                output.push({
                    type: "ONE OF",
                    value: multi
                });
            }
        }
        // currently just merges all together, no minimization
        return output
    }

    /**
     * checks if the classes in completedClasses satisfy the requirements
     * @returns a boolean for if the schedule is complete
     */
    requirementsCompleted() {
        // make a copy because we are going to by modifying the array
        completedClassPool = this.completedClasses.slice(0)

        // check explicitly required classes first
        for (var requirement of this.requirements) {
            if (requirement.type == "CLASS") {
                if (completedClassPool.includes(requirement.value)) {
                    // remove the class from the pool (forbids duplicates)
                    completedClassPool.splice(completedClassPool.indexOf(requirement.value), 1)
                }
                else return false
            }
        }

        // TODO: add functionality for more

        return true
    }  
    
    /**
     * The member variable years for the Schedule object is populated.
     * 
     * @returns none
     */
    populateSchedule() {
        this.requirements = getRequirements()
        this.completedClasses = []

        for (var year = 0; year < 4; year++) {
            for (var term = 0; term < 2; term++) {
                this.currentClasses = this.years[year][term].classes

                this.completedClasses.push(...this.currentClasses)
            }
        }
    }

    renderSchedule() {
        print("Rendering schedule...");
        // bro lied
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
    prereqsSatisfied(node=null, completedClasses=[], currentClasses=[]) {
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
}

class Class {
    constructor(name="None", object=null) {
        this.frozen = false // user wants this class to stay in current position in schedule
        this.name = name
        this.object = object
    }
}

class Term {
    constructor() {
        this.classes = []
        this.credits = 0
        this.minCredits = 12
        this.maxCredits = 18
    }

    /** 
    *   looks up a course in the catalog by name and adds it to the classes property
    *   @param {string} name - the name of the class
    *   @returns {boolean} - if adding was successful (because too many classes)
    */
    addClass(name) {
        const classObject = total_catalog[name]
        if (classObject === undefined) throw new Error(`Unknown class name "${name}"`)
        
        if (this.credits + classObject.credits <= this.maxCredits) {
            this.classes.push(new Class(name, classObject))
            this.credits += classObject.credits
            return true
        }

        return false // could not fit
    }
}