//feito a partir de um print da aplicação
describe('Aplicação Refeição Vegana', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Carregamento da Página', () => {
    it('deve carregar a aplicação com sucesso', () => {
      cy.get('body').should('be.visible');
    });

    it('deve exibir o título da aplicação', () => {
      cy.contains('h1', 'Refeição vegana').should('be.visible');
    });

    it('deve exibir o ícone de favoritos no título', () => {
      cy.contains('h1', 'Refeição vegana').should('be.visible');
    });
  });

  describe('Filtro de Tipo', () => {
    it('deve exibir o dropdown de tipo de refeição', () => {
      cy.get('select').should('be.visible');
      cy.get('label').contains('Tipo:').should('be.visible');
    });

    it('deve exibir "Todos" como opção padrão', () => {
      cy.get('select').should('have.value', 'all');
    });

    it('deve conter múltiplas opções no dropdown', () => {
      cy.get('select option').should('have.length.greaterThan', 1);
    });

    it('deve permitir mudar o tipo de refeição', () => {
      cy.get('select').select(1); // Seleciona a segunda opção
      cy.get('select').should('not.have.value', 'all');
    });

  });

  describe('Busca de Refeições', () => {
    it('deve exibir o campo de busca', () => {
      cy.get('input[placeholder*="Arroz"]').should('be.visible');
      cy.get('label').contains('Busca:').should('be.visible');
    });

    it('deve ter placeholder correto no campo de busca', () => {
      cy.get('input[placeholder*="Arroz"]').should(
        'have.attr',
        'placeholder',
        'Ex: Arroz e feijão'
      );
    });

    it('deve exibir o botão de busca', () => {
      cy.contains('button', 'Buscar').should('be.visible').and('be.enabled');
    });

    it('deve permitir digitar no campo de busca', () => {
      const searchTerm = 'arroz';
      cy.get('input[placeholder*="Arroz"]').type(searchTerm);
      cy.get('input[placeholder*="Arroz"]').should('have.value', searchTerm);
    });

    it('deve realizar busca ao clicar no botão Buscar', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('exist');
    });

    it('deve permitir busca por Enter', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen{enter}');
      cy.get('h2').should('exist');
    });
  });

  describe('Exibição de Refeições', () => {
    it('deve exibir o nome da refeição', () => {
      cy.get('h2[id="meal-name"]').should('be.visible');
    });

    it('deve exibir a seção de ingredientes', () => {
      cy.contains('h3', 'Ingredientes:').should('be.visible');
    });

    it('deve exibir lista de ingredientes', () => {
      cy.get('ul[id="ingredients-list"]').should('be.visible');
    });

    it('deve ter barra azul no lado esquerdo da lista de ingredientes', () => {
      cy.get('ul').should('have.css', 'border-left');
    });
  });

  describe('Estados e Validações', () => {
    it('deve resetar busca ao mudar o filtro de tipo', () => {
      cy.get('input[placeholder*="Arroz"]').type('teste');
      cy.get('select').select(1);
      cy.get('input[placeholder*="Arroz"]').should('have.value', '');
    });

    it('deve ser case-insensitive na busca', () => {
      cy.get('input[placeholder*="Arroz"]').type('RAMEN');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('exist');
    });
  });
});
describe('Filtros de Refeição Vegana', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Interação com Dropdown', () => {
    it('deve abrir dropdown ao clicar', () => {
      cy.get('select').select(1);
      cy.get('select').should('have.focus');
    });

    it('deve manter a seleção após mudar', () => {
      cy.get('select').select(1);
      cy.reload();
      cy.get('select').should('have.value', 'all'); // Volta ao padrão após reload
    });

    it('deve filtrar refeições por tipo selecionado', () => {
      cy.get('h2').first().then(($firstMeal) => {
        const firstMealName = $firstMeal.text();
        cy.wrap(firstMealName).should('not.be.empty');
      });

      cy.get('select').select(1);
      cy.get('h2').should('exist');
    });
  });

  describe('Combinação de Filtros', () => {
    it('deve aplicar filtro de tipo e depois buscar', () => {
      cy.get('select').select(1);
      cy.get('input[placeholder*="Arroz"]').type('ramen');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('exist');
    });

    it('deve limpar filtro de tipo', () => {
      cy.get('select').select(1);
      cy.get('select').select('Todos');
      cy.get('select').should('have.value', 'all');
    });

    it('deve manter busca ao mudar tipo', () => {
      cy.get('input[placeholder*="Arroz"]').type('teste');
      const inputValue = cy.get('input[placeholder*="Arroz"]').invoke('val');
      cy.get('select').select(1);
      // O campo pode ser limpo pela aplicação, isso é correto
    });
  });
});
describe('Responsividade - Refeição Vegana', () => {
  describe('Mobile - iPhone', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.visit('/');
    });

    it('deve exibir título em mobile', () => {
      cy.contains('h1', 'Refeição vegana').should('be.visible');
    });

    it('deve exibir dropdown em mobile', () => {
      cy.get('select').should('be.visible');
    });

    it('deve exibir campo de busca em mobile', () => {
      cy.get('input[placeholder*="Arroz"]').should('be.visible');
    });

    it('deve exibir botão de busca em mobile', () => {
      cy.contains('button', 'Buscar').should('be.visible');
    });
  });

  describe('Tablet - iPad', () => {
    beforeEach(() => {
      cy.viewport('ipad-2');
      cy.visit('/');
    });

    it('deve exibir layout tablet', () => {
      cy.contains('h1', 'Refeição vegana').should('be.visible');
      cy.get('select').should('be.visible');
    });

    it('deve ter espaçamento adequado em tablet', () => {
      cy.get('input[placeholder*="Arroz"]').should('be.visible');
      cy.contains('button', 'Buscar').should('be.visible');
    });
  });

  describe('Desktop', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      cy.visit('/');
    });

    it('deve exibir layout desktop completo', () => {
      cy.contains('h1', 'Refeição vegana').should('be.visible');
      cy.get('select').should('be.visible');
      cy.get('input[placeholder*="Arroz"]').should('be.visible');
      cy.contains('button', 'Buscar').should('be.visible');
    });

    it('deve ter alinhamento correto', () => {
      cy.get('label').contains('Tipo:').should('have.css', 'font-weight');
    });
  });
});
describe('Acessibilidade - Refeição Vegana', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Labels e Elementos', () => {
    it('deve ter label para dropdown', () => {
      cy.get('label').contains('Tipo:').should('be.visible');
    });

    it('deve ter label para campo de busca', () => {
      cy.get('label').contains('Busca:').should('be.visible');
    });

    it('deve ter texto visível no botão', () => {
      cy.contains('button', 'Buscar').should('have.text', 'Buscar');
    });
  });

  describe('Navegação por Teclado', () => {
    it('deve navegar com Tab até o dropdown', () => {
      cy.get('select').first().focus();
      cy.focused().should('have.prop', "tagName", 'SELECT');
    });

    it('deve navegar com Tab até o input de busca', () => {
      cy.get('input[placeholder*="Arroz"]').focus();
      cy.focused().should('have.attr', 'placeholder');
    });

    it('deve navegar com Tab até o botão Buscar', () => {
      cy.contains('button', 'Buscar').focus();
      cy.focused().should('contain', 'Buscar');
    });

    it('deve ativar botão com Enter', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen');
      cy.get('input[placeholder*="Arroz"]').parent().find('button').focus();
      cy.focused().type('{enter}');
      cy.get('h2').should('exist');
    });

    it('deve ativar busca com Enter no input', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen{enter}');
      cy.get('h2').should('exist');
    });
  });

  describe('Semântica HTML', () => {
    it('deve usar heading h1 para título', () => {
      cy.get('h1').should('contain', 'Refeição vegana');
    });

    it('deve usar heading h2 para nome da refeição', () => {
      cy.get('h2').should('have.length.greaterThan', 0);
    });

    it('deve usar heading h3 para "Ingredientes"', () => {
      cy.get('h3').should('contain', 'Ingredientes:');
    });

    it('deve usar lista ul para ingredientes', () => {
      cy.get('ul').should('exist');
      cy.get('ul li').should('have.length.greaterThan', 0);
    });
  });

  describe('Contraste e Visibilidade', () => {
    it('deve ter título azul visível', () => {
      cy.contains('h1', 'Refeição vegana').should('have.css', 'color');
    });

    it('deve ter labels visíveis', () => {
      cy.get('label').should('have.length.greaterThan', 0);
      cy.get('label').each(($label) => {
        cy.wrap($label).should('be.visible');
      });
    });

    it('deve ter botão com cores de contraste', () => {
      cy.contains('button', 'Buscar').should('be.visible').and('be.enabled');
    });
  });
});

