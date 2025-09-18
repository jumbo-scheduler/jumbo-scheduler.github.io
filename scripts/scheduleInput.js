/**
 * Handles the input for creating the user's required course schedule.
 * Provides UI functionality for selecting classes, departments, and attributes,
 * as well as importing and exporting requirements.
 *
 * @file scheduleInput.js
 */


/***************************************
 * 
 *   SMFA checkbox
 * 
 ***************************************/
//#region =====================================================
const smfaCheckbox = $("#allow-smfa").find("input");
smfaCheckbox.prop("checked", true);
const dropdowns = {
    all_classes: create_dropdown_data(total_catalog),
    no_smfa: create_dropdown_data(total_catalog_no_SMFA),
    departments: departments,
    attributes: attributes,
};

/**
 * Updates the class selection dropdowns based on the SMFA checkbox state.
 * @function
 */
const updateClassSelection = () => {
    $(".class-select")
        .empty()
        .select2({
            data: smfaCheckbox.is(":checked")
                ? dropdowns.all_classes
                : dropdowns.no_smfa,
            placeholder: "Search or select class name",
            allowClear: true,
            width: "100%",
        });
};
smfaCheckbox.click(updateClassSelection);
updateClassSelection();
//#endregion =====================================================


/***************************************
 * 
 *   Requirements controls
 * 
 ***************************************/

/**
 * Creates a new requirements tab with UI controls for adding requirements.
 * @param {string} id - The unique identifier for the tab.
 * @returns {JQuery<HTMLElement>} The created tab element.
 */
