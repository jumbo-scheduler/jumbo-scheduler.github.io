const class_finder_template = `
    <div class="generic-window-wrapper">
        <section id="class-finder-window" class="generic-window iswindow">
            <div id="class-finder-topbar" class="generic-window-topbar">
                <div id="class-finder-header" class="generic-window-header">
                    <img src="/img/class_finder_mag.svg">
                    <h2>Find a course</h2>
                </div>
                <button id="class-finder-close" class="generic-window-close">
                    <img src="/img/generic_window_x.svg">
                </button>
            </div>
            <div id="class-finder" class="generic-window-contents">
                <div id="class-finder-search-container">
                    <form id="class-finder-search">
                        <label for="cf-quick-search">
                            Quick search <br>
                            <input id="cf-quick-search" name="cf-quick-search" type="text" placeholder="E.g., cs11, calculus, ..."/>
                        </label>
                        <div class="horiz-rule"></div>
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
                        <label for="cf-semester">
                            Semester <br>
                            <select id="cf-semester" name="cf-semester">
                                <option>Both</option>
                                <option>Fall</option>
                                <option>Spring</option>

                            </select>
                        </label>
                        <div class="credit-range-container">
                            <label>Credit Range:</label>
                            <div class="dual-range-slider">
                                <div class="slider-track"></div>
                                <div class="slider-range" id="slider-range"></div>
                                <div class="slider-handle slider-handle-min" id="slider-handle-min" role="slider" aria-valuemin="0" aria-valuemax="10" aria-valuenow="0" tabindex="0"></div>
                                <div class="slider-handle slider-handle-max" id="slider-handle-max" role="slider" aria-valuemin="0" aria-valuemax="10" aria-valuenow="10" tabindex="0"></div>
                            </div>
                            <div class="credit-range-values">
                                <span class="credit-min-value">0</span> – <span class="credit-max-value">10</span> credits
                            </div>
                        </div>
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
    </div>
`;

const help_window_template = `
    <div class="generic-window-wrapper">
        <section id="help-window" class="generic-window iswindow">
            <div class="generic-window-topbar">
                <div class="generic-window-header">
                    <img src="/img/help.svg">
                    <h2>Help</h2>
                </div>
                <button class="generic-window-close">
                    <img src="/img/generic_window_x.svg">
                </button>
            </div>
            <div class="generic-window-contents">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
        </section>
    </div>
`;

const settings_window_template = `
    <div class="generic-window-wrapper">
        <section id="settings-window" class="generic-window iswindow">
            <div class="generic-window-topbar">
                <div class="generic-window-header">
                    <img src="/img/settings.svg">
                    <h2>Settings</h2>
                </div>
                <button class="generic-window-close">
                    <img src="/img/generic_window_x.svg">
                </button>
            </div>
            <div class="generic-window-contents">
                <div class="center">
                    <form id="settings">
                        <label for="darkmode">
                            Dark mode: 
                            <input id="darkmode" name="darkmode" type="checkbox" />
                        </label>
                    </form>
                </div
            </div>
        </section>
    </div>
`;

let windows = [];

function layer_windows() {
    for (let i = 0; i < windows.length; i++) {
        windows[i].style.zIndex = i + 10;
    }
}


let finderWindow;
let helpWindow;
let settingsWindow;

