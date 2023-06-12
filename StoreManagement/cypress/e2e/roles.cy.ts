describe("Roles", () => {
    describe("on opening the list of roles", () => {
        it("should show the roles in the database", () => {
            cy.intercept("GET", "**/api/storeemployeeroles/**", {
                fixture: "roles.json",
            });

            cy.visit("http://localhost:5173/roles");
            cy.get('[data-testid="test-all-roles-empty"]').should("not.exist");
        });
    });
});

export {};