var requirements_ids = [];
const create_requirements_tab = (id) => {
    const tab = $(`
         <div class="requirements-tab" id=${id}>
            <h3>
                <span class=tab-title>${id}</span> 
                <button class="rename-tab-button">✏️</button>
                <button class="delete-tab-button">❌</button>
            </h3>

            <div id="${id}-requirements">
                <table>
                    <div class="requirements-help-text">Add requirements with the buttons below.</div>
                </table>
            </div>
            <br>

            <div>
                Add new requirements <br>
                <button class="new-class-button">By class name</button>
                <button class="new-department-button">By department</button>
                <button class="new-attribute-button">By attribute</button>
                <button class="new-multi-class-button">"Pick one of..."</button>
            </div>
        </div>    
    `);

    // make a new subject
    const create_dropdown =
        (
            dropdown_class,
            data,
            placeholder_text,
            preface = "",
            attach_to = null
        ) =>
        () => {
            // Create dropdown container
            const containerId = `dropdown-${Date.now()}`;
            var borderAddition = ``;
            if (
                dropdown_class == "multi-class" ||
                dropdown_class == "multi-attribute" ||
                dropdown_class == "multi-department"
            ) {
                borderAddition = `class="multi-dropdown-separator"`;
            } else {
                borderAddition = `class="dropdown-separator"`;
            }
            const container = $(`
            <tr ${borderAddition}>
                <div class="dropdown-container" id="${containerId}">
                    <td>
                        ${preface}
                        <select class="select ${dropdown_class}-select" data-id="${containerId}">
                            <option value=""></option>
                        </select>
                    </td>
                    <td>
                        ${preface == "" ? "" : `<br>`}
                        <button class="up-btn" data-container="${containerId}">🔼</button>
                        <button class="down-btn" data-container="${containerId}">🔽</button>
                        <button class="remove-btn" data-container="${containerId}">❌</button>
                        <button class="duplicate-btn" data-container="${containerId}">📋</button>

                        <span class="prereqs"></span>
                    </td>
                </div>
            </tr>
        `);

            if (attach_to == null)
                requirements_contents.children("table").append(container);
            else attach_to.append(container);

            var selector = container.find("select");
            selector.select2({
                data: data,
                placeholder: placeholder_text,
                allowClear: true,
                width: "100%",
            });

            // edit buttons
            container.find(".up-btn").click(() => {
                container.insertBefore(container.prev());
            });
            container.find(".down-btn").click(() => {
                container.insertAfter(container.next());
            });
            container.find(".remove-btn").click(() => {
                container.remove();
                fetch_all_requirements();
                // if the dropdowns list is empty, show the help text
                const requirements_tab = $(".requirements-tab");
                if (requirements_tab.find(".dropdown-separator").length == 0) {
                    requirements_tab.find(".requirements-help-text").show();
                }
            });
            container.find(".duplicate-btn").click(() => {
                var duplicate = create_dropdown(
                    dropdown_class,
                    data,
                    placeholder_text,
                    preface
                )();

                duplicate.find("select").val(selector.val()).trigger("change");
                duplicate.insertAfter(container);

                fetch_all_requirements();
            });

            // Handle selection change
            container.find("select").on("change", function () {
                fetch_all_requirements();
            });

            // if the dropdowns list is not empty, clear the help text
            const requirements_tab = $(".requirements-tab");
            if (requirements_tab.find(".dropdown-separator").length != 0) {
                requirements_tab.find(".requirements-help-text").hide();
            }

            return container;
        };

    tab.find(".rename-tab-button").click(() => {
        // ensure no duplicate names
        var newName = prompt("Enter new name for requirement");
        if (newName.length == 0 || newName == null || newName == undefined)
            return;

        var duplicateNumber = 2;
        while (requirements_ids.includes(newName)) {
            newName = `${newName}${duplicateNumber++}`;
        }

        // edit the header and shit
        // id change
        edit_tab_name(tab, newName);
    });
    tab.find(".delete-tab-button").click(() => {
        if (requirements_ids.length == 1) return;

        delete_tab(tab);
    });

    tab.find(".new-class-button").click(
        create_dropdown(
            "class",
            smfaCheckbox.is(":checked")
                ? dropdowns.all_classes
                : dropdowns.no_smfa,
            "Search or select class name"
        )
    );
    tab.find(".new-department-button").click(
        create_dropdown(
            "department",
            dropdowns.departments,
            "Search or select department",
            "Any class in department "
        )
    );
    tab.find(".new-attribute-button").click(
        create_dropdown(
            "attribute",
            dropdowns.attributes,
            "Search or select attribute",
            "Any class with attribute "
        )
    );

    const create_multi_dropdown = () => () => {
        const container = $(`
        <tr class="dropdown-separator">
            <div>
                <td>
                One of:
                <button class="new-multi-class-button">A class</button>
                <button class="new-multi-department-button">In department</button>
                <button class="new-multi-attribute-button">With attribute</button>
                    <div class="multi-select-wrapper">
                        <div class="multi-requirements-help-text">Add requirements with the buttons above.</div>
                        <table class="multi-select">
                        </table>
                    </div>
                </td>

                <td>
                    <button class="up-btn">🔼</button>
                    <button class="down-btn">🔽</button>
                    <button class="remove-btn">❌</button>
                    <button class="duplicate-btn">📋</button>
                </td>
            </div>
        </tr>
    `);

        // edit buttons
        container.find(".up-btn").click(() => {
            container.insertBefore(container.prev());
        });
        container.find(".down-btn").click(() => {
            container.insertAfter(container.next());
        });
        container.find(".remove-btn").click(() => {
            container.remove();
            fetch_all_requirements();

            // if the dropdowns list is empty, show the help text
            const requirements_tab = $(".requirements-tab");
            if (requirements_tab.find(".dropdown-separator").length == 0) {
                requirements_tab.find(".requirements-help-text").show();
            }
        });
        container.find(".duplicate-btn").click(() => {
            var duplicate = create_multi_dropdown()();
            duplicate.insertAfter(container);

            var multiSelections = container.find("select");
            for (var i = 0; i < multiSelections.length; i++) {
                if ($(multiSelections[i]).hasClass("multi-class-select")) {
                    const copiedString = $(multiSelections[i]).val();
                    if (copiedString != "") {
                        var selectionDuplicate = create_dropdown(
                            "multi-class",
                            smfaCheckbox.is(":checked")
                                ? dropdowns.all_classes
                                : dropdowns.no_smfa,
                            "Search or select class name",
                            "",
                            duplicate.find(".multi-select")
                        )();
                        selectionDuplicate
                            .find("select")
                            .val(copiedString)
                            .trigger("change");
                    }
                } else if (
                    $(multiSelections[i]).hasClass("multi-department-select")
                ) {
                    const copiedString = $(multiSelections[i]).val();
                    if (copiedString != "") {
                        var selectionDuplicate = create_dropdown(
                            "multi-department",
                            dropdowns.departments,
                            "Search or select department",
                            "Any class in department ",
                            duplicate.find(".multi-select")
                        )();
                        selectionDuplicate
                            .find("select")
                            .val(copiedString)
                            .trigger("change");
                    }
                } else if (
                    $(multiSelections[i]).hasClass("multi-attribute-select")
                ) {
                    const copiedString = $(multiSelections[i]).val();
                    if (copiedString != "") {
                        var selectionDuplicate = create_dropdown(
                            "multi-attribute",
                            dropdowns.attributes,
                            "Search or select attribute",
                            "Any class with attribute ",
                            duplicate.find(".multi-select")
                        )();
                        selectionDuplicate
                            .find("select")
                            .val(copiedString)
                            .trigger("change");
                    }
                } else {
                    // what? how?
                }
            }

            if (duplicate.find(".multi-select")[0].children.length > 0)
                duplicate.find(".multi-requirements-help-text").hide();

            fetch_all_requirements();
        });

        // multiselect add new class buttons
        container
            .find(".new-multi-class-button")
            .click(
                create_dropdown(
                    "multi-class",
                    smfaCheckbox.is(":checked")
                        ? dropdowns.all_classes
                        : dropdowns.no_smfa,
                    "Search or select class name",
                    "",
                    container.find(".multi-select")
                )
            );
        container
            .find(".new-multi-department-button")
            .click(
                create_dropdown(
                    "multi-department",
                    dropdowns.departments,
                    "Search or select department",
                    "Any class in department ",
                    container.find(".multi-select")
                )
            );
        container
            .find(".new-multi-attribute-button")
            .click(
                create_dropdown(
                    "multi-attribute",
                    dropdowns.attributes,
                    "Search or select attribute",
                    "Any class with attribute ",
                    container.find(".multi-select")
                )
            );

        requirements_contents.children("table").append(container);

        // if the dropdowns list is not empty, clear the multi-requirements help text
        container.click(() => {
            if (container.find(".multi-select")[0].children.length > 0)
                container.find(".multi-requirements-help-text").hide();
        });

        // if the dropdowns list is not empty, clear the help text
        const requirements_tab = $(".requirements-tab");
        if (requirements_tab.find(".dropdown-separator").length != 0) {
            requirements_tab.find(".requirements-help-text").hide();
        }

        return container;
    };
    tab.find(".new-multi-class-button").click(create_multi_dropdown());

    $("#requirement-tabs").prepend(tab);
    const requirements_contents = $(`#${id}-requirements`);

    return tab;
};