window.onload = () => {
    // generate tooltips out of title attributes
    $(document).tooltip({
        show: {
            delay: 500
        }
    });


    // CLASS FINDER -----------------------------------------------------------
    $(document.body).append(class_finder_template);
    finderWindow = $(document.body).find("#class-finder-window");

    // subjects
    let cf_subject = finderWindow.find("#cf-subject");
    cf_subject.append(`
        <option selected>All</option>
        <option>${departments.map(x => `${departmentsPlaintext[x]} (${x})`).join(`</option>\n<option>`)}</option>
    `);
    // attributes
    finderWindow.find("#cf-attributes").append(`
        <option selected>All</option>
        <optgroup label="SOE">
            <option>${engineeringAttributes.join(`</option>\n<option>`)}</option>
        </optgroup>
        <optgroup label="A&S">
            <option>${artsScienceAttributes.join(`</option>\n<option>`)}</option>
        </optgroup>
    `);

    finderWindow.find("select").selectmenu();
    finderWindow.find("#class-finder-close").on("click", () => {
        finderWindow.find("#class-finder-search").trigger("reset"); // clear the search
        $("#cf-num-results").text(`Enter a search query on the left`)
        $("#cf-results-list").empty()
        finderWindow.hide();
    })

    $("#class-finder-btn").on("click", function (e) {
        e.preventDefault();
        if (finderWindow.is(":visible")) {
            // clear the search
            finderWindow.find("#class-finder-search").trigger("reset")
            $("#cf-num-results").text(`Enter a search query on the left`)
            $("#cf-results-list").empty()
            finderWindow.hide();
        } else {
            windows = windows.filter(element => element != finderWindow[0]);
            windows.push(finderWindow[0]);
            layer_windows();
            finderWindow.show();
        }
    });


    function setupCreditRangeSlider() {
        const slider = $('.dual-range-slider');
        const handleMin = $('#slider-handle-min');
        const handleMax = $('#slider-handle-max');
        const range = $('#slider-range');
        const minValue = $('.credit-min-value');
        const maxValue = $('.credit-max-value');

        const minCredit = 0;
        const maxCredit = 10;
        let activeHandle = null;

        // Function to convert pixel position to credit value
        function posToCredit(pos) {
            const sliderWidth = slider.width();
            const percentage = Math.max(0, Math.min(100, (pos / sliderWidth) * 100));
            return Math.round((percentage / 100) * (maxCredit - minCredit) + minCredit);
        }

        // Function to convert credit value to percentage
        function creditToPercent(credit) {
            return ((credit - minCredit) / (maxCredit - minCredit)) * 100;
        }

        // Function to update handle positions and range
        function updateSlider() {
            const min = parseInt(minValue.text());
            const max = parseInt(maxValue.text());

            const minPercent = creditToPercent(min);
            const maxPercent = creditToPercent(max);

            handleMin.css('left', minPercent + '%');
            handleMax.css('left', maxPercent + '%');
            range.css({
                'left': minPercent + '%',
                'width': (maxPercent - minPercent) + '%'
            });
        }

        // Function to get current credit range
        window.getCreditRange = function () {
            return {
                min: parseInt(minValue.text()),
                max: parseInt(maxValue.text())
            };
        };

        // Function to set credit range programmatically
        window.setCreditRange = function (min, max) {
            // Ensure integers and bounds
            min = Math.max(minCredit, Math.min(maxCredit, Math.round(min)));
            max = Math.max(minCredit, Math.min(maxCredit, Math.round(max)));

            // Ensure min <= max
            if (min > max) {
                min = max;
            }

            minValue.text(min);
            maxValue.text(max);
            updateSlider();
        };

        // Mouse/touch event handlers
        function startDrag(handle, e) {
            e.preventDefault();
            activeHandle = handle;
            handle.addClass('dragging');
        }

        function onDrag(e) {
            if (!activeHandle) return;

            e.preventDefault();

            // Get mouse position relative to slider
            const sliderRect = slider[0].getBoundingClientRect();
            const clientX = e.clientX || (e.originalEvent?.touches?.[0]?.clientX);

            if (!clientX) return;

            let pos = clientX - sliderRect.left;
            pos = Math.max(0, Math.min(sliderRect.width, pos));

            const newCredit = posToCredit(pos);

            if (activeHandle.is(handleMin)) {
                const max = parseInt(maxValue.text());
                const newMin = Math.min(newCredit, max);
                minValue.text(newMin);
            } else {
                const min = parseInt(minValue.text());
                const newMax = Math.max(newCredit, min);
                maxValue.text(newMax);
            }

            updateSlider();
        }

        function stopDrag() {
            if (activeHandle) {
                activeHandle.removeClass('dragging');
                activeHandle = null;
            }
        }

        // Event listeners
        handleMin.on('mousedown touchstart', function (e) {
            startDrag(handleMin, e);
        });

        handleMax.on('mousedown touchstart', function (e) {
            startDrag(handleMax, e);
        });

        $(document).on('mousemove touchmove', onDrag);
        $(document).on('mouseup touchend', stopDrag);

        // Click on track to jump
        slider.on('click', function (e) {
            const sliderRect = slider[0].getBoundingClientRect();
            const pos = e.clientX - sliderRect.left;
            const credit = posToCredit(pos);

            const min = parseInt(minValue.text());
            const max = parseInt(maxValue.text());

            // Determine which handle to move based on which is closer
            const distToMin = Math.abs(credit - min);
            const distToMax = Math.abs(credit - max);

            if (distToMin < distToMax) {
                setCreditRange(credit, max);
            } else {
                setCreditRange(min, credit);
            }
        });

        // Keyboard support for accessibility
        handleMin.on('keydown', function (e) {
            const min = parseInt(minValue.text());
            const max = parseInt(maxValue.text());

            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCreditRange(min + 1, max);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                setCreditRange(min - 1, max);
            }
        });

        handleMax.on('keydown', function (e) {
            const min = parseInt(minValue.text());
            const max = parseInt(maxValue.text());

            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCreditRange(min, max + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                setCreditRange(min, max - 1);
            }
        });

        // Initialize
        setCreditRange(0, 10);
    }

    // Call it
    setupCreditRangeSlider();

    searchForClass()
    // ------------------------------------------------------------------------



    // HELP WINDOW ------------------------------------------------------------
    $(document.body).append(help_window_template);
    helpWindow = $("#help-window");

    helpWindow.find(".generic-window-close").on("click", () => {
        helpWindow.hide();
    })

    $("#help-btn").on("click", function (e) {
        e.preventDefault();
        if (helpWindow.is(":visible")) {
            helpWindow.hide();
        } else {
            windows = windows.filter(element => element != helpWindow[0]);
            windows.push(helpWindow[0]);
            layer_windows();
            helpWindow.show();
        }
    });
    // ------------------------------------------------------------------------



    // SETTINGS WINDOW --------------------------------------------------------
    $(document.body).append(settings_window_template);
    settingsWindow = $("#settings-window");

    settingsWindow.find(".generic-window-close").on("click", () => {
        settingsWindow.hide();
    })

    $("#settings-btn").on("click", function (e) {
        e.preventDefault();
        if (settingsWindow.is(":visible")) {
            settingsWindow.hide();
        } else {
            windows = windows.filter(element => element != settingsWindow[0]);
            windows.push(settingsWindow[0]);
            layer_windows();
            settingsWindow.show();
        }
    });

    settingsWindow.find("form").on("change", function (e) {
        let fdata = new FormData(this);
        let cssroot = document.querySelector(":root");
        let darkmode = fdata.get("darkmode");
        if (darkmode) { // eventually use cookies
            console.log(darkmode);
            document.documentElement.style.setProperty('--bgcolor', '#1d1c44');
            document.documentElement.style.setProperty('--textcolor', '#e6eaee');
        } else {
            console.log(darkmode);
            document.documentElement.style.setProperty('--bgcolor', 'white');
            document.documentElement.style.setProperty('--textcolor', 'black');
        }
    });
    // ------------------------------------------------------------------------



    $(".generic-window").map(function () {
        windows.push(this);
    });

    $(".generic-window").on("mousedown", function () {
        windows = windows.filter(element => element != this);
        windows.push(this);
        layer_windows();
    });

    // make all windows draggable & exitable at end
    let allWindowsJQ = $(".generic-window");
    allWindowsJQ.draggable({ handle: ".generic-window-topbar", cancel: "img" });
    allWindowsJQ.hide();
}





