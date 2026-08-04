# ⚡ TraderSim - Advanced Trade Calculator

A **TraderSim - Advanced Trade Calculator** não é apenas mais uma calculadora na web. É um motor de cálculo de risco e alavancagem em grau-institucional (Exchange-Grade), projetado para proteger o capital de traders e simular com precisão cirúrgica o comportamento de corretoras reais como **Binance** e **Bybit**.

Enquanto a maioria das calculadoras assume cenários mágicos sem taxas ou fórmulas equivocadas, o nosso sistema utiliza engenharia reversa para colocar o **Gerenciamento de Risco** em primeiro lugar.

---

## 🎯 Por que a TraderSim é diferente?

1. **Matemática Exchange-Grade:** Emulamos exatamente como o motor de risco de uma Exchange funciona por baixo dos panos. Calculamos a Margem de Manutenção (MMR) corretamente para evitar liquidações irreais e prever seu *Margin Call* no centavo.
2. **Impacto das Taxas (Fees Ocultos):** Diferente de calculadoras genéricas, descontamos as taxas Taker/Maker de abertura e fechamento da posição no volume alavancado. Em altas alavancagens (50x-100x), isso salva contas de serem esvaziadas antes do Stop Loss.
3. **API em Tempo Real:** Conectada diretamente ao mercado (via API), a calculadora puxa o preço instantâneo e a variação 24h dos ativos da Binance/Bybit. Tudo sempre atualizado.
4. **Alerta de Funding Rate:** Calculamos e exibimos o impacto diário/semanal da Taxa de Financiamento (*Funding Rate*), mostrando o custo oculto de segurar posições abertas.

---

## 🛠 Módulos do Sistema

### 1. Simular Operação (A Calculadora Clássica Turbinada)
Feita para o trader que já sabe onde quer entrar e sair, mas precisa ver as métricas frias:
- Insira **Entrada, Stop, Alvo, Margem e Alavancagem**.
- Veja visualmente as métricas de Risco/Retorno (ROE).
- Visualize a distância (Folga) entre o seu Stop Loss e o momento em que a corretora te liquida compulsoriamente.
- Alertas visuais e sonoros mudam a paleta de cores se a alavancagem ou perda projetada ameaçar estourar a sua banca.

### 2. Descobrir Alavancagem (Engenharia Reversa de Risco)
A verdadeira "jóia" do sistema. Em vez de escolher uma alavancagem aleatória, o motor de cálculo trabalha para você.
- Diga ao sistema: *"Eu aceito perder no máximo $10 se eu for stopado"*.
- O motor de Engenharia Reversa fará o cálculo de trás pra frente, considerando o preço do Stop e as taxas escondidas.
- **Resultado Automático:** Ele te entregará, mastigado, qual deve ser o Tamanho da sua Posição, a Margem Exigida e a **Alavancagem Recomendada**. Você opera o seu capital com risco estritamente controlado.

### 3. Modos de Cálculo:
- **Modo Margem (Fixa):** O sistema acha a alavancagem ideal para uma margem que você já definiu.
- **Modo Capital (Total):** Você tem liberdade para ajustar a alavancagem (que definirá apenas sua margem alocada), travando matematicamente o seu Tamanho de Posição para não furar a sua perda aceitável estipulada.

---

## 🚀 Próximos Passos
Seja você um novato operando $100 ou um profissional gerenciando $100.000, as regras da matemática não perdoam. Use a TraderSim como o seu copiloto antes de clicar no botão "Comprar" ou "Vender" na sua Exchange favorita.
