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
                    <p id="cf-num-results">Found n results</p>
                    <div id="cf-results-list">
                        <div class="cf-result">

                        </div>
                        <div class="cf-result">

                        </div>
                        <div class="cf-result">

                        </div>
                        <div class="cf-result">

                        </div>
                        <div class="cf-result">

                        </div>
                        <div class="cf-result">

                        </div>
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
        <option>${departments.join(`</option>\n<option>`)}</option>
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
        finderWindow.hide();
    })

    finderWindow.hide();

    $("#class-finder-button").on("click", function (e) { 
        e.preventDefault();
        if (finderWindow.is(":visible")) {
            // clear the search
            finderWindow.find("#class-finder-search").trigger("reset")

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
        const subjectQuery = finderWindow.find("#cf-subject").val()
        const attributeQuery = finderWindow.find("#cf-attributes").val()

        // ok search time
        var results = []
        for (subject in total_catalog) {
            var department = subject.split("-")[0]
            var matchesFilters = true

            // filter by department and attribute
            matchesFilters = 
                (subjectQuery == null || subjectQuery == department) && // matches department
                (attributeQuery == null || total_catalog[subject].atrributes.includes(attributeQuery)) // matches attribute

            if (matchesFilters) {
                total_catalog[subject].stringMatch = getStringMatchValue(total_catalog[subject].name, quickSearchQuery)
                if (total_catalog[subject].stringMatch > 0) results.push(total_catalog[subject])
            }
        }

        // now we sort based on string matching
        // quick sort my beloved
        // also extract the subject
        var sortedResults = quicksort(results)

        console.log(sortedResults)
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
    searchQuery = searchQuery.toUpperCase().split(" ")

    // first look for exact matches
    if (searchQuery.length == 1 && string.includes(searchQuery[0])) return Infinity

    // if we have multiple words in the query, weight the score by how many matches
    var score = 0
    for (var query of searchQuery) {
        // pad any numbers to 4 digits
        if (parseInt(query) != undefined) query = query.padStart(4, '0')

        if (string.includes(query)) score += 10
    }

    return score
}