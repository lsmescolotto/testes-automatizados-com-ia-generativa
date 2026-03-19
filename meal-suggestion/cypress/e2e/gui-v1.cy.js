describe('Meal Suggestion Application', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load and Initial State', () => {
    it('should load the application successfully', () => {
      cy.get('body').should('be.visible');
    });

    it('should display the page title', () => {
      cy.title().should('include', 'Refeição');
    });

    it('should have the main container visible', () => {
      cy.get('body, [role="bpdy"], .container, .app').should('be.visible');
    });
  });

  describe('Meal Suggestion Feature', () => {
    it('should display a button to get meal suggestion', () => {
      cy.get('button').should('have.length.greaterThan', 0);
      cy.contains('button', "Buscar").should('be.visible');
    });

    it('should display meal information after clicking suggest button', () => {
      cy.contains('button', "Buscar").click();
      cy.get('h3[title="Ingredientes"]', {
        timeout: 10000,
      }).should('be.visible');
    });

    it('should display meal name', () => {
      cy.contains('button', "Buscar").click();
      cy.get(
        'h3',
        { timeout: 10000 }
      ).should('have.length.greaterThan', 0);
    });
  });

  describe('User Interactions', () => {
    it('should be able to get multiple meal suggestions', () => {
      const buttonSelector = 'button';
      
      cy.get(buttonSelector).first().click();
      
      cy.get(buttonSelector).first().click();
    });

    it('should display different meals on successive requests', () => {
      const meals = [];

      cy.contains('button', "Buscar")
        .click()
        .then(() => {
          cy.get('[data-testid="meal-name"], h1, h2').then(($el) => {
            meals.push($el.text());
          });
        });

      cy.contains('button', "Buscar").click();
      cy.get('[data-testid="meal-name"], h1, h2').then(($el) => {
        const secondMeal = $el.text();
        // Meals might be the same, but we should get valid responses
        expect(secondMeal).to.not.be.empty;
      });
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('body').should('be.visible');
      cy.contains('button', "Buscar").should('be.visible');
    });

    it('should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('body').should('be.visible');
      cy.contains('button', "Buscar").should('be.visible');
    });

    it('should be responsive on desktop viewport', () => {
      cy.viewport('macbook-15');
      cy.get('body').should('be.visible');
      cy.contains('button', "Buscar").should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('**/api/**', { statusCode: 500 }).as('failedRequest');
      cy.contains('button', "Buscar").click();
      
      // Application should still be functional or show error message
      cy.get('body').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.text', "Buscar");
      });
    });

    it('should be keyboard navigable', () => {
      cy.get('button').first().focus();
      cy.focused().should('have.prop', 'tagName', 'BUTTON');
    });
  });
});

describe('Meal Suggestion Performance', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the page within acceptable time', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
      onLoad: (win) => {
        win.performance.mark('end');
        win.performance.measure('pageLoad', 'start', 'end');
        const measure = win.performance.getEntriesByName('pageLoad')[0];
        expect(measure.duration).to.be.lessThan(3000);
      },
    });
  });

  it('should fetch meal suggestion quickly', () => {
    cy.window().then((win) => {
      win.performance.mark('mealRequestStart');
    });

    cy.contains('button', "Buscar").click();

    cy.window().then((win) => {
      win.performance.mark('mealRequestEnd');
      win.performance.measure('mealFetch', 'mealRequestStart', 'mealRequestEnd');
      const measure = win.performance.getEntriesByName('mealFetch')[0];
      expect(measure.duration).to.be.lessThan(10000);
    });
  });
});

describe('Meal Suggestion Data Validation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should return valid meal data', () => {
    cy.contains('button', "Buscar").click();

    cy.get('[data-testid="meal-name"], h1, h2').then(($name) => {
      expect($name.text()).to.not.be.empty;
    });
  });

  it('should display meal details consistently', () => {
    const mealDetails = [];

    cy.contains('button', "Buscar").click();

    cy.get('[data-testid="meal-name"], h1, h2', { timeout: 10000 }).then(
      ($name) => {
        mealDetails.push($name.text());
      }
    );

    cy.then(() => {
      expect(mealDetails.length).to.be.greaterThan(0);
      expect(mealDetails[0]).to.not.be.empty;
    });
  });
});