/***************************************
 * 
 *   Tab creation and modification
 * 
 ***************************************/
//#region =====================================================
/**
 * Edits the name of a requirements tab and updates associated UI elements.
 * @param {JQuery<HTMLElement>} tab - The tab element to rename.
 * @param {string} newName - The new name for the tab.
 */
const edit_tab_name = (tab, newName) => {
    var oldID = tab.attr("id");
    tab.find(".tab-title")[0].innerText = newName;
    tab.attr("id", newName);
    tab.find(`#${oldID}-requirements`).attr("id", `${newName}-requirements`);

    // button change
    const tabIndex = requirements_ids.indexOf(oldID);
    requirements_ids[tabIndex] = newName;
    $("#requirements").children("button")[tabIndex].innerText = newName;

    fetch_all_requirements();
};

/**
 * Deletes a requirements tab and updates the UI accordingly.
 * @param {JQuery<HTMLElement>} tab - The tab element to delete.
 */
const delete_tab = (tab) => {
    const id = tab.attr("id");
    const tabIndex = requirements_ids.indexOf(id);

    // remove button
    requirements_ids.splice(tabIndex, 1);
    $($("#requirements").children("button")[tabIndex]).remove();

    // remove tab data
    $(`#${id}`).remove();

    // select another tab
    $("#requirements")
        .children("button")
        [tabIndex < requirements_ids.length ? tabIndex : tabIndex - 1].click();
};

/**
 * Updates the visibility of requirement tabs based on selection.
 * @function
 */
