// use for save/load files
function loadFile(filePath) {
    let result = null;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) result = xmlhttp.responseText;
    else { throw new Error(xmlhttp.status) }
    return result;
}

const fall_catalog = JSON.parse(loadFile("course_catalog/fall25.JSON"))
const spring_catalog = JSON.parse(loadFile("course_catalog/spring25.JSON"))
const total_catalog = { ...spring_catalog, ...fall_catalog };

class Year {
    constructor(name, fall_classes, spring_classes) {
        this.fall_classes = fall_classes
        this.spring_classes = spring_classes

        this.name = name;
        this.parent = document.getElementById(name);
    }

    createDisplay() {
        $(this.parent).empty();

        var title = $('<h2>').text(`${this.name[0].toUpperCase()}${this.name.slice(1)} Year`);
        $(this.parent).append(title);

        // create table and tbody
        this.table = $('<table>');
        var tblBody = $('<tbody>');

        var row = $('<tr>');

        var fall_header = $('<th>').text("FALL");
        row.append(fall_header);

        var spring_header = $('<th>').text("SPRING");
        row.append(spring_header);

        tblBody.append(row);

        for (var i = 0; i < Math.max(this.fall_classes.length, this.spring_classes.length); i++) {
            var row = $('<tr>');

            var fall_class = $('<td>').text(i < this.fall_classes.length ? this.fall_classes[i] : "");
            row.append(fall_class);

            var spring_class = $('<td>').text(i < this.spring_classes.length ? this.spring_classes[i] : "");
            row.append(spring_class);

            tblBody.append(row);
        }

        // append the tbody inside the table
        this.table.append(tblBody);
        // put table in the parent
        $(this.parent).append(this.table);
    }
}

const a = (catalog) => {
    var output = []
    for (var i = 0; i < 6; i++) {
        var selection = Object.keys(catalog)[Math.floor(Math.random() * Object.keys(catalog).length)]
        output.push(catalog[selection].name)
    }
    return output
}


var track = [
    new Year('freshman', a(fall_catalog), a(spring_catalog)),
    new Year('sophomore', a(fall_catalog), a(spring_catalog)),
    new Year('junior', a(fall_catalog), a(spring_catalog)),
    new Year('senior', a(fall_catalog), a(spring_catalog))
]

for (const year of track) year.createDisplay()

const init_dropdowns = () => {
    var dropdown_data = []
    var index = 0
    for (var class_name in total_catalog) {
        dropdown_data.push({
            id: index++,
            text: total_catalog[class_name].name
        })
    }
    console.log(dropdown_data)

    $('#class_selection').select2({
        data: dropdown_data, // Load data from our array
        placeholder: "Type to search...",
        allowClear: true
    });
}

init_dropdowns()