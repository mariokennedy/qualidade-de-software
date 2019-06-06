/ *!
 * jQuery Cycle Plugin (com definições de transição)
 * Exemplos e documentação em: http://jquery.malsup.com/cycle/
 * Copyright (c) 2007-2013 M. Alsup
 * Versão: 3.0.3 (11-JUL-2013)
 * Dupla licenciada sob as licenças MIT e GPL.
 * http://jquery.malsup.com/license.html
 * Requer: jQuery v1.7.1 ou posterior
 * /
; (função ($, indefinido) {
"use strict";

var ver = '3.0.3';

função debug (s) {
	if ($ .fn.cycle.debug)
		log (s);
}		
função log () {
	/ * console global * /
	if (window.console && console.log)
		console.log ('[ciclo]' + Array.prototype.join.call (argumentos, ''));
}
$ .expr [':']. paused = function (el) {
	return el.cyclePause;
};


// as opções arg podem ser ...
// um número - indica que uma transição imediata deve ocorrer para o índice de slide fornecido
// uma string - 'pause', 'resume', 'toggle', 'next', 'prev', 'stop', 'destroy' ou o nome de um efeito de transição (ou seja, 'fade', 'zoom', etc)
// um objeto - propriedades para controlar o slideshow
//
// o arg2 arg pode ser ...
// o nome de um fx (usado apenas em conjunto com um valor numérico para 'opções')
// o valor true (usado apenas no primeiro argumento == 'resume') e indica
// que o currículo deve ocorrer imediatamente (não espere pelo próximo intervalo)

$ .fn.cycle = function (options, arg2) {
	var o = {s: this.selector, c: this.context};

	// em 1.3+ podemos corrigir erros com o estado pronto
	if (this.length === 0 && options! = 'stop') {
		if (! $. isReady && os) {
			log ('DOM não pronto, slideshow de enfileiramento');
			$ (function () {
				$ (os, oc) .cycle (opções, arg2);
			});
			devolva isto;
		}
		// seu DOM está pronto? http://docs.jquery.com/Tutorials:Introducing_$ (document) .ready ()
		log ('terminating; zero elementos encontrados pelo seletor' + ($ .isReady? ':' (DOM não está pronto) '));
		devolva isto;
	}

	// iterar o conjunto de nós correspondente
	return this.each (function () {
		var opts = handleArguments (isso, opções, arg2);
		if (opts === false)
			Retorna;

		opts.updateActivePagerLink = opts.updateActivePagerLink || $ .fn.cycle.updateActivePagerLink;
		
		// interrompe a apresentação de slides existente para este contêiner (se houver)
		if (this.cycleTimeout)
			clearTimeout (this.cycleTimeout);
		this.cycleTimeout = this.cyclePause = 0;
		this.cycleStop = 0; // issue # 108

		var $ cont = $ (this);
		var $ slides = opts.slideExpr? $ (opts.slideExpr, this): $ cont.children ();
		var els = $ slides.get ();

		if (els.length <2) {
			log ('terminando; muito poucos slides:' + els.length);
			Retorna;
		}

		var opts2 = buildOptions ($ cont, $ slides, els, ops, o);
		if (opts2 === falso)
			Retorna;

		var startTime = opts2.continuous? 10: getTimeout (els [opts2.currSlide], els [opts2.nextSlide], opts2,! Opts2.backwards);

		// se for uma apresentação de slides automática, inicie-a
		if (startTime) {
			startTime + = (opts2.delay || 0);
			if (startTime <10)
				startTime = 10;
			debug ('primeiro timeout:' + startTime);
			this.cycleTimeout = setTimeout (function () {ir (els, opts2,0,! opts.backwards);}, startTime);
		}
	});
};

function triggerPause (cont, byHover, onPager) {
	var opts = $ (cont) .data ('cycle.opts');
	if (! opts)
		Retorna;
	var paused = !! cont.cyclePause;
	if (pausado && opts.paused)
		opts.paused (cont, opts, byHover, onPager);
	else if (! paused && opts.resumed)
		opts.resumed (cont, opts, byHover, onPager);
}

// processa os argumentos que foram passados ​​para o plugin fn
function handleArguments (cont, opções, arg2) {
	if (cont.cycleStop === indefinido)
		cont.cycleStop = 0;
	if (options === indefinido || opções === null)
		opções = {};
	if (options.constructor == String) {
		interruptor (opções) {
		caso 'destruir':
		case 'stop':
			var opts = $ (cont) .data ('cycle.opts');
			if (! opts)
				retorna falso;
			cont.cycleStop ++; // retornos de chamada procuram por mudança
			if (cont.cycleTimeout)
				clearTimeout (cont.cycleTimeout);
			cont.cycleTimeout = 0;
			if (opts.elements)
				$ (opts.elements) .stop ();
			$ (cont) .removeData ('cycle.opts');
			if (opções == 'destruir')
				destruir (cont, opts);
			retorna falso;
		case 'toggle':
			cont.cyclePause = (cont.cyclePause === 1)? 0: 1;
			checkInstantResume (cont.cyclePause, arg2, cont);
			triggerPause (cont);
			retorna falso;
		caso 'pausa':
			cont.cyclePause = 1;
			triggerPause (cont);
			retorna falso;
		case 'resume':
			cont.cyclePause = 0;
			checkInstantResume (false, arg2, cont);
			triggerPause (cont);
			retorna falso;
		case 'prev':
		case 'next':
			opts = $ (cont) .data ('cycle.opts');
			if (! opts) {
				log ('opções não encontradas, "anterior / seguinte" ignoradas ");
				retorna falso;
			}
			if (typeof arg2 == 'string') 
				opts.oneTimeFx = arg2;
			$ .fn.cycle [opções] (opts);
			retorna falso;
		padrão:
			opções = {fx: opções};
		}
		opções de retorno;
	}
	else if (options.constructor == Number) {
		// vai para o slide solicitado
		var num = opções;
		opções = $ (cont) .data ('cycle.opts');
		if (! opções) {
			log ('opções não encontradas, não pode avançar slide');
			retorna falso;
		}
		if (num <0 || num> = options.elements.length) {
			log ('índice de slide inválido:' + num);
			retorna falso;
		}
		options.nextSlide = num;
		if (cont.cycleTimeout) {
			clearTimeout (cont.cycleTimeout);
			cont.cycleTimeout = 0;
		}
		if (typeof arg2 == 'string')
			options.oneTimeFx = arg2;
		go (options.elements, options, 1, num> = options.currSlide);
		retorna falso;
	}
	opções de retorno;
	
	function checkInstantResume (isPaused, arg2, cont) {
		if (! isPaused && arg2 === true) {// retomar agora!
			var options = $ (cont) .data ('cycle.opts');
			if (! opções) {
				log ('opções não encontradas, não podem ser retomadas');
				retorna falso;
			}
			if (cont.cycleTimeout) {
				clearTimeout (cont.cycleTimeout);
				cont.cycleTimeout = 0;
			}
			go (options.elements, options, 1,! options.backwards);
		}
	}
}

function removeFilter (el, opts) {
	if (! $. support.opacity && opts.cleartype && el.style.filter) {
		tente {el.style.removeAttribute ('filter'); }
		catch (sufocar) {} // lidar com versões antigas de ópera
	}
}

// desassociar manipuladores de eventos
função destroy (cont, opts) {
	if (opts.next)
		$ (opts.next) .unbind (opts.prevNextEvent);
	if (opts.prev)
		$ (opts.prev) .unbind (opts.prevNextEvent);
	
	if (opts.pager || opts.pagerAnchorBuilder)
		$ .each (opts.pagerAnchors || [], function () {
			this.unbind (). remove ();
		});
	opts.pagerAnchors = null;
	$ (cont) .unbind ('mouseenter.cycle mouseleave.cycle');
	if (opts.destroy) // retorno de chamada
		opts.destroy (opts);
}

// inicialização única
function buildOptions ($ cont, $ slides, els, opções, o) {
	var startingSlideSpecified;
	// suporta o plugin de metadados (v1.0 e v2.0)
	var opts = $ .extend ({}, $ .fn.cycle.defaults, opções || {}, $ .metadata? $ cont.metadata (): $ .meta? $ cont.data (): {});
	var meta = $ .isFunction ($ cont.data)? $ cont.data (opts.metaAttr): null;
	se (meta)
		opts = $ .extend (opts, meta);
	if (opts.autostop)
		opts.countdown = opts.autostopCount || els.length;

	var cont = $ cont [0];
	$ cont.data ('cycle.opts', opts);
	opts. $ cont = $ cont;
	opts.stopCount = cont.cycleStop;
	opts.elements = els;
	opts.before = opts.before? [opts.before]: [];
	opts.after = opts.after? [opts.after]: [];

	// push some after callbacks
	if (! $. support.opacity && opts.cleartype)
		opts.after.push (function () {removeFilter (isso, opts);});
	if (opts.continuous)
		opts.after.push (function () {ir (els, opts, 0,! opts.backwards);});

	saveOriginalOpts (opts);

	// clearType correções
	if (! $. support.opacity && opts.cleartype &&! opts.cleartypeNoBg)
		clearTypeFix ($ slides);

	// container requer uma posição não estática para que os slides possam ser posicionados
	if ($ cont.css ('position') == 'static')
		$ cont.css ('position', 'relative');
	if (opts.width)
		$ cont.width (opts.width);
	if (opts.height && opts.height! = 'auto')
		$ cont.height (opts.height);

	if (opts.startingSlide! == não definido) {
		opts.startingSlide = parseInt (opts.startingSlide, 10);
		if (opts.startingSlide> = els.length || opts.startSlide <0)
			opts.startingSlide = 0; // capturar entrada falsa
		outro 
			startingSlideSpecified = true;
	}
	else if (opts.backwards)
		opts.startingSlide = els.length - 1;
	outro
		opts.startingSlide = 0;

	// se aleatório, misture o array de slides
	if (opts.random) {
		opts.randomMap = [];
		para (var i = 0; i <els.length; i ++)
			opts.randomMap.push (i);
		opts.randomMap.sort (function (a, b) {retornar Math.random () - 0.5;});
		if (startingSlideSpecified) {
			// tente encontrar o slide inicial especificado e, se encontrado, inicie o índice do slide no mapa de acordo
			para (var cnt = 0; cnt <els.length; cnt ++) {
				if (opts.startingSlide == opts.randomMap [cnt]) {
					opts.randomIndex = cnt;
				}
			}
		}
		outro {
			opts.randomIndex = 1;
			opts.startingSlide = opts.randomMap [1];
		}
	}
	else if (opts.startingSlide> = els.length)
		opts.startingSlide = 0; // capturar entrada falsa
	opts.currSlide = opts.startingSlide || 0;
	var first = opts.startingSlide;

	// define posição e zIndex em todos os slides
	$ slides.css ({position: 'absolute', top: 0, left: 0}). hide (). each (função (i) {
		var z;
		if (opts.backwards)
			z = primeiro? eu <= primeiro? els.length + (i-primeiro): primeiro-i: els.length-i;
		outro
			z = primeiro? i> = primeiro? els.length - (i-primeiro): primeiro-i: els.length-i;
		$ (this) .css ('z-index', z);
	});

	// verifique se o primeiro slide está visível
	$ (els [primeiro]). css ('opacidade', 1) .show (); // bit de opacidade necessário para lidar com o caso de uso de reinicialização
	removeFilter (els [primeiro], opts);

	// esticar slides
	if (opts.fit) {
		if (! opts.aspect) {
	        if (opts.width)
	            $ slides.width (opts.width);
	        if (opts.height && opts.height! = 'auto')
	            $ slides.height (opts.height);
		} outro {
			$ slides.each (function () {
				var $ slide = $ (isso);
				var ratio = (opts.aspect === true)? $ slide.width () / $ slide.height (): opts.aspect;
				if (opts.width && $ slide.width ()! = opts.width) {
					$ slide.width (opts.width);
					$ slide.height (opts.width / ratio);
				}

				if (opts.height && $ slide.height () <opts.height) {
					$ slide.height (opts.height);
					$ slide.width (razão opts.height *);
				}
			});
		}
	}

	if (opts.center && ((! opts.fit) || opts.aspect)) {
		$ slides.each (function () {
			var $ slide = $ (isso);
			$ slide.css ({
				"margin-left": opts.width?
					((opts.width - $ slide.width ()) / 2) + "px":
					0,
				"margin-top": opts.height?
					((opts.height - $ slide.height ()) / 2) + "px":
					0
			});
		});
	}

	if (opts.center &&! opts.fit &&! opts.slideResize) {
		$ slides.each (function () {
			var $ slide = $ (isso);
			$ slide.css ({
				"margin-left": opts.width? ((opts.width - $ slide.width ()) / 2) + "px": 0,
				"margin-top": opts.height? ((opts.height - $ slide.height ()) / 2) + "px": 0
			});
		});
	}
		
	// esticar o contêiner
	var reshape = (opts.containerResize || opts.containerResizeHeight) && $ cont.innerHeight () <1;
	if (reshape) {// faça isso apenas se o container não tiver tamanho http://tinyurl.com/da2oa9
		var maxw = 0, maxh = 0;
		para (var j = 0; j <els.length; j ++) {
			var $ e = $ (els [j]), e = $ e [0], w = $ e.outerWidth (), h = $ e.outerHeight ();
			if (! w) w = e.offsetWidth || e.width || $ e.attr ('largura');
			if (! h) h = e.offsetHeight || e.height || $ e.attr ('altura');
			maxw = w> maxw? w: maxw;
			maxh = h> maxh? h: maxh;
		}
		if (opts.containerResize && maxw> 0 && maxh> 0)
			$ cont.css ({width: maxw + 'px', altura: maxh + 'px'});
		if (opts.containerResizeHeight && maxh> 0)
			$ cont.css ({height: maxh + 'px'});
	}

	var pauseFlag = false; // https://github.com/malsup/cycle/issues/44
	if (opts.pause)
		$ cont.bind ('mouseenter.cycle', function () {
			pauseFlag = true;
			this.cyclePause ++;
			triggerPause (cont, true);
		}) bind ('mouseleave.cycle', function () {
				if (pauseFlag)
					this.cyclePause--;
				triggerPause (cont, true);
		});

	if (supportMultiTransitions (opts) === falso)
		retorna falso;

	// aparentemente muitas pessoas usam slideshows de imagens sem atributos height / width nas imagens.
	// O ciclo 2.50 + exige as informações de tamanho para cada slide; este bloco tenta lidar com isso.
	var requeue = false;
	options.requeueAttempts = options.requeueAttempts || 0;
	$ slides.each (function () {
		// tenta obter altura / largura de cada slide
		var $ el = $ (this);
		this.cycleH = (opts.fit && opts.height)? opts.height: ($ el.height () || this.offsetHeight || this.height || $ el.attr ('altura') || 0);
		this.cycleW = (opts.fit && opts.width)? opts.width: ($ el.width () || this.offsetWidth || this.width || $ el.attr ('largura') || 0);

		if ($ el.is ('img')) {
			var loading = (this.cycleH === 0 && this.cycleW === 0 &&! this.complete);
			// não requeue para imagens que ainda estão sendo carregadas, mas têm um tamanho válido
			if (loading) {
				if (os && opts.requeueOnImageNotLoaded && ++ options.requeueAttempts <100) {// controla a contagem de novas tentativas para que não fiquemos em loop para sempre
					log (options.requeueAttempts, '- img slide não carregado, reesuing slideshow:', this.src, this.cycleW, this.cycleH);
					setTimeout (function () {$ (os, oc) .cycle (opções);}, opts.requeueTimeout);
					requeue = true;
					retorna falso; // quebra cada loop
				}
				outro {
					log ('não foi possível determinar o tamanho da imagem:' + this.src, this.cycleW, this.cycleH);
				}
			}
		}
		retorno verdadeiro;
	});

	se (requeue)
		retorna falso;

	opts.cssBefore = opts.cssBefore || {};
	opts.cssAfter = opts.cssAfter || {};
	opts.cssFirst = opts.cssFirst || {};
	opts.animIn = opts.animIn || {};
	opts.animOut = opts.animOut || {};

	$ slides.not (': eq (' + primeiro + ')'). css (opts.cssBefore);
	$ ($ slides [primeiro]). css (opts.cssFirst);

	if (opts.timeout) {
		opts.timeout = parseInt (opts.timeout, 10);
		// garantir que as configurações de tempo limite e velocidade sejam normais
		if (opts.speed.constructor == String)
			opts.speed = $ .fx.speeds [opts.speed] || parseInt (opts.speed, 10);
		if (! opts.sync)
			opts.speed = opts.speed / 2;
		
		var buffer = opts.fx == 'nenhum'? 0: opts.fx == 'shuffle'? 500: 250;
		while ((opts.timeout - opts.speed) <buffer) // limpe o tempo limite
			opts.timeout + = opts.speed;
	}
	if (opts.easing)
		opts.easeIn = opts.easeOut = opts.easing;
	if (! opts.speedIn)
		opts.speedIn = opts.speed;
	if (! opts.speedOut)
		opts.speedOut = opts.speed;

	opts.slideCount = els.length;
	opts.currSlide = opts.lastSlide = primeiro;
	if (opts.random) {
		if (++ opts.randomIndex == els.length)
			opts.randomIndex = 0;
		opts.nextSlide = opts.randomMap [opts.randomIndex];
	}
	else if (opts.backwards)
		opts.nextSlide = opts.startingSlide === 0? (els.length-1): opts.startingSlide-1;
	outro
		opts.nextSlide = opts.startingSlide> = (els.length-1)? 0: opts.startingSlide + 1;

	// executa o init de transição fn
	if (! opts.multiFx) {
		var init = $ .fn.cycle.transitions [opts.fx];
		if ($ .isFunction (init))
			init ($ cont, $ slides, opts);
		else if (opts.fx! = 'custom' &&! opts.multiFx) {
			log ('transição desconhecida:' + opts.fx ', slideshow terminating');
			retorna falso;
		}
	}

	// incendeia eventos artificiais
	var e0 = $ slides [primeiro];
	if (! opts.skipInitializationCallbacks) {
		if (opts.before.length)
			opts.before [0] .apply (e0, [e0, e0, opts, true]);
		if (opts.after.length)
			opts.after [0] .apply (e0, [e0, e0, opts, true]);
	}
	if (opts.next)
		$ (opts.next) .bind (opts.prevNextEvent, function () {retorno antecipado (opts, 1);});
	if (opts.prev)
		$ (opts.prev) .bind (opts.prevNextEvent, function () {retornar avanço (opts, 0);});
	if (opts.pager || opts.pagerAnchorBuilder)
		buildPager (els, opts);

	exposeAddSlide (opts, els);

	return opts;
}

// salvar opts originais para que possamos restaurar após o estado de limpeza
function saveOriginalOpt (opts) {
	opts.original = {antes: [], depois de: []};
	opts.original.cssBefore = $ .extend ({}, opts.cssBefore);
	opts.original.cssAfter = $ .extend ({}, opts.cssAfter);
	opts.original.animIn = $ .extend ({}, opts.animIn);
	opts.original.animOut = $ .extend ({}, opts.animOut);
	$ .each (opts.before, function () {opts.original.before.push (this);});
	$ .each (opts.after, function () {opts.original.after.push (this);});
}

function supportMultiTransitions (opts) {
	var i, tx, txs = $ .fn.cycle.transitions;
	// procura por vários efeitos
	if (opts.fx.indexOf (',')> 0) {
		opts.multiFx = true;
		opts.fxs = opts.fx.replace (/ \ s * / g, ''). split (',');
		// descarta nomes de efeitos falsos
		para (i = 0; i <opts.fxs.length; i ++) {
			var fx = opts.fxs [i];
			tx = txs [fx];
			if (! tx ||! txs.hasOwnProperty (fx) ||! $. isFunction (tx)) {
				log ('descartando a transição desconhecida:', fx);
				opts.fxs.splice (i, 1);
				Eu--;
			}
		}
		// se temos uma lista vazia, então jogamos tudo fora!
		if (! opts.fxs.length) {
			log ('Nenhuma transição válida chamada; slideshow terminating.');
			retorna falso;
		}
	}
	else if (opts.fx == 'all') {// gera automaticamente a lista de transições
		opts.multiFx = true;
		opts.fxs = [];
		para (var p in txs) {
			if (txs.hasOwnProperty (p)) {
				tx = txs [p];
				if (txs.hasOwnProperty (p) && $ .isFunction (tx))
					opts.fxs.push (p);
			}
		}
	}
	if (opts.multiFx && opts.randomizeEffects) {
		// munge a matriz de fxs para fazer a seleção de efeito aleatória
		var r1 = Math.floor (Math.random () * 20) + 30;
		para (i = 0; i <r1; i ++) {
			var r2 = Math.floor (Math.random () * opts.fxs.length);
			opts.fxs.push (opts.fxs.splice (r2,1) [0]);
		}
		debug ('seqüência fx randomizada:', opts.fxs);
	}
	retorno verdadeiro;
}

// fornece um mecanismo para adicionar slides após o início da apresentação de slides
function exposeAddSlide (opts, els) {
	opts.addSlide = function (newSlide, prepend) {
		var $ s = $ (newSlide), s = $ s [0];
		if (! opts.autostopCount)
			opts.countdown ++;
		els [prepend? 'unshift': 'push'] (s);
		if (opts.els)
			opts.els [prepend? 'unshift': 'push'] (s); // shuffle precisa disso
		opts.slideCount = els.length;

		// adiciona o slide ao mapa aleatório e recorre
		if (opts.random) {
			opts.randomMap.push (opts.slideCount-1);
			opts.randomMap.sort (function (a, b) {retornar Math.random () - 0.5;});
		}

		$ s.css ('position', 'absolute');
		$ s [prefixar 'prependTo': 'appendTo'] (opts. $ cont);

		if (prepend) {
			opts.currSlide ++;
			opts.nextSlide ++;
		}

		if (! $. support.opacity && opts.cleartype &&! opts.cleartypeNoBg)
			clearTypeFix ($ s);

		if (opts.fit && opts.width)
			$ s.width (opts.width);
		if (opts.fit && opts.height && opts.height! = 'auto')
			$ s.height (opts.height);
		s.cycleH = (opts.fit && opts.height)? opts.height: $ s.height ();
		s.cycleW = (opts.fit && opts.width)? opts.width: $ s.width ();

		$ s.css (opts.cssBefore);

		if (opts.pager || opts.pagerAnchorBuilder)
			$ .fn.cycle.createPagerAnchor (els.length-1, s, $ (opts.pager), els, opts);

		if ($ .isFunction (opts.onAddSlide))
			opts.onAddSlide ($ s);
		outro
			$ s.hide (); // comportamento padrão
	};
}

// redefinir estado interno; fazemos isso em cada passagem para suportar múltiplos efeitos
$ .fn.cycle.resetState = function (opts, fx) {
	fx = fx || opts.fx;
	opts.before = []; opts.after = [];
	opts.cssBefore = $ .extend ({}, opts.original.cssBefore);
	opts.cssAfter = $ .extend ({}, opts.original.cssAfter);
	opts.animIn = $ .extend ({}, opts.original.animIn);
	opts.animOut = $ .extend ({}, opts.original.animOut);
	opts.fxFn = null;
	$ .each (opts.original.before, function () {opts.before.push (this);});
	$ .each (opts.original.after, function () {opts.after.push (this);});

	// re-init
	var init = $ .fn.cycle.transitions [fx];
	if ($ .isFunction (init))
		init (opts. $ cont, $ (opts.elements), opts);
};

// este é o mecanismo principal fn, ele manipula os tempos limite, callbacks e índice de slide mgmt
function go (els, opts, manual, fwd) {
	var p = opts. $ cont [0], curr = els [opts.currSlide], próximo = els [opts.nextSlide];

	// opts.busy é verdade se estivermos no meio de uma animação
	if (manual && opts.busy && opts.manualTrump) {
		// permite que as solicitações de transições manuais superem as ativas
		debug ('manualTrump em go (), parando a transição ativa');
		$ (els) .stop (true, true);
		opts.busy = 0;
		clearTimeout (p.cycleTimeout);
	}

	// não inicie outra transição baseada em tempo limite se houver um ativo
	if (opts.busy) {
		debug ('transição ativa, ignorando nova solicitação tx');
		Retorna;
	}


	// pare de pedalar se tivermos uma solicitação de parada pendente
	if (p.cycleStop! = opts.stopCount || p.cycleTimeout === 0 &&! manual)
		Retorna;

	// verifique se devemos parar de andar de bicicleta com base nas opções de autostop
	if (! manual &&! p.cyclePause &&! opts.bounce &&
		((opts.autostop && (--opts.countdown <= 0)) ||
		(opts.nowrap &&! opts.random && opts.nextSlide <opts.currSlide))) {
		if (opts.end)
			opts.end (opts);
		Retorna;
	}

	// se a apresentação de slides estiver pausada, somente a transição em um acionador manual
	var changed = false;
	if ((manual ||! p.cyclePause) && (opts.nextSlide! = opts.currSlide)) {
		changed = true;
		var fx = opts.fx;
		// continue tentando obter o tamanho do slide se ainda não tivermos
		curr.cycleH = curr.cycleH || $ (curr) .height ();
		curr.cycleW = curr.cycleW || $ (curr) .width ();
		next.cycleH = next.cycleH || $ (próximo) .height ();
		next.cycleW = next.cycleW || $ (próximo) .width ();

		// suporta vários tipos de transição
		if (opts.multiFx) {
			if (fwd && (opts.lastFx === indefinido || ++ opts.lastFx> = opts.fxs.length))
				opts.lastFx = 0;
			else if (! fwd && (opts.lastFx === undefined || --opts.lastFx <0))
				opts.lastFx = opts.fxs.length - 1;
			fx = opts.fxs [opts.lastFx];
		}

		// one-time fx overrides aplica-se a: $ ('div'). cycle (3, 'zoom');
		if (opts.oneTimeFx) {
			fx = opts.oneTimeFx;
			opts.oneTimeFx = null;
		}

		$ .fn.cycle.resetState (opts, fx);

		// executa o antes dos retornos de chamada
		if (opts.before.length)
			$ .each (opts.before, function (i, o) {
				if (p.cycleStop! = opts.stopCount) retorna;
				o.apply (next, [curr, next, opts, fwd]);
			});

		// encenar o após callacks
		var after = function () {
			opts.busy = 0;
			$ .each (opts.after, function (i, o) {
				if (p.cycleStop! = opts.stopCount) retorna;
				o.apply (next, [curr, next, opts, fwd]);
			});
			if (! p.cycleStop) {
				// fila na próxima transição
				queueNext ();
			}
		};

		debug ('tx disparo (' + fx + '); currSlide:' + opts.currSlide + '; nextSlide:' + opts.nextSlide);
		
		// prepare-se para realizar a transição
		opts.busy = 1;
		if (opts.fxFn) // função fx fornecida?
			opts.fxFn (curr, next, opts, depois, fwd, manual && opts.fastOnEvent);
		mais if ($ .isFunction ($. fn.cycle [opts.fx])) // plugin fx?
			$ .fn.cycle [opts.fx] (curr, next, opts, depois, fwd, manual && opts.fastOnEvent);
		outro
			$ .fn.cycle.custom (curr, next, opts, depois, fwd, manual && opts.fastOnEvent);
	}
	outro {
		queueNext ();
	}

	if (alterado || opts.nextSlide == opts.currSlide) {
		// calcula o próximo slide
		var roll;
		opts.lastSlide = opts.currSlide;
		if (opts.random) {
			opts.currSlide = opts.nextSlide;
			if (++ opts.randomIndex == els.length) {
				opts.randomIndex = 0;
				opts.randomMap.sort (function (a, b) {retornar Math.random () - 0.5;});
			}
			opts.nextSlide = opts.randomMap [opts.randomIndex];
			if (opts.nextSlide == opts.currSlide)
				opts.nextSlide = (opts.currSlide == opts.slideCount - 1)? 0: opts.currSlide + 1;
		}
		else if (opts.backwards) {
			roll = (opts.nextSlide - 1) <0;
			if (roll && opts.bounce) {
				opts.backwards =! opts.backwards;
				opts.nextSlide = 1;
				opts.currSlide = 0;
			}
			outro {
				opts.nextSlide = rolar? (els.length-1): opts.nextSlide-1;
				opts.currSlide = roll? 0: opts.nextSlide + 1;
			}
		}
		else {// sequência
			roll = (opts.nextSlide + 1) == els.length;
			if (roll && opts.bounce) {
				opts.backwards =! opts.backwards;
				opts.nextSlide = els.length-2;
				opts.currSlide = els.length-1;
			}
			outro {
				opts.nextSlide = rolar? 0: opts.nextSlide + 1;
				opts.currSlide = roll? els.length-1: opts.nextSlide-1;
			}
		}
	}
	if (alterado && opts.pager)
		opts.updateActivePagerLink (opts.pager, opts.currSlide, opts.activePagerClass);
	
	function queueNext () {
		// encenar a próxima transição
		var ms = 0, tempo limite = opts.timeout;
		if (opts.timeout &&! opts.continuous) {
			ms = getTimeout (els [opts.currSlide], els [opts.nextSlide], opts, fwd);
         if (opts.fx == 'shuffle')
            ms - = opts.speedOut;
      }
		else if (opts.continuous && p.cyclePause) // contínua mostra o trabalho de um callback posterior, não esta lógica do timer
			ms = 10;
		if (ms> 0)
			p.cycleTimeout = setTimeout (function () {ir (els, opts, 0,! opts.backwards);}, ms);
	}
}

// invocado após a transição
$ .fn.cycle.updateActivePagerLink = função (pager, currSlide, clsName) {
   $ (pager) .each (function () {
       $ (this) .children (). removeClass (clsName) .eq (currSlide) .addClass (clsName);
   });
};

// calcula o valor do tempo limite para a transição atual
função getTimeout (curr, next, opts, fwd) {
	if (opts.timeoutFn) {
		// chama o usuário fornecido calc fn
		var t = opts.timeoutFn.call (curr, curr, próximo, opts, fwd);
		while (opts.fx! = 'nenhum' && (t - opts.speed) <250) // sanitize o tempo limite
			t + = opts.speed;
		debug ('timeout calculado:' + t + '; velocidade:' + opts.speed);
		if (t! == falso)
			return t;
	}
	return opts.timeout;
}

// expõe a função next / prev, o chamador deve passar no estado
$ .fn.cycle.next = função (opts) {advance (opts, 1); };
$ .fn.cycle.prev = função (opts) {advance (opts, 0);};

// avançar deslizar para frente ou para trás
função advance (opts, moveForward) {
	var val = moveForward? 1: -1;
	var els = opts.elements;
	var p = opts. $ cont [0], timeout = p.cycleTimeout;
	if (timeout) {
		clearTimeout (tempo limite);
		p.cycleTimeout = 0;
	}
	if (opts.random && val <0) {
		// voltar para o slide de exibição anterior
		opts.randomIndex--;
		if (--opts.randomIndex == -2)
			opts.randomIndex = els.length-2;
		else if (opts.randomIndex == -1)
			opts.randomIndex = els.length-1;
		opts.nextSlide = opts.randomMap [opts.randomIndex];
	}
	else if (opts.random) {
		opts.nextSlide = opts.randomMap [opts.randomIndex];
	}
	outro {
		opts.nextSlide = opts.currSlide + val;
		if (opts.nextSlide <0) {
			if (opts.nowrap) retorna falso;
			opts.nextSlide = els.length - 1;
		}
		else if (opts.nextSlide> = els.length) {
			if (opts.nowrap) retorna falso;
			opts.nextSlide = 0;
		}
	}

	var cb = opts.onPrevNextEvent || opts.prevNextClick; // prevNextClick está obsoleto
	if ($ .isFunction (cb))
		cb (val> 0, opts.nextSlide, els [opts.nextSlide]);
	vai (els, opts, 1, moveForward);
	retorna falso;
}

function buildPager (els, opts) {
	var $ p = $ (opts.pager);
	$ .each (els, função (i, o) {
		$ .fn.cycle.createPagerAnchor (i, o, $ p, els, opts);
	});
	opts.updateActivePagerLink (opts.pager, opts.startingSlide, opts.activePagerClass);
}

$ .fn.cycle.createPagerAnchor = função (i, el, $ p, els, opts) {
	var a;
	if ($ .isFunction (opts.pagerAnchorBuilder)) {
		a = opts.pagerAnchorBuilder (i, el);
		debug ('pagerAnchorBuilder (' + i + ', el) retornado:' + a);
	}
	outro
		a = '<a href="#">' + (i + 1) + '</a>';
		
	se um)
		Retorna;
	var $ a = $ (a);
	// não repara se a âncora está no dom
	if ($ a.parents ('body'). length === 0) {
		var arr = [];
		if ($ p.length> 1) {
			$ p.each (function () {
				var $ clone = $ a.clone (true);
				$ (this) .append ($ clone);
				arr.push ($ clone [0]);
			});
			$ a = $ (arr);
		}
		outro {
			$ a.appendTo ($ p);
		}
	}

	opts.pagerAnchors = opts.pagerAnchors || [];
	opts.pagerAnchors.push ($ a);
	
	var pagerFn = function (e) {
		e.preventDefault ();
		opts.nextSlide = i;
		var p = opts. $ cont [0], timeout = p.cycleTimeout;
		if (timeout) {
			clearTimeout (tempo limite);
			p.cycleTimeout = 0;
		}
		var cb = opts.onPagerEvent || opts.pagerClick; // pagerClick está obsoleto
		if ($ .isFunction (cb))
			cb (opts.nextSlide, els [opts.nextSlide]);
		go (els, opts, 1, opts.currSlide <i); // acionar o trans
// retorna falso; // <== permitir bolha
	};
	
	if (/mouseenter|mouseover/i.test(opts.pagerEvent)) {
		$ a.hover (pagerFn, function () {/ * no-op * /});
	}
	outro {
		$ a.bind (opts.pagerEvent, pagerFn);
	}
	
	if (! /^click/.test(opts.pagerEvent) &&! opts.allowPagerClickBubble)
		$ a.bind ('click.cycle', function () {return false;}); // suprimir clique
	
	var cont = opts $ cont [0];
	var pauseFlag = false; // https://github.com/malsup/cycle/issues/44
	if (opts.pauseOnPagerHover) {
		$ a.hover (
			function () { 
				pauseFlag = true;
				cont.cyclePause ++; 
				triggerPause (cont, true, true);
			}, function () { 
				if (pauseFlag)
					cont.cyclePause--; 
				triggerPause (cont, true, true);
			} 
		);
	}
};

// helper fn para calcular o número de slides entre o atual e o próximo
$ .fn.cycle.hopsFromLast = function (opts, fwd) {
	var hops, l = opts.lastSlide, c = opts.currSlide;
	if (fwd)
		lúpulo = c> l? c - l: opts.slideCount - l;
	outro
		lúpulo = c <l? l - c: l + opts.slideCount - c;
	retornar o lúpulo;
};

// corrige problemas clearType no ie6 definindo uma cor bg explícita
// (caso contrário, os slides de texto ficarão horríveis durante uma transição de fade)
função clearTypeFix ($ slides) {
	debug ('aplicar clearType background-color hack');
	função hex (s) {
		s = parseInt (s, 10) .toString (16);
		return s.length <2? '0' + s: s;
	}
	function getBg (e) {
		para (; e && e.nodeName.toLowerCase ()! = 'html'; e = e.parentNode) {
			var v = $ .css (e, 'cor de fundo');
			if (v && v.indexOf ('rgb')> = 0) {
				var rgb = v.match (/ \ d + / g);
				return '#' + hex (rgb [0]) + hex (rgb [1]) + hex (rgb [2]);
			}
			if (v && v! = 'transparente')
				return v;
		}
		return '#ffffff';
	}
	$ slides.each (function () {$ (this) .css ('cor de fundo', getBg (isto));});
}

// redefinir adereços comuns antes da próxima transição
$ .fn.cycle.commonReset = função (curr, next, opts, w, h, rev) {
	$ (opts.elements) .not (curr) .hide ();
	if (tipoof opts.cssBefore.opacity == 'indefinido')
		opts.cssBefore.opacity = 1;
	opts.cssBefore.display = 'bloquear';
	if (opts.slideResize && w! == false && next.cycleW> 0)
		opts.cssBefore.width = next.cycleW;
	if (opts.slideResize && h! == false && next.cycleH> 0)
		opts.cssBefore.height = next.cycleH;
	opts.cssAfter = opts.cssAfter || {};
	opts.cssAfter.display = 'nenhum';
	$ (curr) .css ('zIndex', opts.slideCount + (rev === verdadeiro? 1: 0));
	$ (próximo) .css ('zIndex', opts.slideCount + (rev === true? 0: 1));
};

// o fn real para efetuar uma transição
$ .fn.cycle.custom = function (curr, next, opta, cb, fwd, speedOverride) {
	var $ l = $ (curr), $ n = $ (próximo);
	var speedIn = opts.speedIn, speedOut = opts.speedOut, easeIn = opts.easeIn, easeOut = opts.easeOut, animInDelay = opts.animInDelay, animOutDelay = opts.animOutDelay;
	$ n.css (opts.cssBefore);
	if (speedOverride) {
		if (typeof speedOverride == 'number')
			speedIn = speedOut = speedOverride;
		outro
			speedIn = speedOut = 1;
		easeIn = easeOut = nulo;
	}
	var fn = function () {
		$ n.delay (animInDelay) .animate (opts.animIn, speedIn, easeIn, função () {
			cb ();
		});
	};
	$ l.delay (animOutDelay) .animate (opts.animOut, speedOut, easeOut, function () {
		$ l.css (opts.cssAfter);
		if (! opts.sync) 
			fn ();
	});
	if (opts.sync) fn ();
};

// definições de transição - somente o fade é definido aqui, o pacote de transição define o resto
$ .fn.cycle.transitions = {
	fade: function ($ cont, $ slides, opts) {
		$ slides.not (': eq (' + opts.currSlide + ')'). css ('opacidade', 0);
		opts.before.push (function (curr, next, opts) {
			$ .fn.cycle.commonReset (curr, next, opts);
			opts.cssBefore.opacity = 0;
		});
		opts.animIn = {opacidade: 1};
		opts.animOut = {opacidade: 0};
		opts.cssBefore = {top: 0, esquerda: 0};
	}
};

$ .fn.cycle.ver = function () {return ver; };

// substitui estes globalmente se você gostar (eles são todos opcionais)
$ .fn.cycle.defaults = {
    activePagerClass: 'activeSlide', // nome da classe usado para o link do pager ativo
    after: null, // callback de transição (escopo definido para o elemento que foi mostrado): function (currSlideElement, nextSlideElement, options, forwardFlag)
    allowPagerClickBubble: false, // permite ou impede que o evento click em âncoras de pager borbulhe
    animIn: null, // propriedades que definem como o slide anima
    animInDelay: 0, // permite atraso antes das transições do próximo slide	
    animOut: null, // propriedades que definem como o slide é animado
    animOutDelay: 0, // permite atraso antes que as transições de slide atuais saiam
    aspect: false, // preserva a proporção durante o ajuste de redimensionamento, corte se necessário (deve ser usado com opção de ajuste)
    autostop: 0, // true para finalizar a apresentação de slides após X transições (em que X = = contagem de slides)
    autostopCount: 0, // número de transições (opcionalmente usado com autostop para definir X)
    backwards: false, // true para iniciar a apresentação de slides no último slide e voltar para trás na pilha
    before: null, // callback de transição (escopo definido para o elemento a ser mostrado): function (currSlideElement, nextSlideElement, options, forwardFlag)
    centro: null, // definido como verdadeiro para ter ciclo adicionar margem superior / esquerda a cada slide (use com opções de largura e altura)
    cleartype:! $. support.opacity, // true se correções clearType devem ser aplicadas (para IE)
    cleartypeNoBg: false, // configurado como true para desabilitar a correção de cleartype extra (deixe false para forçar a configuração da cor de fundo nos slides)
    containerResize: 1, // redimensionar contêiner para caber no maior slide
    containerResizeHeight: 0, // redimensiona a altura dos contêineres para caber no maior slide, mas deixa a largura dinâmica
    contínua: 0, // true para iniciar a próxima transição imediatamente após a conclusão da atual
    cssAfter: null, // propriedades que definiram o estado do slide após a transição
    cssBefore: null, // propriedades que definem o estado inicial do slide antes da transição no
    delay: 0, // delay adicional (em ms) para a primeira transição (dica: pode ser negativo)
    easeIn: null, // easing para transição "in"
    easeOut: null, // easing para transição "out"
    easing: null, // easing method para as transições in e out
    end: null, // callback invocado quando o slideshow termina (use com opções autostop ou nowrap): function (options)
    fastOnEvent: 0, // força as transições rápidas quando acionadas manualmente (via pager ou prev / next); valor == tempo em ms
    fit: 0, // forçar slides para encaixar o contêiner
    fx: 'fade', // nome do efeito de transição (ou nomes separados por vírgulas, ex: 'fade, scrollUp, shuffle')
    fxFn: null, // função usada para controlar a transição: function (currSlideElement, nextSlideElement, options, afterCalback, forwardFlag)
    height: 'auto', // height do contêiner (se a opção 'fit' for true, os slides também serão configurados para essa altura)
    manualTrump: true, // faz com que a transição manual pare uma transição ativa em vez de ser ignorada
    metaAttr: 'cycle', // data-attribute que contém os dados da opção para o slideshow
    next: null, // element, objeto jQuery ou string do seletor jQuery para o elemento a ser usado como acionador de evento para o próximo slide
    nowrap: 0, // true para evitar que a apresentação de slides seja envolvida
    onPagerEvent: null, // callback fn para eventos de pager: function (zeroBasedSlideIndex, slideElement)
    onPrevNextEvent: null, // callback fn para eventos anteriores / seguintes: function (isNext, zeroBasedSlideIndex, slideElement)
    pager: null, // element, objeto jQuery ou string do seletor jQuery para o elemento usar como contêiner de pager
    pagerAnchorBuilder: null, // callback fn para construir links de âncora: function (index, DOMelement)
    pagerEvent: 'click.cycle', // nome do evento que direciona a navegação do pager
    pausa: 0, // true para ativar a "pausa no hover"
    pauseOnPagerHover: 0, // true para pausar ao passar o mouse sobre o link do pager
    prev: null, // element, objeto jQuery ou string do seletor jQuery para o elemento usar como acionador de evento para o slide anterior
    prevNextEvent: 'click.cycle', // evento que direciona a transição manual para o slide anterior ou seguinte
    random: 0, // true para random, false para sequence (não aplicável a shuffle fx)
    randomizeEffects: 1, // válido quando múltiplos efeitos são usados; verdade para fazer a seqüência de efeitos aleatórios
    requeueOnImageNotLoaded: true, // requeue a apresentação de slides se algum slide da imagem ainda não estiver carregado
    requeueTimeout: 250, // ms de atraso para reemissão
    rev: 0, // faz com que as animações façam a transição inversa (para efeitos que suportam, como scrollHorz / scrollVert / shuffle)
    shuffle: null, // coords para animação aleatória, ex: {top: 15, left: 200}
    skipInitializationCallbacks: false, // configurado como true para desativar o primeiro antes / depois do retorno de chamada que ocorre antes de qualquer transição
    slideExpr: null, // expressão para selecionar slides (se algo diferente de todas as crianças for necessário)
    slideResize: 1, // forçar largura / altura do slide para tamanho fixo antes de cada transição
    velocidade: 1000, // velocidade da transição (qualquer valor de velocidade fx válido)
    speedIn: null, // velocidade da transição 'in'
    speedOut: null, // velocidade da transição 'out'
    startingSlide: indefinido, // índice baseado em zero do primeiro slide a ser exibido
    sync: 1, // true se as transições de entrada / saída ocorrerem simultaneamente
    tempo limite: 4000, // milissegundos entre transições de slides (0 para desabilitar o avanço automático)
    timeoutFn: null, // callback para determinar o valor do tempo limite por slide: function (currSlideElement, nextSlideElement, options, forwardFlag)
    updateActivePagerLink: null, // callback fn invocado para atualizar o link do pager ativo (adiciona / remove o estilo activePagerClass)
    width: null // largura do container (se a opção 'fit' for true, os slides serão configurados para essa largura também)
};

}) (jQuery);


/ *!
 * jQuery Cycle Plugin Transition Definitions
 * Este script é um plugin para o jQuery Cycle Plugin
 * Exemplos e documentação em: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Versão: 2.73
 * Dupla licenciada sob as licenças MIT e GPL:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * /
(função ($) {
"use strict";

//
// Essas funções definem a inicialização do slide e as propriedades para o nome
// transições Para salvar o tamanho do arquivo, sinta-se à vontade para remover qualquer um desses
// não precisa.
//
$ .fn.cycle.transitions.none = função ($ cont, $ slides, opts) {
	opts.fxFn = function (curr, next, opts, after) {
		$ (próximo) .show ();
		$ (curr) .hide ();
		depois de();
	};
};

// não é um cross-fade, o fadeout apenas desaparece no slide superior
$ .fn.cycle.transitions.fadeout = função ($ cont, $ slides, opts) {
	$ slides.not (': eq (' + opts.currSlide + ')'). css ({display: 'bloco', 'opacidade': 1});
	opts.before.push (função (curr, next, opts, w, h, rev) {
		$ (curr) .css ('zIndex', opts.slideCount + (rev! == verdadeiro? 1: 0));
		$ (next) .css ('zIndex', opts.slideCount + (rev! == verdadeiro? 0: 1));
	});
	opts.animIn.opacity = 1;
	opts.animOut.opacity = 0;
	opts.cssBefore.opacity = 1;
	opts.cssBefore.display = 'bloquear';
	opts.cssAfter.zIndex = 0;
};

// scrollUp / Down / Esquerda / Direita
$ .fn.cycle.transitions.scrollUp = function ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto');
	opts.before.push ($. fn.cycle.commonReset);
	var h = $ cont.height ();
	opts.cssBefore.top = h;
	opts.cssBefore.left = 0;
	opts.cssFirst.top = 0;
	opts.animIn.top = 0;
	opts.animOut.top = -h;
};
$ .fn.cycle.transitions.scrollDown = função ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto');
	opts.before.push ($. fn.cycle.commonReset);
	var h = $ cont.height ();
	opts.cssFirst.top = 0;
	opts.cssBefore.top = -h;
	opts.cssBefore.left = 0;
	opts.animIn.top = 0;
	opts.animOut.top = h;
};
$ .fn.cycle.transitions.scrollLeft = function ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto');
	opts.before.push ($. fn.cycle.commonReset);
	var w = $ cont.width ();
	opts.cssFirst.left = 0;
	opts.cssBefore.left = w;
	opts.cssBefore.top = 0;
	opts.animIn.left = 0;
	opts.animOut.left = 0-w;
};
$ .fn.cycle.transitions.scrollRight = função ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto');
	opts.before.push ($. fn.cycle.commonReset);
	var w = $ cont.width ();
	opts.cssFirst.left = 0;
	opts.cssBefore.left = -w;
	opts.cssBefore.top = 0;
	opts.animIn.left = 0;
	opts.animOut.left = w;
};
$ .fn.cycle.transitions.scrollHorz = function ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto'). width ();
	opts.before.push (função (curr, next, opts, fwd) {
		if (opts.rev)
			fwd =! fwd;
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.cssBefore.left = fwd? (next.cycleW-1): (1-próximo.cycleW);
		opts.animOut.left = fwd? -curr.cycleW: curr.cycleW;
	});
	opts.cssFirst.left = 0;
	opts.cssBefore.top = 0;
	opts.animIn.left = 0;
	opts.animOut.top = 0;
};
$ .fn.cycle.transitions.scrollVert = function ($ cont, $ slides, opts) {
	$ cont.css ('estouro', 'oculto');
	opts.before.push (função (curr, next, opts, fwd) {
		if (opts.rev)
			fwd =! fwd;
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.cssBefore.top = fwd? (1-next.cycleH): (next.cycleH-1);
		opts.animOut.top = fwd? curr.cycleH: -curr.cycleH;
	});
	opts.cssFirst.top = 0;
	opts.cssBefore.left = 0;
	opts.animIn.top = 0;
	opts.animOut.left = 0;
};