const update_tab_selection = () => {
    const tabs = $("#requirements");

    for (var i = 0; i < tabs.children().length - 1; i++) {
        const button = $(tabs.children()[i]);
        var selected_requirement = requirements_ids[i];
        if (button.hasClass("active"))
            $(`#${selected_requirement}`).attr("style", "display:block;");
        else $(`#${selected_requirement}`).attr("style", "display:none;");
    }
};

/**
 * Creates a new requirements tab and adds it to the UI.
 * @param {string} [name="Minor"] - The name for the new tab.
 * @returns {JQuery<HTMLElement>} The created tab element.
 */
const new_tab_button = $("#new-requirement");
const create_new_tab = (name = "Minor") => {
    var tab_name = name;
    var index = 2;
    while (requirements_ids.includes(tab_name)) tab_name = `Minor${index++}`;
    requirements_ids.push(tab_name);

    const tab = $(`<button class="tab">${tab_name}</button>`);
    tab.click(() => {
        $(".tab").removeClass("active");
        tab.addClass("active");
        update_tab_selection();
    });
    tab.insertBefore(new_tab_button);

    return create_requirements_tab(tab_name);
};
new_tab_button.click(() => {
    create_new_tab();
});

create_new_tab("Major");
$($("#requirements").find("button")[0]).click();
//#endregion =====================================================



/***************************************
 * 
 *   Fetching and exporting user input
 * 
 ***************************************/

//#region =====================================================
const dropdown_enum = {
    class: "CLASS",
    attribute: "ATTRIBUTE",
    department: "DEPARTMENT",
    multi: "MULTI",
};

/**
 * Represents a selection made in a dropdown.
 * @class
 * @param {string} type - The type of dropdown (class, attribute, department, multi).
 * @param {any} config - The configuration or value for the selection.
 */
class Selection {
    constructor(type, config) {
        this.type = type;
        this.config = config;

        this.locked = type == dropdown_enum.class;
    }
}

/**
 * Fetches the current user-selected requirements from the UI and exports them.
 * @returns {Array<Selection>} The list of selected requirements.
 * @function
 */
const fetch_all_requirements = () => {
    var output = [];

    for (const requirements_id of requirements_ids) {
        var classes = [];
        var attributes = [];
        var departments = [];
        var multis = [];

        const req_tab = $($(`#${requirements_id}`)[0]);
        const classSelects = req_tab.find(`.class-select`);
        for (var i = 0; i < classSelects.length; i++) {
            const selection = $(classSelects[i]).select2("data");
            if (selection.length > 0 && selection[0].text != "") {
                const entry = new Selection(dropdown_enum.class, [
                    selection[0].text.split(":")[0],
                ]);
                classes.push(entry);
            }
        }

        const attributeSelects = req_tab.find(`.attribute-select`);
        for (var i = 0; i < attributeSelects.length; i++) {
            const selection = $(attributeSelects[i]).select2("data");
            if (selection.length > 0 && selection[0].text != "") {
                const entry = new Selection(dropdown_enum.attribute, [
                    selection[0].text,
                ]);
                attributes.push(entry);
            }
        }

        const departmentSelects = req_tab.find(`.department-select`);
        for (var i = 0; i < departmentSelects.length; i++) {
            const selection = $(departmentSelects[i]).select2("data");
            if (selection.length > 0 && selection[0].text != "") {
                const entry = new Selection(dropdown_enum.department, [
                    selection[0].text,
                ]);
                departments.push(entry);
            }
        }

        const multiSelects = req_tab.find(`.multi-select`);
        for (var i = 0; i < multiSelects.length; i++) {
            const selects = $(multiSelects[i]).find("select");
            const selections = [];

            for (var j = 0; j < selects.length; j++) {
                if ($(selects[j]).hasClass("multi-class-select")) {
                    selections.push(
                        new Selection(dropdown_enum.class, $(selects[j]).val())
                    );
                } else if ($(selects[j]).hasClass("multi-department-select")) {
                    selections.push(
                        new Selection(
                            dropdown_enum.department,
                            $(selects[j]).val()
                        )
                    );
                } else if ($(selects[j]).hasClass("multi-attribute-select")) {
                    selections.push(
                        new Selection(
                            dropdown_enum.attribute,
                            $(selects[j]).val()
                        )
                    );
                }
            }

            if (selections.length > 0) {
                const entry = new Selection(dropdown_enum.multi, selections);
                multis.push(entry);
            }
        }

        if (
            classes.length > 0 ||
            attributes.length > 0 ||
            departments.length > 0 ||
            multis.length > 0
        ) {
            output.push({
                name: requirements_id,
                classes: classes,
                attributes: attributes,
                departments: departments,
                multis: multis,
            });
        }
    }

    exportReq(output);
    return output
};

