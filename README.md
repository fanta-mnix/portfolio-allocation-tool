# Portfolio Allocation Tool

Aplicação desktop-first para apoio de alocação de portfólio, com foco inicial em alocação macro entre:

- Renda Fixa
- FIIs
- Ações

Todos os textos e formatos exibidos para o usuário seguem pt-BR.

## Execução local

```bash
pnpm install
pnpm dev
```

Abra http://localhost:3000 no navegador.

## Qualidade e validação

```bash
pnpm check
pnpm lint
pnpm test
```

- `pnpm check`: typecheck com `tsc --noEmit`
- `pnpm lint`: regras de lint do projeto
- `pnpm test`: suíte de testes unitários com Vitest

## Escopo implementado (macro)

- Estado de entrada com persistência em `localStorage`
- Modos `depositOnly` e `rebalance` com teto de vendas
- Motor de cálculo macro com invariantes testadas
- Formatação e parsing de valores no padrão pt-BR

## Checklist manual (step 6)

1. Abrir o app e preencher aporte, valores atuais e metas com vírgula decimal (ex.: `1.230,99`).
2. Confirmar que os campos reformatam para padrão pt-BR ao perder foco.
3. Confirmar que modo `depositOnly` desabilita o limite de vendas.
4. Alterar para `rebalance` e validar impacto do teto de vendas no status do resultado.
5. Recarregar a página e confirmar que os dados persistem.
6. Usar "Restaurar valores padrão" e verificar retorno aos defaults.
