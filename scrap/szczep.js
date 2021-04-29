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

      const miasto = toText(row.querySelectorAll("td")[0]).toLowerCase();
      if (miasto.toLowerCase() != "poznań") {
        return;
      }
	  
	  const rodzaj = toText(row.querySelectorAll("td")[3]).toLowerCase();
      if (rodzaj !== "pfizer" && rodzaj !== "moderna") {
        return;
      }

      const data = toText(row.querySelectorAll("td")[1]);
      let mies = 5;
      if (data.toLowerCase().includes("maj")) {
        mies = 5;
      } else if (data.toLowerCase().includes("kwie")) {
        mies = 4;
      } else if (data.toLowerCase().includes("czerw")) {
        mies = 6;
      }
      let dzien = +data.match(/^\d+/)[0];

      if (mies > 5) {
        return;
      }
      if (dzien > 10 && mies >= 5) {
        return;
      }

      result.push({
        miasto: miasto,
        data: data,
        rodzaj: rodzaj,
        dzien: dzien,
        mies: mies
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
setInterval(scrap, 30000);