/**
 * Exports the requirements data to a text file and sets up the download link.
 * @param {Array<Object>} input - The requirements data to export.
 */
const exportReq = (input) => {
    var output = "";

    for (const tab of input) {
        output += `${tab.name} requires\n`;

        const classes = tab.classes;
        if (classes.length > 0) {
            output += "\tTHE FOLLOWING CLASSES:\n";
            for (const subject of classes)
                output += `\t\t${subject.config[0]}\n`;
        }

        const attributes = tab.attributes;
        if (attributes.length > 0) {
            output += "\tCLASSES WITH ATTRIBUTES:\n";
            for (const attribute of attributes)
                output += `\t\t${attribute.config[0]}\n`;
        }

        const departments = tab.departments;
        if (departments.length > 0) {
            output += "\tONE CLASS IN DEPARTMENT:\n";
            for (const department of departments)
                output += `\t\t${department.config[0]}\n`;
        }

        const multis = tab.multis;
        if (multis.length > 0) {
            for (const multi of multis) {
                output += "\tONE OF THE FOLLOWING CHOICES:\n";
                for (const option of multi.config) {
                    prefaceLookup = [
                        '"',
                        'Anything with the attribute "',
                        'Any class in the "',
                    ];

                    suffixLookup = ['"', '"', '" department'];

                    output +=
                        "\t\t" +
                        prefaceLookup[option.type] +
                        option.config +
                        suffixLookup[option.type] +
                        "\n";
                }
            }
        }
    }

    var file = new Blob([output], { type: "text/plain" });
    const downloadButton = $("#export-req")[0];
    downloadButton.href = URL.createObjectURL(file);
    downloadButton.download = "course-requirements.txt";
};
//#endregion =====================================================

// importing user input from file
//#region =====================================================

/**
 * Strips everything in a string except the content within a single set of quotes.
 * @param {string} str - The input string.
 * @returns {string} The stripped string.
 */
function strip_quotes(str) {
    var start = 0;
    var end = str.length - 1;

    while (start + 1 < end) {
        // because "" always returns a blank string
        if (str[start] != '"') {
            start++;
        }
        if (str[end] != '"') {
            end--;
        }
        if (str[start] == '"' && str[end] == '"') {
            return str.substring(start + 1, end);
        }
    }
    return "";
}

/**
 * Handles the change event for the requirements import input.
 * Reads the file and calls importRequirements.
 * @function
 */