// slideX / slideY
$ .fn.cycle.transitions.slideX = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ (opts.elements) .not (curr) .hide ();
		$ .fn.cycle.commonReset (curr, next, opts, false, true);
		opts.animIn.width = next.cycleW;
	});
	opts.cssBefore.left = 0;
	opts.cssBefore.top = 0;
	opts.cssBefore.width = 0;
	opts.animIn.width = 'show';
	opts.animOut.width = 0;
};
$ .fn.cycle.transitions.slideY = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ (opts.elements) .not (curr) .hide ();
		$ .fn.cycle.commonReset (curr, next, opts, true, false);
		opts.animIn.height = next.cycleH;
	});
	opts.cssBefore.left = 0;
	opts.cssBefore.top = 0;
	opts.cssBefore.height = 0;
	opts.animIn.height = 'show';
	opts.animOut.height = 0;
};

// shuffle
$ .fn.cycle.transitions.shuffle = função ($ cont, $ slides, opts) {
	var i, w = $ cont.css ('estouro', 'visível'). width ();
	$ slides.css ({esquerda: 0, topo: 0});
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, true, true);
	});
	// apenas ajuste a velocidade uma vez!
	if (! opts.speedAdjusted) {
		opts.speed = opts.speed / 2; // shuffle tem 2 transições
		opts.speedAdjusted = true;
	}
	opts.random = 0;
	opts.shuffle = opts.shuffle || {left: -w, top: 15};
	opts.els = [];
	para (i = 0; i <$ slides.length; i ++)
		opts.els.push ($ slides [i]);

	para (i = 0; i <opts.currSlide; i ++)
		opts.els.push (opts.els.shift ());

	// transição personalizada fn (gorjeta de chapéu para Benjamin Sterling por este pouco de doçura!)
	opts.fxFn = função (curr, next, opts, cb, fwd) {
		if (opts.rev)
			fwd =! fwd;
		var $ el = fwd? $ (curr): $ (próximo);
		$ (próximo) .css (opts.cssBefore);
		var count = opts.slideCount;
		$ el.animate (opts.shuffle, opts.speedIn, opts.easeIn, function () {
			var hops = $ .fn.cycle.hopsFromLast (opts, fwd);
			para (var k = 0; k <hops; k ++) {
				if (fwd)
					opts.els.push (opts.els.shift ());
				outro
					opts.els.unshift (opts.els.pop ());
			}
			if (fwd) {
				para (var i = 0, len = opts.els.length; i <len; i ++)
					$ (opts.els [i]). css ('z-index', len-i + count);
			}
			outro {
				var z = $ (curr) .css ('z-index');
				$ el.css ('z-index', parseInt (z, 10) + 1 + contagem);
			}
			$ el.animate ({left: 0, top: 0}, opts.speedOut, opts.easeOut, function () {
				$ (fwd? this: curr) .hide ();
				if (cb) cb ();
			});
		});
	};
	$ .extend (opts.cssBefore, {display: 'block', opacidade: 1, superior: 0, esquerda: 0});
};

