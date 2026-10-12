# Arquitetura

`mathjslab-app` compõe `mathjslab` e `mathjslab-markdown`. O núcleo possui a
semântica de execução, a preparação de gráficos e os contratos serializáveis de
saída, sem DOM ou Plotly. O pacote Markdown possui o engine, o componente e as
extensões educacionais. O aplicativo fornece a interface e os adaptadores de
execução, Worker e renderização.

O engine reutilizável não depende do estado global do aplicativo. A
renderização requer DOM; a integração MathJSLab é opcional e recebe executor,
transporte e renderer por composição. Sessões controlam recursos e cancelamento
por container. Descartar uma sessão não descarta um engine compartilhado.

Os pontos de entrada npm são definidos em `package.json`. `component` exporta a
classe e helpers; `component/register` registra o elemento. Bibliotecas
opcionais são carregadas sob demanda. A distribuição para navegador compartilha
runtime e chunks e requer a implantação de toda a árvore de assets.

A API pública e o protocolo Worker mantêm versões independentes. Contratos de
segurança, recursos e ciclo de vida estão documentados em `doc/pt`.

A integração opcional requer `mathjslab` 2.9.0 ou uma versão compatível. O
adaptador `createBrowserMathJSLabWorkerExecutor` usa `RemoteMathJSLabRuntime`
de `mathjslab/runtime`, com um Worker fornecido pelo host para cada sessão.
Esse Worker deve implementar o protocolo canônico do pacote, por exemplo com o
ponto de entrada `mathjslab/worker`. O protocolo público de
`MathJSLabWorkerRuntime` e `WorkerMathJSLabTransport` é independente e atende
integrações customizadas; ele não substitui o protocolo canônico.

Os fences de um documento executam em sequência, respeitando a propriedade
exclusiva da sessão introduzida pelo runtime. O adaptador preserva códigos de
diagnóstico, encaminha sinal e timeout na execução e mantém o serviço de
recursos até concluir o descarte remoto. Comandos conservam a supressão por
`;`. Saídas de valores usam MathML; textos independentes e descritores de
gráficos continuam disponíveis para renderização pelo host.
