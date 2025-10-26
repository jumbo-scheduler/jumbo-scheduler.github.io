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
        <option>Biology</option>
        <option>Physics</option>
        <option>Chemistry</option>
        <option>Math</option>
        <option>Mechanical Engineering</option>
    `);
    // attributes
    finderWindow.find("#cf-attributes").append(`
        <option selected disabled>Pick attribute</option>
        <optgroup label="SOE">
            <option>SOE-Pre-registraton Eligible</option>
            <option>SOE-HASS</option>
            <option>SOE-Computing</option>
        </optgroup>
        <optgroup label="A&S">
            <option>idk</option>
            <option>what</option>
            <option>the</option>
            <option>A&S</option>
            <option>attributes</option>
            <option>are</option>
        </optgroup>
    `);

    finderWindow.draggable({handle: "#class-finder-topbar", cancel: "img"});
    finderWindow.find("select").selectmenu();
    finderWindow.find("#class-finder-close").on("click", () => finderWindow.hide());
    
    finderWindow.hide();

    $("#class-finder-button").on("click", function (e) { 
        e.preventDefault();
        if (finderWindow.is(":visible")) {
            finderWindow.hide();
        } else {
            finderWindow.show();
        }
    });
}