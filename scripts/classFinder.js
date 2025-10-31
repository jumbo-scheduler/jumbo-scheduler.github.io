const class_finder_template = `
    <section id="class-finder-window">
        <div id="class-finder-topbar">
            <div id="class-finder-header">
                <img src="/img/class_finder_mag.svg">
                <h2>Find a course</h2>
            </div>
            <button id="class-finder-close">
                <img src="/img/class_finder_x.svg">
            </button>
        </div>
        <div id="class-finder">
            <div id="class-finder-search-container">
                <form id="class-finder-search">
                    <label for="cf-quick-search">
                        Quick search <br>
                        <input id="cf-quick-search" name="cf-quick-search" type="text" placeholder="Class name"/>
                    </label>
                    <label for="cf-subject">
                        Course subject <br>
                        <select id="cf-subject" name="cf-subject">
                        </select>
                    </label>
                    <label for="cf-attributes">
                        Attributes <br>
                        <select id="cf-attributes" name="cf-attributes">
                        </select>
                    </label>
                    <input type="submit" value="SEARCH" />
                </form>
                <div id="class-finder-results">
                    <p id="cf-num-results">Enter a search query on the left</p>
                    <div id="cf-results-list">
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

let finderWindow;

window.onload = () => {
    $(document.body).append(class_finder_template);
    finderWindow = $(document.body).find("#class-finder-window");
    
    // TESTING SELECT MENU - DELETE AND POPULATE WITH REAL STUFF
    // SWITCH TO COMBOBOX LATER: https://jqueryui.com/autocomplete/#combobox
    // subjects
    finderWindow.find("#cf-subject").append(`
        <option selected disabled>Pick subject</option>
        <option>${departments.map(x => `${departmentsPlaintext[x]} (${x})`).join(`</option>\n<option>`)}</option>
    `);
    // attributes
    finderWindow.find("#cf-attributes").append(`
        <option selected disabled>Pick attribute</option>
        <optgroup label="SOE">
            <option>${engineeringAttributes.join(`</option>\n<option>`)}</option>
        </optgroup>
        <optgroup label="A&S">
            <option>${artsScienceAttributes.join(`</option>\n<option>`)}</option>
        </optgroup>
    `);

    finderWindow.draggable({handle: "#class-finder-topbar", cancel: "img"});
    finderWindow.find("select").selectmenu();
    finderWindow.find("#class-finder-close").on("click", () => {
        finderWindow.find("#class-finder-search").trigger("reset"); // clear the search
        $("#cf-num-results").text(`Enter a search query on the left`)
        $("#cf-results-list").empty()
        finderWindow.hide();
    })

    finderWindow.hide();

    $("#class-finder-button").on("click", function (e) { 
        e.preventDefault();
        if (finderWindow.is(":visible")) {
            // clear the search
            finderWindow.find("#class-finder-search").trigger("reset")
            $("#cf-num-results").text(`Enter a search query on the left`)
            $("#cf-results-list").empty()
            finderWindow.hide();
        } else {
            finderWindow.show();
        }
    });

    searchForClass()
}

// handle submission:
//      extracts form data
//      searches the catalog for appropriate classes
//      populates the results div
const searchForClass = () => {
    finderWindow.on("submit", e => {
        e.preventDefault(); // no refresh

        // extract form data
        const quickSearchQuery = finderWindow.find("#cf-quick-search").val()
        const subjectQuery = finderWindow.find("#cf-subject").val() == null ? null : finderWindow.find("#cf-subject").val().split('(')[1].split(')')[0]
        const attributeQuery = finderWindow.find("#cf-attributes").val()

        // ok search time
        var results = []
        for (subject in total_catalog) {
            var department = subject.split("-")[0]
            var matchesFilters = true

            // filter by department and attribute
            matchesFilters = 
                (subjectQuery == null || subjectQuery == department) && // matches department
                (attributeQuery == null || total_catalog[subject].attributes.includes(attributeQuery)) // matches attribute

            if (matchesFilters) {
                total_catalog[subject].stringMatch = getStringMatchValue(total_catalog[subject].name, quickSearchQuery)
                if (total_catalog[subject].stringMatch > 0) results.push(total_catalog[subject])
            }
        }

        // now we sort based on string matching
        // quick sort my beloved
        // also extract the subject
        var sortedResults = quicksort(results)


        // populate the results tab
        $("#cf-num-results").text(`Found ${sortedResults.length} results`)
        $("#cf-results-list").empty()

        for (var result of sortedResults) addResult(result)
    })
}

const quicksort = (array) => {
    if (array.length < 2) return array
    const pivot = array[0]

    const before = quicksort(array.slice(1).filter(x => x.stringMatch >= pivot.stringMatch))
    const after = quicksort(array.slice(1).filter(x => x.stringMatch < pivot.stringMatch))

    return before.concat(pivot, after)
}

const getStringMatchValue = (string, searchQuery) => {
    string = string.toUpperCase()
    searchQuery = searchQuery.toUpperCase()

    // if no query, show in alphabetical order with ascending class number
    if (searchQuery == "") {
        const className = string.split('-')[0]
        const number = string.split('-')[1].slice(0, 4)

        const alphabet = "ZYXWVUTSRQPONMLKIJHGFEDCBA"

        return (
            27 * 27 * 27 * alphabet.indexOf(className[0]) +
                 27 * 27 * alphabet.indexOf(className[1]) + 
                      27 * alphabet.indexOf(className[2])
                                                        +
            9999 - parseInt(number)    
        )
    }

    // fine ill add support for "cs11"
    if ((/^([A-Z]{2,4})([0-9]{1,4})$/).test(searchQuery)) {
        const match = searchQuery.match(/^([A-Z]{2,4})([0-9]{1,4})$/)
        searchQuery = [`${match[1]}`, match[2].padStart(4, '0')]
    }
    else searchQuery = searchQuery.split(/ |-/)

    // if we have multiple words in the query, weight the score by how many matches
    var score = 0
    for (var i = 0; i < searchQuery.length; i++) {
        var query = searchQuery[i]

        // pad any numbers to 4 digits
        if (!isNaN(parseInt(query, 10))) query = query.padStart(4, '0')

        // a match is a plus, 
        if (string.includes(query)) {
            // bias matches that occur earlier in the string
            score += 100 - string.indexOf(query)

            // also, matches should only be valid if they are in the same pattern
            // that is, if query is A B C
            // this will not match a string A C B
            // we do this by cutting of any parts of a string preceeding a match
            string = string.slice(string.indexOf(query))
        }
    }

    return score
}

// JOON CHANGE THIS TO MAKE IT NOT UGLY
const addResult = (result) => {
    // this is rlly shitty code. def a first draft. pls change immediately
    const result_template = 
        `<div class=cf-result>
            ${result.name} <br>
            ${result.credits} credits <br>
            Available in ${result.offeredInSpring ? `Spring${result.offeredInFall ? ` and Fall` : ``}` : `Fall`}
        </div>`
    $("#cf-results-list").append(result_template)
}