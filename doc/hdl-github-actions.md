# Build GHDL no GitHub Actions

O build Linux reconstrói **assets candidatos** para o executor do navegador.
Não executa HDL dos visitantes, não publica npm, não cria releases e não faz
deploy. O aplicativo continua funcionando em hospedagem estática.

## Primeira execução, inclusive no Windows

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
Não usa force push e não altera `main`. Não use `git:all:npm:publish` ou
`do:all` para esse trabalho.

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

Os dois builds usam a mesma imagem registrada. A base Ubuntu e os pacotes da
receita ainda precisam de fixação por digest/snapshot para reconstrução futura
equivalente. A primeira comparação detectou diferenças exclusivamente nos
timestamps internos de seis catálogos `.cf`, embora ambos os Wasm fossem
idênticos e os doze smoke tests passassem. A receita agora normaliza esses
timestamps preservando sua ordem por versão da linguagem e o timestamp
especial de `std.standard`; `library-metadata.json` registra os hashes originais
e normalizados. Qualquer diferença restante continua fazendo o workflow falhar;
não se transforma divergência em aprovação. Falhas antes
de gerar ambos os candidatos também não comprovam reprodução.

O primeiro job é uma investigação real da receita, não uma promessa de sucesso.
Há limite de 350 minutos e o espaço do runner pode ser insuficiente; os
registros de disco ajudam a decidir o próximo ajuste. Não há contratação
automática de runner maior. Os caches temporários de fonte/build não são
enviados como artefatos; fontes e receita são identificadas pelos commits e
pelo hash do arquivo AdaWebPack verificado durante o build.

Mesmo uma comparação idêntica **não aprova publicação**: ainda é preciso fixar
os insumos, investigar a semântica das bibliotecas, atualizar candidatos
somente após revisão e repetir os testes reais de navegador e integração do
app. O workflow não modifica `assets/hdl/`, o lock, nem a flag de reprodução.

## Continuidade

O contexto técnico permanece em `doc/hdl-vhdl-progress.md`,
`doc/hdl-browser-results.md`, `script/hdl/ghdl-synth/README.md` e neste
documento. Os 402 casos de navegador anteriores pertencem à distribuição então
validada; não validam automaticamente artefatos novos. A pendência imediata é
obter o primeiro resultado Linux, corrigir a receita com evidência e concluir a
reconstrução independente GHDL, preservando NVC e Icarus funcionais.