// turnup / baixo / esquerda / direita
$ .fn.cycle.transitions.turnUp = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, false);
		opts.cssBefore.top = next.cycleH;
		opts.animIn.height = next.cycleH;
		opts.animOut.width = next.cycleW;
	});
	opts.cssFirst.top = 0;
	opts.cssBefore.left = 0;
	opts.cssBefore.height = 0;
	opts.animIn.top = 0;
	opts.animOut.height = 0;
};
$ .fn.cycle.transitions.turnDown = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, false);
		opts.animIn.height = next.cycleH;
		opts.animOut.top = curr.cycleH;
	});
	opts.cssFirst.top = 0;
	opts.cssBefore.left = 0;
	opts.cssBefore.top = 0;
	opts.cssBefore.height = 0;
	opts.animOut.height = 0;
};
$ .fn.cycle.transitions.turnLeft = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, false, true);
		opts.cssBefore.left = next.cycleW;
		opts.animIn.width = next.cycleW;
	});
	opts.cssBefore.top = 0;
	opts.cssBefore.width = 0;
	opts.animIn.left = 0;
	opts.animOut.width = 0;
};
$ .fn.cycle.transitions.turnRight = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, false, true);
		opts.animIn.width = next.cycleW;
		opts.animOut.left = curr.cycleW;
	});
	$ .extend (opts.cssBefore, {top: 0, left: 0, largura: 0});
	opts.animIn.left = 0;
	opts.animOut.width = 0;
};

