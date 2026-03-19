import React from 'react';
import { ThankYouPage } from '../../src/components/ThankYouPage';

describe('<ThankYouPage />', () => {
  const ORDER_NUMBER = 'ORDER-12345';

  it('deve renderizar o título, mensagem e número do pedido', () => {
    cy.mount(<ThankYouPage orderNumber={ORDER_NUMBER} onBackToStore={() => {}} />);

    cy.contains('h1', 'Thank You for Your Purchase!').should('be.visible');
    cy.contains(
      "Your order has been successfully placed. We've sent a confirmation email with your order details."
    ).should('be.visible');

    cy.contains('Order Number').should('be.visible');
    cy.contains(ORDER_NUMBER).should('be.visible');

    cy.contains('button', 'Back to Store').should('be.visible');
  });

  it('deve chamar onBackToStore ao clicar no botão', () => {
    const onBackToStore = cy.stub().as('onBackToStore');

    cy.mount(<ThankYouPage orderNumber={ORDER_NUMBER} onBackToStore={onBackToStore} />);

    cy.contains('button', 'Back to Store').click();

    cy.get('@onBackToStore').should('have.been.calledOnce');
  });
});

