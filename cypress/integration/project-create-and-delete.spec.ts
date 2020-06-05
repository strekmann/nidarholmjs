describe("Open main", () => {
  const randomString = () => Cypress._.random(0, 1e6);
  it("shows up", () => {
    cy.visit("/");
    cy.get(".main-menu-mobile").click();
    cy.get(".projects").click();
    cy.get(".context-menu").click();
    cy.get(".project-new").click();
    const id = randomString();
    const year = new Date().getFullYear();
    cy.get("input[name=title]").type(`test ${id}`);
    cy.get(".project-end").click();
    // FIXME: This looks bad. Must be a better way:
    cy.get(":nth-child(3) > .MuiIconButton-label > .MuiSvgIcon-root").click();
    cy.get(
      ".MuiPickersCalendar-transitionContainer > :nth-child(1) > :nth-child(3) > :nth-child(4)",
    ).click();
    cy.get(".project-new-submit").click();
    cy.get(`.project-${year}-test-${id}`).click();
    cy.get(".project .context-menu").click();
    cy.get(".project-delete").click();
  });
});