// zoom
$ .fn.cycle.transitions.zoom = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, falso, falso, verdadeiro);
		opts.cssBefore.top = next.cycleH / 2;
		opts.cssBefore.left = next.cycleW / 2;
		$ .extend (opts.animIn, {top: 0, left: 0, largura: next.cycleW, height: next.cycleH});
		$ .extend (opts.animOut, {largura: 0, altura: 0, superior: curr.cycleH / 2, esquerda: curr.cycleW / 2});
	});
	opts.cssFirst.top = 0;
	opts.cssFirst.left = 0;
	opts.cssBefore.width = 0;
	opts.cssBefore.height = 0;
};

// fadeZoom
$ .fn.cycle.transitions.fadeZoom = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, falso, falso);
		opts.cssBefore.left = next.cycleW / 2;
		opts.cssBefore.top = next.cycleH / 2;
		$ .extend (opts.animIn, {top: 0, left: 0, largura: next.cycleW, height: next.cycleH});
	});
	opts.cssBefore.width = 0;
	opts.cssBefore.height = 0;
	opts.animOut.opacity = 0;
};

// blindX
$ .fn.cycle.transitions.blindX = function ($ cont, $ slides, opts) {
	var w = $ cont.css ('estouro', 'oculto'). width ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.animIn.width = next.cycleW;
		opts.animOut.left = curr.cycleW;
	});
	opts.cssBefore.left = w;
	opts.cssBefore.top = 0;
	opts.animIn.left = 0;
	opts.animOut.left = w;
};
// cego
$ .fn.cycle.transitions.blindY = function ($ cont, $ slides, opts) {
	var h = $ cont.css ('estouro', 'oculto'). height ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.animIn.height = next.cycleH;
		opts.animOut.top = curr.cycleH;
	});
	opts.cssBefore.top = h;
	opts.cssBefore.left = 0;
	opts.animIn.top = 0;
	opts.animOut.top = h;
};
// blindZ
$ .fn.cycle.transitions.blindZ = função ($ cont, $ slides, opts) {
	var h = $ cont.css ('estouro', 'oculto'). height ();
	var w = $ cont.width ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.animIn.height = next.cycleH;
		opts.animOut.top = curr.cycleH;
	});
	opts.cssBefore.top = h;
	opts.cssBefore.left = w;
	opts.animIn.top = 0;
	opts.animIn.left = 0;
	opts.animOut.top = h;
	opts.animOut.left = w;
};

