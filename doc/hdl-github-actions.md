# Build GHDL no GitHub Actions

O build Linux reconstrói **assets candidatos** para o executor do navegador.
Não executa HDL dos visitantes, não publica npm, não cria releases e não faz
deploy. O aplicativo continua funcionando em hospedagem estática.

## Primeira execução, inclusive no Windows

Execute esses comandos no checkout Git do projeto. A orquestração de CI é
ferramenta de desenvolvimento; o pacote npm distribui a receita do compilador
e seu normalizador, sem os scripts de orquestração ou caches Python.

Requisitos locais: Node.js/npm e Git, já usados pelo projeto, e autorização de
push no GitHub pelo mecanismo normal do Git. Não é necessário instalar Docker,
WSL ou GitHub CLI no Windows para enviar e iniciar o primeiro build.

```text
npm run hdl:ci:branch
```

Esse comando cria `codex/hdl-build`, preservando as alterações locais. Revise
`git status` e o diff, adicione apenas os arquivos destinados ao repositório e
crie o commit. O script não cria commits nem adiciona arquivos automaticamente.
Depois execute:

```text
npm run hdl:ci:push
npm run hdl:ci:status
```

O push de um commit novo que altere a receita GHDL ou o próprio workflow nessa
branch inicia o workflow `HDL GHDL Linux build`. O script exige árvore limpa,
branch dedicada e o repositório `MathJSLab/mathjslab-markdown` como destino.
Não usa force push e não altera `main`. A publicação npm é uma etapa separada,
feita com `release:publish`; não é necessária para esse trabalho.

Se o push informar que tudo já estava atualizado, não surge outra execução.
Abra a execução anterior e use **Re-run jobs**. O workflow também declara
`workflow_dispatch`: o botão **Run workflow** estará disponível quando o
arquivo do workflow estiver na branch padrão, conforme as regras do GitHub. O
acionamento pelo push permite o primeiro teste sem integrar a branch em main.

