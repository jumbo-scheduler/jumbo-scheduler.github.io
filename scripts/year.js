/*  Year
 *
 *  Purpose: Contains all data for a year of classes and displays them
 *           in a table
 *  Input:   Name of the year (i.e., Freshman, Sophomore, etc.)
 *           Two arrays of Courses from the course catalog; fall classes
 *           and spring classes
 *  Methods: 
 *       createDisplay() displays the contents in the corresponding cell in the table of the html document
 */
class Year {
    constructor(name, fall_classes, spring_classes) {
        this.fall_classes = fall_classes
        this.spring_classes = spring_classes

        this.name = name;
        this.parent = $(`#${name}`);
    }

    createDisplay() {
        $(this.parent).empty();

        var title = $("<h2>").text(`${this.name[0].toUpperCase()}${this.name.slice(1)} Year`);
        $(this.parent).append(title);

        // create table and tbody
        this.table = $("<table>");
        var tblBody = $("<tbody>");

        var row = $("<tr>");

        var fall_header = $("<th>").text("FALL");
        row.append(fall_header);

        var spring_header = $("<th>").text("SPRING");
        row.append(spring_header);

        tblBody.append(`
            <tr>
                <th>FALL</th>
                <td>Credits</td>
                <th>SPRING</th>
                <td>Credits</td>
            </tr>    
        `);

        for (var i = 0; i < Math.max(this.fall_classes.length, this.spring_classes.length); i++) {
            tblBody.append(`
                <tr>
                    <td>
                        ${i < this.fall_classes.length ? this.fall_classes[i].name : ""}
                    </td>
                    <td class="credit_count">
                        ${i < this.fall_classes.length ? this.fall_classes[i].credits : ""}
                    </td>
                    <td>
                        ${i < this.spring_classes.length ? this.spring_classes[i].name : ""}
                    </td>
                    <td class="credit_count">
                        ${i < this.spring_classes.length ? this.spring_classes[i].credits : ""}
                    </td>
                </tr>
            `)
        }

        // append the tbody inside the table
        this.table.append(tblBody);
        // put table in the parent
        $(this.parent).append(this.table);
    }
}