// growX - cresce horizontalmente a partir da largura 0 centralizada
$ .fn.cycle.transitions.growX = função ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, false, true);
		opts.cssBefore.left = this.cycleW / 2;
		opts.animIn.left = 0;
		opts.animIn.width = this.cycleW;
		opts.animOut.left = 0;
	});
	opts.cssBefore.top = 0;
	opts.cssBefore.width = 0;
};
// growY - cresce verticalmente a partir da altura 0 centralizada
$ .fn.cycle.transitions.growY = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, false);
		opts.cssBefore.top = this.cycleH / 2;
		opts.animIn.top = 0;
		opts.animIn.height = this.cycleH;
		opts.animOut.top = 0;
	});
	opts.cssBefore.height = 0;
	opts.cssBefore.left = 0;
};

// curtainX - espremer nas duas bordas horizontalmente
$ .fn.cycle.transitions.curtainX = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, falso, verdadeiro, verdadeiro);
		opts.cssBefore.left = next.cycleW / 2;
		opts.animIn.left = 0;
		opts.animIn.width = this.cycleW;
		opts.animOut.left = curr.cycleW / 2;
		opts.animOut.width = 0;
	});
	opts.cssBefore.top = 0;
	opts.cssBefore.width = 0;
};
// curtainY - aperte em ambas as bordas verticalmente
$ .fn.cycle.transitions.curtainY = function ($ cont, $ slides, opts) {
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, verdadeiro, falso, verdadeiro);
		opts.cssBefore.top = next.cycleH / 2;
		opts.animIn.top = 0;
		opts.animIn.height = next.cycleH;
		opts.animOut.top = curr.cycleH / 2;
		opts.animOut.height = 0;
	});
	opts.cssBefore.height = 0;
	opts.cssBefore.left = 0;
};

