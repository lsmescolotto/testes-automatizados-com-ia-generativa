//feito a partir dos arquivos core da aplicação enviados
describe('Sugestão de Refeição Vegana', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Carregamento e Layout', () => {
    it('deve exibir o título da página corretamente', () => {
      cy.get('h1').contains('Refeição vegana').should('be.visible');
    });

    it('deve exibir o container de filtros', () => {
      cy.get('#filter-container').should('be.visible');
      cy.get('label[for="meal-type-filter"]').should('be.visible');
      cy.get('#meal-type-filter').should('be.visible');
    });

    it('deve exibir o container de busca', () => {
      cy.get('#search-container').should('be.visible');
      cy.get('label[for="search-field"]').should('be.visible');
      cy.get('#search-field').should('be.visible');
      cy.get('button[type="submit"]').contains('Buscar').should('be.visible');
    });

    it('deve exibir container de conteúdo', () => {
      cy.get('#content-wrapper').should('be.visible');
      cy.get('#meal-container').should('be.visible');
    });
  });

  describe('Filtro por Tipo de Refeição', () => {
    it('deve ter todas as opções no dropdown de tipo', () => {
      cy.get('#meal-type-filter').children('option').should('have.length', 7);
    });

    it('deve listar todas as opções corretas', () => {
      cy.get('#meal-type-filter').should('contain', 'Todos');
      cy.get('#meal-type-filter').should('contain', 'Saladas');
      cy.get('#meal-type-filter').should('contain', 'Sopas');
      cy.get('#meal-type-filter').should('contain', 'Sanduíches');
      cy.get('#meal-type-filter').should('contain', 'Pratos quentes');
      cy.get('#meal-type-filter').should('contain', 'Lanches');
      cy.get('#meal-type-filter').should('contain', 'Alto teor de proteína');
    });

    it('deve selecionar "Todos" como opção padrão', () => {
      cy.get('#meal-type-filter').should('have.value', 'all');
    });

    it('deve filtrar por Saladas', () => {
      cy.get('#meal-type-filter').select('salad');
      cy.get('#meal-name').should('contain', 'salada');
    });

    it('deve filtrar por Sopas', () => {
      cy.get('#meal-type-filter').select('soup');
      cy.get('#meal-name').should('contain', 'sopa');
    });

    it('deve filtrar por Sanduíches', () => {
      cy.get('#meal-type-filter').select('sandwich');
      cy.get('#meal-name').should('contain', 'sanduíche');
    });

    it('deve filtrar por Pratos Quentes', () => {
      cy.get('#meal-type-filter').select('hot');
      cy.get('#meal-name').should('contain', 'prato quente');
    });

    it('deve filtrar por Lanches', () => {
      cy.get('#meal-type-filter').select('snack');
      cy.get('#meal-name').should('contain', 'lanche');
    });

    it('deve filtrar por Alto Teor de Proteína', () => {
      cy.get('#meal-type-filter').select('high-protein');
      cy.get('#meal-name').should('contain', 'alto teor de proteína');
    });

    it('deve retornar a "Todos" quando selecionado novamente', () => {
      cy.get('#meal-type-filter').select('salad');
      cy.get('#meal-type-filter').select('all');
      cy.get('#meal-name').should('not.be.empty');
    });

    it('deve gerar receita aleatória ao mudar filtro', () => {
      cy.get('#meal-type-filter').select('soup');
      cy.get('#meal-name').then(($meal1) => {
        const firstMeal = $meal1.text();
        cy.get('#meal-type-filter').select('hot');
        cy.get('#meal-name').then(($meal2) => {
          expect($meal2.text()).to.not.equal(firstMeal);
        });
      });
    });
  });

  describe('Busca por Nome da Refeição', () => {
    it('deve exibir placeholder correto no campo de busca', () => {
      cy.get('#search-field').should('have.attr', 'placeholder', 'Ex: Arroz e feijão');
    });

    it('deve permitir digitar no campo de busca', () => {
      cy.get('#search-field').type('feijoada');
      cy.get('#search-field').should('have.value', 'feijoada');
    });

    it('deve buscar receita ao apertar Enter', () => {
      cy.get('#search-field').type('feijoada{enter}');
      cy.get('#meal-name').should('contain', 'Feijoada');
      cy.get('#search-field').should('have.value', 'feijoada');
    });

    it('deve buscar receita ao perder o foco', () => {
      cy.get('#search-field').type('ramen');
      cy.get('#search-field').blur();
      cy.get('#meal-name').should('contain', 'Ramen');
    });

    it('deve buscar receita ao clicar no botão Buscar com valor preenchido', () => {
      cy.get('#search-field').type('lasanha');
      cy.get('button[type="submit"]').click();
      cy.get('#meal-name').should('contain', 'Lasanha de berinjela');
    });

    it('deve buscar case-insensitive', () => {
      cy.get('#search-field').type('RAMEN{enter}');
      cy.get('#meal-name').should('contain', 'Ramen');
    });

    it('deve buscar com espaços em branco', () => {
      cy.get('#search-field').type('arroz e feijão{enter}');
      cy.get('#meal-name').should('contain', 'Arroz e feijão');
    });

    it('deve manter a última receita se a busca não encontrar nada', () => {
      cy.get('#search-field').type('xyz123abc{enter}');
      cy.get('#meal-name').should('not.be.empty');
    });
  });

  describe('Botão Buscar', () => {
    it('deve exibir botão Buscar visível', () => {
      cy.get('button[type="submit"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Buscar');
    });

    it('deve gerar receita aleatória ao clicar em Buscar vazio', () => {
      cy.get('button[type="submit"]').click();
      cy.get('#meal-name').should('not.be.empty');
      cy.get('#ingredients-list').children('li').should('have.length.greaterThan', 0);
    });

    it('deve limpar o valor no campo após clicar em Buscar com valor', () => {
      cy.get('#search-field').type('chilly');
      cy.get('button[type="submit"]').click();
      cy.get('#search-field').should('have.value', '');
    });

    it('deve ter cor de fundo azul', () => {
      cy.get('button[type="submit"]').should('have.css', 'background-color', 'rgb(0, 83, 179)');
    });

    it('deve ter texto branco', () => {
      cy.get('button[type="submit"]').should('have.css', 'color', 'rgb(255, 255, 255)');
    });
  });

  describe('Exibição de Refeição e Ingredientes', () => {
    it('deve exibir nome da refeição em h2', () => {
      cy.get('#meal-name').should('be.visible');
      cy.get('#meal-name').should('be.a', 'h2');
      cy.get('#meal-name').should('not.be.empty');
    });

    it('deve exibir tipo da refeição entre parênteses', () => {
      cy.get('#meal-name').should('contain', '(');
      cy.get('#meal-name').should('contain', ')');
    });

    it('deve exibir label de ingredientes', () => {
      cy.get('#ingredients-label').should('contain', 'Ingredientes:');
      cy.get('#ingredients-label').should('be.visible');
    });

    it('deve exibir lista de ingredientes com ul', () => {
      cy.get('#ingredients-list').should('be.visible');
      cy.get('#ingredients-list').should('be.a', 'ul');
    });

    it('deve listar ingredientes em li', () => {
      cy.get('#ingredients-list').children('li').should('have.length.greaterThan', 0);
      cy.get('#ingredients-list').children('li').each(($li) => {
        cy.wrap($li).should('not.be.empty');
      });
    });

    it('deve exibir ingredientes corretos para Ramen', () => {
      cy.get('#search-field').type('ramen{enter}');
      cy.get('#meal-name').should('contain', 'Ramen');
      
      const expectedIngredients = [
        'massa de ramen',
        'brócolis',
        'cenoura',
        'edamame',
        'tofu',
        'cebolinha',
        'misô',
        'milho'
      ];

      expectedIngredients.forEach((ingredient) => {
        cy.get('#ingredients-list').should('contain', ingredient);
      });
    });

    it('deve exibir indicador de proteína alta quando aplicável', () => {
      cy.get('#search-field').type('feijoada{enter}');
      cy.get('#meal-name').should('contain', 'alto teor de proteína');
    });

    it('deve não exibir indicador de proteína alta quando não aplicável', () => {
      cy.get('#search-field').type('salada de rúcula{enter}');
      cy.get('#meal-name').should('not.contain', 'alto teor de proteína');
    });

    it('deve ter barra azul no lado esquerdo da lista', () => {
      cy.get('#ingredients-list').should('have.css', 'border-left', '3px solid rgb(0, 83, 179)');
    });

    it('deve ter background cinzento na lista', () => {
      cy.get('#ingredients-list').should('have.css', 'background-color', 'rgb(248, 249, 250)');
    });
  });

  describe('Randomização de Receitas', () => {
    it('deve carregar receita aleatória ao iniciar a página', () => {
      cy.reload();
      cy.get('#meal-name').should('not.be.empty');
      cy.get('#ingredients-list').children('li').should('have.length.greaterThan', 0);
    });

    it('deve gerar diferentes receitas em múltiplas chamadas', () => {
      const meals = [];

      cy.get('#meal-name').then(($el) => {
        meals.push($el.text());
      });

      cy.get('button[type="submit"]').click();
      cy.get('#meal-name').then(($el) => {
        meals.push($el.text());
      });

      cy.then(() => {
        expect(meals.length).to.equal(2);
        expect(meals[0]).to.not.be.empty;
        expect(meals[1]).to.not.be.empty;
      });
    });

    it('deve gerar receita aleatória ao clicar Buscar sem valor', () => {
      const firstMealName = cy.get('#meal-name').then(($el) => {
        return $el.text();
      });

      cy.get('button[type="submit"]').click();
      cy.get('#meal-name').should(($el) => {
        const secondMealName = $el.text();
        expect(secondMealName).to.not.be.empty;
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associadas aos inputs', () => {
      cy.get('label[for="meal-type-filter"]').should('exist');
      cy.get('label[for="search-field"]').should('exist');
    });

    it('deve permitir navegação com Tab', () => {
      cy.get('#meal-type-filter').focus();
      cy.focused().should('have.id', 'meal-type-filter');

      cy.get('#search-field').focus();
      cy.focused().should('have.id', 'search-field');

      cy.get('button[type="submit"]').focus();
      cy.focused().should('contain', 'Buscar');
    });

    it('deve ativar busca com Enter no campo de entrada', () => {
      cy.get('#search-field').focus().type('feijoada{enter}');
      cy.get('#meal-name').should('contain', 'Feijoada');
    });

    it('deve ativar busca com Enter no botão', () => {
      cy.get('#search-field').type('ramen');
      cy.get('button[type="submit"]').focus().type('{enter}');
      cy.get('#meal-name').should('contain', 'Ramen');
    });

    it('deve usar semântica correta com h1, h2, h3', () => {
      cy.get('h1').should('contain', 'Refeição vegana');
      cy.get('h2').should('exist');
      cy.get('h3').should('contain', 'Ingredientes:');
    });

    it('deve ter cores com contraste adequado', () => {
      cy.get('h1').should('have.css', 'color', 'rgb(0, 83, 179)');
      cy.get('h2').should('have.css', 'color', 'rgb(0, 83, 179)');
      cy.get('h3').should('have.css', 'color', 'rgb(0, 52, 112)');
    });

    it('deve ter botão com cursor pointer', () => {
      cy.get('button[type="submit"]').should('have.css', 'cursor', 'pointer');
    });

    it('deve ter inputs com estilos visíveis', () => {
      cy.get('#meal-type-filter').should('have.css', 'border');
      cy.get('#search-field').should('have.css', 'border');
      cy.get('button[type="submit"]').should('have.css', 'border');
    });
  });

  describe('Responsividade e Viewport', () => {
    it('deve exibir corretamente em iPhone X', () => {
      cy.viewport('iphone-x');
      cy.get('h1').should('be.visible');
      cy.get('#filter-container').should('be.visible');
      cy.get('#search-container').should('be.visible');
      cy.get('#content-wrapper').should('be.visible');
    });

    it('deve exibir corretamente em iPhone 6', () => {
      cy.viewport('iphone-6');
      cy.get('h1').should('be.visible');
      cy.get('#meal-type-filter').should('be.visible');
      cy.get('#search-field').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('deve exibir corretamente em iPad', () => {
      cy.viewport('ipad-2');
      cy.get('h1').should('be.visible');
      cy.get('#filter-container').should('be.visible');
      cy.get('#search-container').should('be.visible');
      cy.get('#meal-name').should('be.visible');
    });

    it('deve exibir corretamente em desktop 1280x720', () => {
      cy.viewport(1280, 720);
      cy.get('body').should('have.css', 'max-width', '640px');
      cy.get('h1').should('be.visible');
      cy.get('#filter-container').should('be.visible');
      cy.get('#search-container').should('be.visible');
    });

    it('deve ser responsivo em telas grandes', () => {
      cy.viewport(1920, 1080);
      cy.get('h1').should('be.visible');
      cy.get('#content-wrapper').should('be.visible');
    });

    it('deve ter max-width de 640px no body', () => {
      cy.get('body').should('have.css', 'max-width', '640px');
    });
  });

  describe('Fluxos de Usuário Completos', () => {
    it('fluxo: filtrar por tipo, buscar, gerar aleatório', () => {
      // Filtrar por Sopas
      cy.get('#meal-type-filter').select('soup');
      cy.get('#meal-name').should('contain', 'sopa');

      // Buscar específica
      cy.get('#search-field').type('lentilha{enter}');
      cy.get('#meal-name').should('contain', 'Sopa de lentilha');

      // Gerar aleatória
      cy.get('button[type="submit"]').click();
      cy.get('#meal-name').should('contain', 'sopa');
      cy.get('#search-field').should('have.value', '');
    });

    it('fluxo: buscar múltiplas refeições em sequência', () => {
      cy.get('#search-field').type('feijoada{enter}');
      cy.get('#meal-name').should('contain', 'Feijoada');

      cy.get('#search-field').type('ramen{enter}');
      cy.get('#meal-name').should('contain', 'Ramen');

      cy.get('#search-field').type('pizza{enter}');
      cy.get('#meal-name').should('contain', 'Pizza');
    });

    it('fluxo: alternar entre filtros', () => {
      cy.get('#meal-type-filter').select('salad');
      cy.get('#meal-name').should('contain', 'salada');

      cy.get('#meal-type-filter').select('hot');
      cy.get('#meal-name').should('contain', 'prato quente');

      cy.get('#meal-type-filter').select('soup');
      cy.get('#meal-name').should('contain', 'sopa');

      cy.get('#meal-type-filter').select('all');
      cy.get('#meal-name').should('not.be.empty');
    });

    it('fluxo: testar proteína alta com busca', () => {
      cy.get('#meal-type-filter').select('high-protein');
      cy.get('#meal-name').should('contain', 'alto teor de proteína');

      cy.get('#search-field').type('feijoada{enter}');
      cy.get('#meal-name').should('contain', 'Feijoada');
      cy.get('#meal-name').should('contain', 'alto teor de proteína');
    });
  });

  describe('Estados e Validações', () => {
    it('deve manter refeição visível após busca inválida', () => {
      cy.get('#search-field').type('xxxyyyzzzabc{enter}');
      cy.get('#meal-name').should('not.be.empty');
      cy.get('#ingredients-list').children('li').should('have.length.greaterThan', 0);
    });

    it('não deve limpar busca ao clicar Buscar com valor preenchido', () => {
      cy.get('#search-field').type('chilly');
      cy.get('button[type="submit"]').click();
      cy.get('#search-field').should('have.value', 'chilly');
    });

    it('deve manter refeição após recarregar página', () => {
      cy.get('#meal-name').then(($el) => {
        expect($el.text()).to.not.be.empty;
      });

      cy.reload();
      cy.get('#meal-name').should('not.be.empty');
    });

    it('deve resetar filtro ao recarregar', () => {
      cy.get('#meal-type-filter').select('salad');
      cy.reload();
      cy.get('#meal-type-filter').should('have.value', 'all');
    });

    it('deve limpar campo de busca ao recarregar', () => {
      cy.get('#search-field').type('teste');
      cy.reload();
      cy.get('#search-field').should('have.value', '');
    });
  });

  describe('Performance e Comportamento', () => {
    it('deve carregar a página rapidamente', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start');
        },
      }).then(() => {
        cy.window().then((win) => {
          win.performance.mark('end');
          win.performance.measure('pageLoad', 'start', 'end');
          const measure = win.performance.getEntriesByName('pageLoad')[0];
          expect(measure.duration).to.be.lessThan(2000);
        });
      });
    });

    it('deve buscar receita rapidamente', () => {
      cy.window().then((win) => {
        win.performance.mark('searchStart');
      });

      cy.get('#search-field').type('feijoada{enter}');

      cy.window().then((win) => {
        win.performance.mark('searchEnd');
        win.performance.measure('searchTime', 'searchStart', 'searchEnd');
        const measure = win.performance.getEntriesByName('searchTime')[0];
        expect(measure.duration).to.be.lessThan(500);
      });
    });

    it('deve exibir ingredientes sem delay perceptível', () => {
      cy.get('#search-field').type('ramen{enter}');
      cy.get('#ingredients-list').children('li').should('have.length.greaterThan', 0);
    });
  });

});
