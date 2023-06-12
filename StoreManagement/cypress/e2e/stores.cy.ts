describe("Stores", () => {
    describe("on opening the list of stores", () => {
        it("should show the stores in the database", () => {
            cy.intercept("GET", "**/api/stores/**", {
                fixture: "stores.json",
            });

            cy.visit("http://localhost:5173/stores");
            cy.get('[data-testid="test-all-stores-empty"]').should("not.exist");
        });
    });
});

export {};