// cover - slide da moeda coberto pelo próximo slide
$ .fn.cycle.transitions.cover = function ($ cont, $ slides, opts) {
	var d = opts.direction || 'esquerda';
	var w = $ cont.css ('estouro', 'oculto'). width ();
	var h = $ cont.height ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts);
		opts.cssAfter.display = '';
		if (d == 'right')
			opts.cssBefore.left = -w;
		else if (d == 'up')
			opts.cssBefore.top = h;
		else if (d == 'down')
			opts.cssBefore.top = -h;
		outro
			opts.cssBefore.left = w;
	});
	opts.animIn.left = 0;
	opts.animIn.top = 0;
	opts.cssBefore.top = 0;
	opts.cssBefore.left = 0;
};

// descobrir - slide slide desliga próximo slide
$ .fn.cycle.transitions.uncover = function ($ cont, $ slides, opts) {
	var d = opts.direction || 'esquerda';
	var w = $ cont.css ('estouro', 'oculto'). width ();
	var h = $ cont.height ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, true, true);
		if (d == 'right')
			opts.animOut.left = w;
		else if (d == 'up')
			opts.animOut.top = -h;
		else if (d == 'down')
			opts.animOut.top = h;
		outro
			opts.animOut.left = -w;
	});
	opts.animIn.left = 0;
	opts.animIn.top = 0;
	opts.cssBefore.top = 0;
	opts.cssBefore.left = 0;
};

