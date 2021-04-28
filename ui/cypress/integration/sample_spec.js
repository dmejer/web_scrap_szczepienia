describe("My First Test", () => {
  it("Scrap szczepienia", () => {
    let result = [];
    cy.visit("https://szczepienia.github.io/wielkopolskie");
    cy.get("#szczepienia>tbody>tr").each((row, index, rows) => {
      cy.wrap(row).within(() => {
        let city = cy.get("td.dtr-control");
        let data = cy.get("td.sorting_1");
        let rodzaj = cy.get("td[data-order='3']");
        cy.log(city + data + rodzaj);
      });
    });
  });
});
