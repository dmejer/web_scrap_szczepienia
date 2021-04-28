const { chromium } = require("playwright");
const { exec } = require("child_process");

let lastFound = false;
let alarmExecuted = false;
let iteracja = 0;

async function scrap() {
  iteracja++;
  console.log("Sprawdzenie:", iteracja);

  const browser = await chromium.launch({
    headless: true
  });
  const context = await browser.newContext();

  // Open new page
  const page = await context.newPage();

  // Go to https://szczepienia.github.io/wielkopolskie
  await page.goto("https://szczepienia.github.io/wielkopolskie");

  const doNastepnej = await page.innerText(".post-content #nexttime");
  console.log("Czas do nastepnej aktualizacji:", doNastepnej);

  const table = await page.$$eval("#szczepienia>tbody>tr", rows => {
    const result = [];
    rows.forEach(row => {
      const toText = element => element.innerText.trim();

      const miasto = row.querySelectorAll("td")[0];
      const data = row.querySelectorAll("td")[1];
      const rodzaj = row.querySelectorAll("td")[3];
      if (toText(miasto).toLowerCase() != "poznań") {
        return;
      }
      result.push({
        miasto: toText(miasto).toLowerCase(),
        data: toText(data),
        rodzaj: toText(rodzaj).toLowerCase()
      });
    });
    return result;
  });

  console.log(table);

  table.forEach(row => {
    if (row.rodzaj === "pfizer" || row.rodzaj === "moderna") {
      console.log("JEST SZCZEPIONKA PFIZER", row.miasto, row.data);
      lastFound = true;
    }
  });

  if (!alarmExecuted && lastFound) {
    alarmExecuted = true;
    exec("start alarm.mp3");
  }

  // ---------------------
  await context.close();
  await browser.close();
}

scrap();
setInterval(scrap, 60000);
