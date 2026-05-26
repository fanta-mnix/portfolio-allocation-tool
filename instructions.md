The project is currently a green-field project initialized with the `create next-app` tool.

GOAL: Create a Desktop-focused web app using BR Portuguese for the user-facing texts (still use english for the code) in order to automate a spreadsheet that I use to help asset allocation according to a two-tiered strategy:
- Macro allocation in 3 asset classes: Renda Fixa, FIIs (Fundos de Investimento Imobiliario), Ações
- Micro allocation: each asset class has their own categories. E.g. Bancos in Ações, or Tijolo in FIIs.

SCOPE:
For the initial implementation, we will focus on the Macro allocation. There are two strategies, deposit-only and rebalance:
- depo
We have to first determine the Macro allocation between asset classes (in BR Portuguese): Renda Fixa, FIIs (Fundo de investimento imobiliário), Ações.
Whenever I have money to invest (Aporte in PT-BR), it should compare the current allocation (in %) with the ideal allocation and distribuite the deposit between asset classes in order to close the gap.
There are two strategies - deposit-only and rebalance. With deposit-only, we can't sell assets, just buy them. With rebalance, assets may be sold to match the allocation targets in %, but the user also has to provide how much it can sell.
