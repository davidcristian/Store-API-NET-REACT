describe("Employees", () => {
    describe("on opening the list of employees", () => {
        it("should show the employees in the database", () => {
            cy.intercept("GET", "**/api/storeemployees/**", {
                fixture: "employees.json",
            });

            cy.visit("http://localhost:5173/employees");
            cy.get('[data-testid="test-all-employees-empty"]').should(
                "not.exist"
            );
        });
    });
});

export {};
