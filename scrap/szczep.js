const beep = require('beepbeep')
const {chromium} = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true
    });
    const context = await browser.newContext();

    // Open new page
    const page = await context.newPage();

    // Go to https://szczepienia.github.io/wielkopolskie
    await page.goto('https://szczepienia.github.io/wielkopolskie');

    const table = await page.$$eval('#szczepienia>tbody>tr', (rows) => {
        console.log(rows);
        return rows.map(row => {
            const miasto = row.querySelectorAll('td')[0];
            const data = row.querySelectorAll('td')[1];
            const rodzaj = row.querySelectorAll('td')[3];

            const toText = (element) => element.innerText.trim();
            return {
                miasto: toText(miasto).toLowerCase(),
                data: toText(data),
                rodzaj: toText(rodzaj).toLowerCase()
            }
        })
    });

    console.log(table);

    table.forEach((row) => {
        if (row.miasto === 'poznań' && (row.rodzaj === 'pfizer' || row.rodzaj === 'moderna')) {
            console.log("JEST SZCZEPIONKA", row.miasto, row.data);
        }

    });
    console.log("\007");
    // ---------------------
    await context.close();
    await browser.close();
})();