Página de acompanhamento:
[HDL GHDL Linux build](https://github.com/MathJSLab/mathjslab-markdown/actions/workflows/hdl-ghdl-build.yml).
Se Actions estiver desabilitado no repositório, habilite-o em Settings →
Actions; políticas da organização também podem exigir liberação das actions
utilizadas.

## Resultados e download

`hdl:ci:status` usa a API pública, sem token, acrescentando os certificados do
sistema quando a versão do Node oferece esse recurso. Limites de requisição ou
um repositório privado podem impedir essa consulta; nesse caso use a página do
GitHub autenticada. Na execução, abra os passos para ler os logs e a seção
**Artifacts** para baixar `ghdl-candidate-<commit>-<tentativa>`.

Opcionalmente, com GitHub CLI instalado e autenticado no computador de
desenvolvimento, é possível baixar pelo terminal:

```text
npm run hdl:ci:download -- ID_DA_EXECUCAO
```

O download fica em `.hdl-research/github-actions/<ID>/`, ignorado pelo Git.
Essa autenticação é exclusiva da ferramenta de desenvolvimento; nenhuma
credencial integra os assets ou é exigida do visitante.

## O que o workflow comprova

- Runner `ubuntu-24.04`, permissões somente de leitura e actions fixadas por
  SHA.
- Uma imagem Docker construída e identificada, com lista de pacotes registrada.
- Duas reconstruções sequenciais com caches inicialmente inexistentes e saídas
  independentes; não há cache Actions de compilador que mascare o segundo
  build.
- Seis smoke tests de cada candidato em WebAssembly no Node.
- Comparação SHA-256 de `ghdl-synth.wasm` e `libraries.tar.gz`.
- Logs, commit, identidade da imagem, versões, uso de disco e candidatos
  preservados por sete dias, inclusive em falhas normais do job. Um
  cancelamento forçado ou limite do runner pode impedir a finalização do
  upload.

Os dois builds usam a mesma imagem registrada. A receita final fixa a base
Ubuntu Linux/amd64 por digest, todas as 236 versões instaladas e os hashes dos
145 arquivos `.deb` baixados, verificados antes da instalação. Não depende do
serviço de snapshots; versões indisponíveis ou hashes diferentes fazem o build
falhar, sem seleção automática de substitutos. A primeira comparação detectou diferenças exclusivamente nos
timestamps internos de seis catálogos `.cf`, embora ambos os Wasm fossem
idênticos e os doze smoke tests passassem. A receita agora normaliza esses
timestamps preservando sua ordem por versão da linguagem e o timestamp especial
de `std.standard`; `library-metadata.json` registra os hashes originais e
normalizados. Qualquer diferença restante continua fazendo o workflow falhar;
não se transforma divergência em aprovação. Falhas antes de gerar ambos os
candidatos também não comprovam reprodução.

O primeiro job é uma investigação real da receita, não uma promessa de sucesso.
Há limite de 350 minutos e o espaço do runner pode ser insuficiente; os
registros de disco ajudam a decidir o próximo ajuste. Não há contratação
automática de runner maior. Os caches temporários de fonte/build não são
enviados como artefatos; fontes e receita são identificadas pelos commits e
pelo hash do arquivo AdaWebPack verificado durante o build.

Mesmo uma comparação idêntica **não publica o pacote**: a promoção exige revisão
e testes reais de navegador e integração do app. O workflow não modifica
`assets/hdl/`, o lock, nem a flag de reprodução. A evidência promovida fica em
`script/hdl/ghdl-synth/reproduction.json`, vinculada aos hashes de doze arquivos
da receita, aos dois builds e aos assets. `verify:hdl:release` rejeita evidência
desatualizada, mesmo que alguém altere isoladamente a flag de reprodução.

## Continuidade

O contexto técnico permanece em `doc/hdl-vhdl-progress.md`,
`doc/hdl-browser-results.md`, `script/hdl/ghdl-synth/README.md` e neste
documento. Os 402 casos de navegador anteriores pertencem à distribuição então
validada; não validam automaticamente artefatos novos. O build Linux final
fixado foi comprovado e promovido; as validações da distribuição atual e da
integração estão registradas nos relatórios acima. NVC e Icarus mantêm seus
mesmos bytes e contratos.

## Receita final fixada e promoção

A execução [39482133976](https://github.com/MathJSLab/mathjslab-markdown/actions/runs/39482133976),
commit `1d2683aeccd9f45f19452c919dd4589d3910074b`, passou com os hashes dos
pacotes obrigatórios antes da instalação, duas reconstruções independentes,
quatro testes de metadados, sete testes do comparador/verificador e seis smoke
tests por candidato. A execução anterior `39480843148` já havia fixado todas
as versões e produzido o manifesto dos `.deb`; o resultado final confirma seus
hashes e reproduz os mesmos assets.

Os candidatos exatos foram promovidos para `assets/hdl/ghdl/`, com atualização
do host binding, integridade, avisos e evidência de origem. A flag GHDL agora
está comprovada no escopo declarado: duas árvores/cache limpas no mesmo host CI,
com SDK e ambiente fixados. Não afirma reconstrução do SDK a partir dos seus
fontes nem reprodução em outras arquiteturas. A execução HDL do visitante
continua inteiramente em Workers no navegador, com os arquivos hospedados pela
própria aplicação.

## Diagnóstico das primeiras falhas (2026-10-20)

As execuções `39474680130` e `39474875268` compilaram os dois candidatos e
passaram os seis smoke tests de cada um. A verificação final detectou diferença
somente no arquivo de bibliotecas; os dois módulos Wasm tinham SHA-256
`245664fcd1cbb1200627d9b566e90da3e54188447fabb38b2c9fe469a59eb57e`. Inspeção do
segundo par de arquivos confirmou que apenas os timestamps de análise dos seis
catálogos std/ieee mudavam entre compilações.

A correção está em `pack-libraries.py`. A normalização mantém a ordem estrita e
as igualdades dos timestamps dentro de cada versão da linguagem. A época fixa
fica depois do timestamp de `std.standard`, que o compilador cria
implicitamente. Usar uma época anterior provoca erros de dependência obsoleta;
atribuir um único valor a todos os arquivos perde informação de ordem. As
bibliotecas de versões distintas são independentes e podem ser compiladas em
paralelo.

Aplicada localmente aos dois candidatos reais da execução `39474875268`, a
correção produziu arquivos idênticos e passou os seis smoke tests. Também
passou quatro testes de metadados e três testes do comparador. O candidato
normalizado foi validado em hospedagem somente estática: **23 casos no Chrome
155.0.8059.85 e 23 no Edge 155.0.4283.62**, incluindo pt/en/es, fontes novas,
numeric_std, contador e diagnósticos. Foram 698 requisições, todas GET da mesma
origem, sem corpos ou parâmetros de consulta e sem erros de página.

Essa rodada usou o par da primeira reconstrução normalizado localmente, sem
modificar a distribuição existente. Não constitui uma nova matriz completa de
simulação ou uma revalidação do mathjslab-app. O SHA-256 das bibliotecas
testadas foi
`a64b0413ede4d87c96c9486e9e5aaa77741878f8d6c42f7e50934c9bf997b31d`. A execução
[39477964053](https://github.com/MathJSLab/mathjslab-markdown/actions/runs/39477964053),
no commit `7d6f9e50e48b4275196da29e0c18d93a1893ae03`, concluiu com **sucesso**:
duas reconstruções Linux com caches independentes, quatro testes de metadados,
três testes do comparador, seis smoke tests de cada candidato e comparação
idêntica dos dois arquivos finais. O Wasm manteve o hash acima; as bibliotecas
Linux têm SHA-256
`e67ca499db3ae429c382b1cc5c91775eb292918e2f7008daee29a995c6f2874a`. Seu
conteúdo é idêntico ao candidato normalizado localmente; a ordem de entradas e
permissões de scripts no tar diferem entre a preparação Windows e o Linux. A
correção da comparação Linux está confirmada; fixação dos insumos e promoção
dos candidatos ainda estavam pendentes naquela etapa. Ambas foram concluídas
na receita final fixada e promovida descrita acima.

O par exato baixado da execução aprovada também foi validado depois, com o
build concluído e os arquivos congelados: **23 casos no Chrome e 23 no Edge**,
sequencialmente, novamente com 698 GET da mesma origem, sem corpos, parâmetros
de consulta ou erros de página. Os relatórios `vhdl-synthesis-*-candidate.json`
registram o hash Linux acima e o hash do host binding de teste. Os resultados
da preparação Windows são apenas uma etapa preliminar; a evidência final usa os
bytes efetivamente gerados pelo Actions.

A verificação de empacotamento passou com 875 arquivos, incluindo o normalizador
e este guia, excluindo caches Python e a orquestração de CI.

## Testar candidatos sem substituir a distribuição

Na integração do app, o teste antigo de VCD sem sinais ainda exigia erro. O
pacote já produz um VCD vazio válido com o tempo final real. O patch
`doc/integration/mathjslab-app-empty-trace.patch` atualiza somente essa expectativa
para exigir sucesso, nenhum sinal inventado e o fim real em 1 ns (o limite
solicitado de 3 ns não força a execução a continuar sem eventos). Foi validado
na cópia isolada do app. A aplicação no checkout original depende da permissão
de escrita daquele projeto. Confira antes de aplicar, a partir do app:

```text
git apply --check --ignore-space-change ../mathjslab-markdown/doc/integration/mathjslab-app-empty-trace.patch
git apply --ignore-space-change ../mathjslab-markdown/doc/integration/mathjslab-app-empty-trace.patch
```

O servidor estático dos testes aceita `HDL_GHDL_CANDIDATE`, apontando para um
diretório dentro do workspace com os dois arquivos candidatos. Prepare primeiro
uma cópia do host binding nesse diretório, com os hashes dos candidatos:

```powershell
$env:HDL_GHDL_CANDIDATE = '.hdl-research/caminho-do-candidato/build-1'
node test/hdl-browser/prepare-ghdl-candidate.mjs $env:HDL_GHDL_CANDIDATE
npm run test:hdl:browser:vhdl
$env:HDL_BROWSER = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm run test:hdl:browser:vhdl
Remove-Item Env:HDL_GHDL_CANDIDATE, Env:HDL_BROWSER
```

Conclua o build e congele o candidato antes dos testes; execute os navegadores
sequencialmente. Somente três arquivos estáticos são substituídos nas respostas
do servidor de testes: o Wasm GHDL, as bibliotecas e o host binding do
candidato. O servidor continua aceitando apenas GET, sem endpoint de
processamento. `assets/hdl/`, a distribuição e os demais compiladores
permanecem intactos. Os relatórios usam o sufixo `-candidate` para preservar os
resultados anteriores; o teste também registra os hashes dos candidatos nas
próximas execuções.