// #region CLASS FINDER STUFF ===============================================
// handle submission:
//      extracts form data
//      searches the catalog for appropriate classes
//      populates the results div
const SCORE_FUDGER = 10;

const searchForClass = () => {
    finderWindow.on("submit", e => {
        e.preventDefault(); // no refresh

        // extract form data
        const quickSearchQuery = finderWindow.find("#cf-quick-search").val()
        const subjectQuery = finderWindow.find("#cf-subject").val() == "All" ? null : finderWindow.find("#cf-subject").val().split('(')[1].split(')')[0]
        const attributeQuery = finderWindow.find("#cf-attributes").val()
        const semesterQuery = finderWindow.find("#cf-semester").val()

        const requestedFall = semesterQuery == "Both" || semesterQuery == "Fall"
        const requestedSpring = semesterQuery == "Both" || semesterQuery == "Spring"

        // ok search time
        var results = []
        for (subject in total_catalog) {
            var department = subject.split("-")[0]

            // check if credits are within range
            const creditRange = window.getCreditRange();
            if (total_catalog[subject].credits >= creditRange.min && total_catalog[subject].credits <= creditRange.max) {

                // filter by department and attribute
                var matchesFilters =
                    (subjectQuery == null || subjectQuery == department) && // matches department
                    (attributeQuery == "All" || total_catalog[subject].attributes.includes(attributeQuery)) && // matches attribute
                    ((total_catalog[subject].offeredInFall && requestedFall) || (total_catalog[subject].offeredInSpring && requestedSpring)) // matches term

                if (matchesFilters) {
                    total_catalog[subject].stringMatch = getStringMatchValue(total_catalog[subject].name, quickSearchQuery)
                    if (total_catalog[subject].stringMatch > 0) results.push(total_catalog[subject])
                }
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

        // scroll to top of results list
        $("#cf-results-list").scrollTop(0);
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

    // change any roman numerals in string to numbers
    string = string.split(' ').map(x => {
        if ((/^(I|II|III|IV|V)$/).test(x)) {
            const romanToNum = {
                "I": "0001",
                "II": "0002",
                "III": "0003",
                "IV": "0004",
                "V": "0005",
            }
            return romanToNum[x]
        }
        return x
    }).join(' ')

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
            score += 999 - string.indexOf(query)

            // also, matches should only be valid if they are in the same pattern
            // that is, if query is A B C
            // this will not match a string A C B
            // we do this by cutting of any parts of a string preceeding a match
            string = string.slice(string.indexOf(query))
        }
    }

    return score
}

const addResult = (result) => {
    let fullGovernmentName = result.name.split(":");
    let courseID = fullGovernmentName.shift();

    const yearID = `2${total_catalog[courseID].yearOffered.slice(-2)}${result.offeredInSpring ? "2" : "8"}`;

    const result_template =
        `<div class=cf-result>
            <div class="class-about">
                <p><b>${courseID}:</b>${fullGovernmentName.join()}</p>
                <div class="class-links">
                    <a class="sis-link" href="https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results/term/${yearID}/career/ASE/subject/${courseID.split('-')[0]}/course/${courseID.split('-')[1]}/attr/keyword/instructor" target="_blank" rel="noopener noreferrer">SIS</a>
                    <br> <a class="prereq-btn" href="#" data-tooltip="${result.prereqs.replace(/"/g, '&quot;')}">Prereqs</a>
                </div>
            </div>
            <div class="class-data">
                <div>
                    <button class="add-class-from-finder-btn" 
                        data-course-id="${courseID}"
                        data-course-name="${fullGovernmentName.join()}"
                        data-credits="${result.credits}">
                    <span>➕</span> Add
                    </button>
                    ${result.offeredInFall ? `<span class="hl-orange">Fall</span>` : ""}
                    ${result.offeredInSpring ? `<span class="hl-green">Spring</span>` : ""}
                </div>
                <div>
                    <span class="class-credits-wrapper"><b>${result.credits}</b> credit${result.credits == 1 ? "" : "s"}</span>
                </div>
            </div>
        </div>`;

    $("#cf-results-list").append(result_template);

    // Remove the old click listener - no longer needed!

    // Add class button listener
    $(".add-class-from-finder-btn").last().on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const btn = $(this);
        const courseId = btn.data('course-id');
        const courseName = btn.data('course-name');
        const credits = btn.data('credits');

        // Add class to selected tab
        window.addClassToTerm(currentTab.id, courseId, courseName, credits);

        // Subtle success feedback
        btn.css({
            'background': 'var(--cornflower-blue)',
            'color': 'white',
            'transform': 'scale(0.95)'
        });

        setTimeout(() => {
            btn.css({
                'background': '',
                'color': '',
                'transform': ''
            });
        }, 200);
    });
}

//#endregion =================================================================


