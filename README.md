# Dell Anno Su Misura

Site em React + Vite, com dois carrosséis Swiper, animações GSAP (ScrollTrigger e SplitText), layout responsivo e imagens WebP.

## Executar

```sh
npm install
npm run dev
```

Acesse `http://127.0.0.1:5173/su-misura/`.

## Publicar

```sh
npm run build
```

Envie o conteúdo de `dist/` para a pasta pública `su-misura/` do domínio. O projeto já usa `base: '/su-misura/'`; o endereço final é `https://meusite.com.br/su-misura/`. Configure o servidor para redirecionar `/su-misura` para `/su-misura/`. Não precisa de servidor Node em produção.

Use cache longo para `/su-misura/assets/` (arquivos com hash). Para `/su-misura/images/`, use cache com revalidação, pois os nomes são estáveis. O HTML deve ser revalidado.

## Imagens

As versões otimizadas estão em `public/images/`, prontas para publicação. Os originais permanecem intactos na pasta irmã `Assets Site`.

```sh
npm run images
# Ou informe outra pasta de origem:
node scripts/optimize-images.mjs "caminho/Assets Site"
```

O script gera WebP em 480, 960 e 1600 px; as fotos de largura total (hero e banners) também em 2400 px, e os logos em 400 e 800 px. O 2400 sempre tem a largura do nome: se o original for menor, ele é ampliado e o script lista o arquivo para ser trocado por um original melhor. O `sizes` de cada foto é calculado em `src/main.jsx` a partir da área que ela ocupa (`boxes`), considerando o corte do `object-fit: cover`. Fotos em `art` no script ganham recortes centrais: `crop` para o desktop e `mobile` para telas até 600 px (arquivos `-m-`, servidos via `<source media>`). Cada recorte precisa conter toda a área visível da foto naquele layout. A primeira foto tem prioridade alta; as demais usam carregamento sob demanda. O mapeamento dos originais está em `src/images.json`.

## Validação visual e funcional

Com o servidor de desenvolvimento em execução e Microsoft Edge instalado:

```sh
node scripts/verify.mjs
```

Verifica desktop e celular, paginação dos dois carrosséis, teclado, imagens, overflow e erros no navegador. Capturas locais ficam em `.qa/`.

## Conteúdo

Texto, sequência de fotos e carrosséis estão em `src/main.jsx`; estilos em `src/styles.css`; animações em `src/animations.js` (desativadas quando o sistema pede movimento reduzido). A implementação usa as referências visuais da conversa e as fotos locais. Os textos dos slides 2 a 4 do processo foram adaptados a partir da referência reduzida e devem ser conferidos com o documento original antes da publicação.