// lance - mova o slide superior e desapareça
$ .fn.cycle.transitions.toss = function ($ cont, $ slides, opts) {
	var w = $ cont.css ('estouro', 'visível'). width ();
	var h = $ cont.height ();
	opts.before.push (function (curr, next, opts) {
		$ .fn.cycle.commonReset (curr, next, opts, true, true, true);
		// fornece configurações de lance padrão se animOut não for fornecido
		if (! opts.animOut.left &&! opts.animOut.top)
			$ .extend (opts.animOut, {left: w * 2, top: -h / 2, opacidade: 0});
		outro
			opts.animOut.opacity = 0;
	});
	opts.cssBefore.left = 0;
	opts.cssBefore.top = 0;
	opts.animIn.left = 0;
};

// limpe - animação de clipe
$ .fn.cycle.transitions.wipe = function ($ cont, $ slides, opts) {
	var w = $ cont.css ('estouro', 'oculto'). width ();
	var h = $ cont.height ();
	opts.cssBefore = opts.cssBefore || {};
	var clip;
	if (opts.clip) {
		if (/l2r/.test(opts.clip))
			clip = 'rect (0px 0px' + h + 'px 0 px)';
		else if (/r2l/.test(opts.clip))
			clip = 'rect (0px' + w + 'px' + h + 'px' + w + 'px)';
		else if (/t2b/.test(opts.clip))
			clip = 'rect (0px' + w + 'px 0 px x px)';
		else if (/b2t/.test(opts.clip))
			clip = 'rect (' + h + 'px' + w + 'px' + h + 'px 0 px)';
		else if (/zoom/.test(opts.clip)) {
			var top = parseInt (h / 2,10);
			var à esquerda = parseInt (c / 2,10);
			clip = 'rect (' + topo + 'px' + esquerda + 'px' + topo + 'px' + esquerda + 'px)';
		}
	}

	opts.cssBefore.clip = opts.cssBefore.clip || clipe || 'rect (0px 0px 0px 0px)';

	var d = opts.cssBefore.clip.match (/ (\ d +) / g);
	var t = parseInt (d [0], 10), r = parseInt (d [1], 10), b = parseInt (d [2], 10), l = parseInt (d [3], 10);

	opts.before.push (function (curr, next, opts) {
		if (curr == next) retornar;
		var $ curr = $ (curr), $ next = $ (próximo);
		$ .fn.cycle.commonReset (curr, next, opts, verdadeiro, verdadeiro, falso);
		opts.cssAfter.display = 'bloquear';

		var step = 1, count = parseInt ((opts.speedIn / 13), 10) - 1;
		(função f () {
			var tt = t? t - parseInt (passo * (t / contagem), 10): 0;
			var ll = l? l - parseInt (passo * (l / contagem), 10): 0;
			var bb = b <h? b + parseInt (passo * ((hb) / contagem || 1), 10): h;
			var rr = r <w? r + parseInt (passo * ((wr) / contagem || 1), 10): w;
			$ next.css ({clip: 'rect (' + tt + 'px' + rr + 'px' + bb + 'px' + ll + 'px)'});
			(passo ++ <= contagem)? setTimeout (f, 13): $ curr.css ('display', 'nenhum');
		}) ();
	});
	$ .extend (opts.cssBefore, {display: 'block', opacidade: 1, superior: 0, esquerda: 0});
	opts.animIn = {esquerda: 0};
	opts.animOut = {esquerda: 0};
};

}) (jQuery);