const importRequirements = (contents) => {
    const get_category = (line) =>
        ({
            "THE FOLLOWING CLASSES:": "CLASSES",
            "CLASSES WITH ATTRIBUTES:": "ATTRIBUTES",
            "ONE CLASS IN DEPARTMENT:": "DEPARTMENTS",
            "ONE OF THE FOLLOWING CHOICES:": "MULTI",
        }[line]);

    var category = undefined;
    var current_tab = null;
    var current_multi_box = null;
    smfaCheckbox.prop("checked", true);
    const req_error_box = document.getElementById("requirements-error-wrapper");
    var import_error_text = "";

    // parse input
    for (const line of contents) {
        if (line.length == 0) continue;
        // category
        if (get_category(line) != undefined) {
            category = get_category(line);
            if (category == "MULTI") {
                if (current_tab == null) {
                     window.location.reload(); // oops
                } else {
                    current_tab.find(".new-multi-class-button")
                        [current_tab.find(".new-multi-class-button").length - 1]
                        .click();
                    current_multi_box = $(
                        current_tab.find(".dropdown-separator")[
                            current_tab.find(".dropdown-separator").length - 1
                        ]
                    );
                }
            }
        }
        // name
        else if (line.includes(" requires")) {
            const tab_name = line.slice(0, line.length - 9);
            current_tab = create_new_tab(tab_name);
            $("#requirements")
                .find("button")
                [requirements_ids.length - 1].click();
        }
        // everything else
        else {
            if (current_tab == null) window.location.reload(); // oops

            switch (category) {
                case "CLASSES": // ------------------------------------------------------------------------
                    if (!Object.keys(total_catalog).includes(line)) {
                        var err_msg = `Unknown class "${line}". Was it removed from the catalog?`;
                        console.error(err_msg);
                        import_error_text += err_msg + "<br>";
                        break;
                    }
                    current_tab.find(".new-class-button").click();

                    var dropdowns = current_tab.find("select");
                    $(dropdowns[dropdowns.length - 1])
                        .val(line)
                        .trigger("change");
                    break;

                case "ATTRIBUTES": // ---------------------------------------------------------------------
                    if (!attributes.includes(line)) {
                        var err_msg = `Unknown attribute "${line}".`;
                        console.error(err_msg);
                        import_error_text += err_msg + "<br>";
                        break;
                    }
                    current_tab.find(".new-attribute-button").click();

                    var dropdowns = current_tab.find("select");
                    $(dropdowns[dropdowns.length - 1])
                        .val(line)
                        .trigger("change");
                    break;

                case "DEPARTMENTS": // ---------------------------------------------------------------------
                    if (!departments.includes(line)) {
                        var err_msg = `Unknown department "${line}".`;
                        console.error(err_msg);
                        import_error_text += err_msg + "<br>";
                        break;
                    }
                    current_tab.find(".new-department-button").click();

                    var dropdowns = current_tab.find("select");
                    $(dropdowns[dropdowns.length - 1])
                        .val(line)
                        .trigger("change");
                    break;

                case "MULTI": // ---------------------------------------------------------------------------
                    if (current_multi_box == null) window.location.reload(); // oops

                    stripped_line = strip_quotes(line);


                    if (line.includes('Anything with the attribute "')) {
                        // ATTRIBUTES
                        if (!attributes.includes(stripped_line)) {
                            var err_msg = `Multi-Selector: Unknown attribute "${stripped_line}".`;
                            console.error(err_msg);
                            import_error_text += err_msg + "<br>";
                        } else {
                            current_multi_box
                                .find(".new-multi-attribute-button")
                                .click();
                        }
                    } else if (line.includes("Any class in the ")) {
                        // DEPARTMENTS
                        if (!departments.includes(stripped_line)) {
                            var err_msg = `Multi-Selector: Unknown department "${stripped_line}".`;
                            console.error(err_msg);
                            import_error_text += err_msg + "<br>";
                        } else {
                            current_multi_box
                                .find(".new-multi-department-button")
                                .click();
                        }
                    } else {
                        // CLASSES
                        if (!Object.keys(total_catalog).includes(stripped_line)) {
                            var err_msg = `Multi-Selector: Unknown class "${stripped_line}". Was it removed from the catalog?`;
                            console.error(err_msg);
                            import_error_text += err_msg + "<br>";
                        } else {
                            current_multi_box
                                .find(".new-multi-class-button")
                                .click();
                        }
                    }

                    // ----------------------------------------------------------------------------------------

                    var dropdowns = current_multi_box.find("select");
                    $(dropdowns[dropdowns.length - 1])
                        .val(stripped_line)
                        .trigger("change");
                    break;
            }
        }
    }
    if (import_error_text != "") {
        req_error_box.innerHTML =
            `<div class="error-box"><p class="error-box-title">Import Errors:</p>` +
            import_error_text +
            `</div>`;
    }

    // // clear all tabs
    // $(".delete-tab-button").click();
    // edit_tab_name($(`#${requirements_ids[0]}`), `delete-me`);
    // try {
    //     delete_tab($(`#delete-me`));
    // } catch (err) {}
};

const requirementInput = $("#import-req").find("input");
requirementInput.change(() => {
    const file = requirementInput.prop("files")[0];
    if (file != null) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result
                .split("\n")
                .map((x) => x.split("\t").join(""));
            importRequirements(contents);
        };

        reader.readAsText(file);
    }
});
//#endregion =====================================================



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
