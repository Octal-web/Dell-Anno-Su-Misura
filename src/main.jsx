import React from 'react';
import { createRoot } from 'react-dom/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import images from './images.json';
import { useSiteAnimations, animateProcessSlide, prefersReducedMotion } from './animations.js';
import './styles.css';

const base = `${import.meta.env.BASE_URL}images/`;
// Caixa que a foto ocupa: [largura em vw, proporção largura/altura] no desktop e no celular.
// Com object-fit: cover, uma foto mais larga que a caixa é renderizada além da largura dela.
const box = (desktop, mobile, scale = 1) => ({ desktop, mobile, scale });
const boxes = {
  hero: box([100, 1.33], [100, .53]),
  intro: box([42, .7], [42, .64]),
  process: box([44, .98], [88, 1.25]),
  kitchen: box([100, 1.55], [100, 1.12], 1.2),
  solutions: box([100, 2.12], [100, .98], 1.2),
  closing: box([100, 1.8], [100, 1], 1.2),
  tiles: [box([23.5, .68], [23, .44]), box([63.2, 1.83], [63, 1.21]), box([23.5, .68], [43, .72]), box([23.5, .68], [43, .72])],
  finish: box([48.3, 1.4], [88, 1.47]),
};
function coverSizes(asset, { desktop, mobile, scale }, mobileAsset = asset) {
  const vw = ([width, ratio], { width: w, height: h }) => Math.ceil(width * Math.max(1, w / h / ratio) * scale);
  return `(max-width: 600px) ${vw(mobile, mobileAsset)}vw, ${vw(desktop, asset)}vw`;
}
const srcsetFor = (name, widths) => widths.map(w => `${base}${name}-${w}.webp ${w}w`).join(', ');
function Photo({ id, alt, className = '', eager = false, area = boxes.intro, sizes }) {
  const asset = images[id];
  const { mobile } = asset;
  sizes ??= coverSizes(asset, area, mobile);
  return <picture className={`photo ${className}`}>
    {mobile && <source media="(max-width: 600px)" srcSet={srcsetFor(`${id}-m`, mobile.widths)} sizes={sizes} width={mobile.width} height={mobile.height} />}
    <img src={`${base}${id}-${asset.widths.at(-1)}.webp`} srcSet={srcsetFor(id, asset.widths)} sizes={sizes} width={asset.width} height={asset.height} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />
  </picture>;
}
function Logo({ dark = false }) {
  return <Photo id={dark ? 'logo-2' : 'logo-1'} alt="Dell Anno Su Misura" className="logo" sizes={dark ? '(max-width: 600px) 34vw, 26vw' : '(max-width: 600px) 30vw, 22vw'} eager />;
}
const swiperProps = {
  modules: [A11y, Pagination, EffectFade],
  pagination: { clickable: true, renderBullet: (index, cls) => `<button class="${cls}" type="button" aria-label="Ir para o slide ${index + 1}"></button>` },
  tabIndex: 0,
  a11y: { paginationBulletMessage: 'Ir para o slide {{index}}', slideLabelMessage: '{{index}} de {{slidesLength}}' },
  effect: 'fade', fadeEffect: { crossFade: true }, speed: 650, loop: true,
};
const heroSwiperProps = prefersReducedMotion() ? swiperProps : {
  ...swiperProps, modules: [...swiperProps.modules, Autoplay], speed: 1100,
  autoplay: { delay: 6000, disableOnInteraction: false },
  onAutoplayTimeLeft: (swiper, time, progress) => swiper.el.style.setProperty('--progress', 1 - progress),
};
function handleCarouselKey(event) {
  const swiper = event.target.closest('.swiper')?.swiper;
  if (swiper && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
    event.preventDefault();
    if (event.key === 'ArrowRight') swiper.slideNext();
    else swiper.slidePrev();
  }
}
const steps = [
  { image: '4-1', italic: 'Atendimento', title: 'especializado', text: 'Um consultor Dell Anno dedicado acompanha o projeto, promovendo um relacionamento direto, ágil e focado em resultados.' },
  { image: '4-4', italic: 'Análise de', title: 'viabilidade técnica', text: 'Avaliação especializada para tornar suas ideias possíveis, com soluções que unem forma e função.' },
  { image: '4-3', italic: 'Pré-orçamento', title: 'técnico', text: 'Uma previsão clara e precisa para o desenvolvimento de projetos personalizados.' },
  { image: '4-2', italic: 'Consultoria integrada', title: 'de Design e Engenharia', text: 'Desenvolvimento de soluções exclusivas, integrando criatividade e conhecimento técnico em cada detalhe do projeto.' },
];
const projects = [
  { id: 'elementos', italic: 'Construção de módulos e', title: 'elementos exclusivos', text: 'Desenvolvimento de peças fora de catálogo, como módulos, painéis, nichos e elementos especiais, criados sob medida com alto padrão de acabamento.', photos: ['6-3', '6-1', '6-4', '6-2'], alts: ['Escada com módulos de armazenamento sob medida', 'Quarto com mobiliário e elementos exclusivos', 'Projeto de quarto com soluções personalizadas', 'Detalhe de gaveta integrada à escada'] },
  { id: 'portas', italic: 'Modelos de porta', title: 'personalizados', text: 'Desenvolvimento de peças fora de catálogo, como módulos, painéis, nichos e elementos especiais, criados sob medida com alto padrão de acabamento.', photos: ['7-1', '7-3', '7-2', '7-4'], alts: ['Porta personalizada com acabamento translúcido', 'Detalhe de porta em madeira e palhinha', 'Armário com portas e puxadores exclusivos', 'Porta de correr com desenho personalizado'] },
  { id: 'passagem', italic: 'Soluções para', title: 'portas de passagem', text: 'Projetos inovadores com novos dimensionais, mecanismos diferenciados e puxadores exclusivos, ampliando funcionalidade e design.', photos: ['8-1', '8-2', '8-3', '8-4'], alts: ['Porta integrada ao painel de madeira da cozinha', 'Porta de passagem com acabamento em madeira', 'Porta integrada à arquitetura do ambiente', 'Porta pivotante com painel ripado'] },
  { id: 'produtos', italic: 'Criação de', title: 'produtos únicos', text: 'Liberdade total para desenvolver peças autorais, com soluções estruturais e acabamentos personalizados.', photos: ['9-2', '9-3', '9-1', '9-4'], alts: ['Estante com desenho orgânico e iluminação integrada', 'Estante e armário de madeira com desenho exclusivo', 'Mesa de cabeceira personalizada em madeira', 'Gaveteiro com acabamento personalizado'] },
];
function Heading({ italic, title }) { return <h2><em>{italic}</em><br />{title}</h2>; }
function App() {
  useSiteAnimations();
  return <>
    <a className="skip-link" href="#introducao">Pular para o conteúdo</a>
    <main>
      <section className="hero" aria-label="Projetos Dell Anno Su Misura" onKeyDown={handleCarouselKey}>
        <h1 className="sr-only">Dell Anno Su Misura — Soluções personalizadas</h1>
        <Swiper {...heroSwiperProps} className="hero-swiper">
          {['1-2', '1-4', '1-3', '1-1'].map((id, i) => <SwiperSlide key={id}><Photo id={id} alt={['Espaço integrado com cozinha em pedra e madeira e vista para o jardim', 'Cozinha com armários verdes e bancada de pedra natural', 'Estante e armários personalizados em madeira', 'Quarto com escada e mobiliário sob medida'][i]} area={boxes.hero} eager={i === 0} /></SwiperSlide>)}
        </Swiper>
        <Logo />
      </section>
      <section id="introducao" className="intro content">
        <p className="intro-copy"><span className="serif">Dell Anno Su Misura</span> é um programa que oferece orientação e expertise em soluções de produtos personalizados. Com acesso a todos os recursos das coleções Dell Anno, o programa permite a utilização de materiais e acabamentos exclusivos, além da criação de soluções sob medida.</p>
        <Photo id="2-2" className="intro-bedroom" alt="Mesa de cabeceira sob medida com composição de objetos e luminária" />
        <Photo id="2-1" className="intro-kitchen" alt="Cozinha com marcenaria em madeira, prateleiras abertas e porta integrada" />
        <p className="intro-outro">Tudo isso é viabilizado por um departamento técnico especializado e dedicado, através de um modelo de trabalho colaborativo entre indústria e mercado, garantindo resultados de alto padrão.</p>
      </section>
      <Photo id="3-1" className="kitchen-banner" area={boxes.kitchen} alt="Cozinha Dell Anno com armários verdes, fornos embutidos e pedra natural" />
      <section className="process content" aria-labelledby="process-title" onKeyDown={handleCarouselKey}>
        <h2 id="process-title" className="eyebrow">Etapas do processo</h2>
        <Swiper {...swiperProps} className="process-swiper" onSlideChangeTransitionStart={animateProcessSlide}>
          {steps.map(step => <SwiperSlide key={step.title}><article className="process-slide"><div className="process-copy"><h3><em>{step.italic}</em><br />{step.title}</h3><p>{step.text}</p></div><Photo id={step.image} area={boxes.process} alt={`Processo de produção: ${step.italic.toLowerCase()} ${step.title}`} /></article></SwiperSlide>)}
        </Swiper>
      </section>
      <section className="solutions-banner" aria-labelledby="solutions-title">
        <Photo id="5-1" area={boxes.solutions} alt="Quarto personalizado com beliche, escada e nichos integrados" />
        <div className="solutions-copy"><h2 id="solutions-title"><span className="eyebrow">Soluções</span><br />personalizadas</h2><p>O programa oferece uma ampla gama de possibilidades para atender projetos únicos:</p></div>
        <a className="scroll-cue" href="#elementos" aria-label="Conhecer as soluções personalizadas" />
      </section>
      <div className="projects content">
        {projects.map((project, i) => <section id={project.id} className={`mosaic ${i % 2 ? 'reverse' : ''}`} key={project.id} aria-label={`${project.italic} ${project.title}`}>
          {project.photos.map((id, index) => <Photo key={id} id={id} className={`tile tile-${index + 1}`} alt={project.alts[index]} area={boxes.tiles[index]} />)}
          <div className="mosaic-copy"><Heading {...project} /><p>{project.text}</p></div>
        </section>)}
        <section className="mosaic finishes" aria-label="Expansão de acabamentos">
          <Photo id="10-1" className="tile tile-1" area={boxes.tiles[0]} alt="Painéis de madeira natural com forno embutido" />
          <Photo id="10-3" className="tile tile-2" area={boxes.tiles[1]} alt="Cozinha com acabamento em tom dourado e portas com vidro" />
          <Photo id="10-2" className="tile finish-photo" area={boxes.finish} alt="Cozinha com acabamento verde e bancada em pedra" />
          <div className="mosaic-copy"><Heading italic="Expansão de" title="acabamentos" /><p>Inclusão de lâminas naturais, pré-compostas e novos padrões em melamina, oferecendo mais sofisticação e variedade.</p></div>
        </section>
      </div>
      <section className="closing-banner">
        <Photo id="footer-1" area={boxes.closing} alt="Ambiente com cabeceira terracota, gaveteiro e poltrona" />
        <p>O Dell Anno Su Misura atende projetos em diferentes etapas, desde a concepção até obras em andamento: sempre com foco na <span className="serif">personalização e na excelência.</span></p>
      </section>
    </main>
    <footer className="footer content"><div><p>Seja adaptando designs existentes ou criando soluções inéditas, o programa garante suporte técnico completo e uma experiência colaborativa, resultando em projetos únicos e altamente qualificados.</p><p>Em constante evolução, o Su Misura segue incorporando novas ferramentas e tecnologias para tornar o processo ainda mais ágil, eficiente e preciso.</p></div><Logo dark /></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