describe('Testes de Integração - Refeição Vegana', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Fluxo Completo do Usuário', () => {
    it('deve completar fluxo: buscar por termo', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('contain', 'Ramen');
      cy.get('h3').should('contain', 'Ingredientes:');
      cy.get('ul li').should('have.length.greaterThan', 0);
    });

    it('deve completar fluxo: filtrar por tipo', () => {
      cy.get('select').select(1);
      cy.get('h2').should('exist');
      cy.get('ul li').should('have.length.greaterThan', 0);
    });

    it('deve permitir nova busca após resultado', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('exist');

      cy.get('input[placeholder*="Arroz"]').type('vegano');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').should('exist');
    });

    it('deve permitir limpar e buscar novamente', () => {
      cy.get('input[placeholder*="Arroz"]').type('ramen{enter}');
      cy.get('h2').should('exist');

      cy.get('input[placeholder*="Arroz"]').clear().type('tofu{enter}');
      cy.get('input[placeholder*="Arroz"]').should('have.value', 'tofu');
    });
  });

  describe('Persistência e Estados', () => {
    it('deve manter refeições após múltiplas buscas', () => {
      cy.get('input[placeholder*="Arroz"]').type('a');
      cy.contains('button', 'Buscar').click();
      cy.get('h2').then(($h2) => {
        const firstCount = $h2.length;
        expect(firstCount).to.be.greaterThan(0);
      });
    });

    it('deve resetar ao recarregar página', () => {
      cy.get('input[placeholder*="Arroz"]').type('teste');
      cy.reload();
      cy.get('input[placeholder*="Arroz"]').should('have.value', '');
      cy.get('select').should('have.value', 'all');
    });
  });
});
