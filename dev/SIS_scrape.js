/*
    INSTRUCTIONS: Copy/paste into terminal. wait for errors to stop, then call read_classes()
*/

const class_table = document.getElementsByClassName("tfp_accordion_row cls-show-js");
const class_directory = {}

// uncollapse all rows
document.getElementsByClassName("tfp-show-result-sect")[0].click()

const show_more = document.getElementsByClassName("status")
for (let row of show_more) {
    if (row.tagName == 'A') row.click()
}

// scrape the data from each row
const read_classes = () => {
    for (let i = 0; i < class_table.length; i++) {
        let row = class_table[i]
        let class_name = row.children[0].innerText
        let attributes =  class_table[i].children[2].children[1].children[0].children[0].children[3].children[1].children[0].children[0].children[0].children[0].children[0].children.length > 1 ? class_table[i].children[2].children[1].children[0].children[0].children[3].children[1].children[0].children[0].children[0].children[0].children[0].children[1].innerText.slice(17).split(', ').map(x => x.split('\n').join().split(',').join('')) : []
        let prereqs = class_table[i].children[2].children[1].children[0].children[0].children[3].children[1].children[0].children[0].children[0].children[0].children[2].children[1].innerText
        let credits = class_table[i].children[2].children[1].children[0].children[0].children[3].children[0].children[4].innerText
        class_directory[class_name] = {
            name: row.children[0].innerText.split(" ").slice(1).join(' '),
            attributes: attributes,
            prereqs: prereqs,
            credits: credits
        }
    }

    return JSON.stringify(class_directory, 4, ' ') 
}