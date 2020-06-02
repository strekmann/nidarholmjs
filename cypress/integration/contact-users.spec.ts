describe("Contact page", () => {
  it("shows up with at least one contact user clickable", () => {
    cy.visit("/");
    cy.get(".main-menu-mobile").click();
    cy.get(".contact").click();
    cy.get(
      ":nth-child(1) > .MuiCardActions-root > .MuiButtonBase-root",
    ).click();
    cy.get(".contact-info").contains("nidarholm");
  });
});
