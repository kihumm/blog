;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	} else if (typeof define === "function" && define.amd) {
		// AMD
		define([], factory);
	} else {
		// Global (browser)
		root.myHelper = root.myHelper||{};
		root.myHelper.MusicPlayer = factory(root);
	}
}(this, function (window) {
	
	'use strict';
	
	var document = window.document;
	var $ = window.$;
	var dateHelper = window.dateHelper||window.getDateHelper();
	try{ dateHelper = window.getDateHelper(); }catch(e){ console.error('need dateHelper.js'); }
	
	var document = window.document;
	var isMobile = checkIsMobile();
	
	var namespace = 'dm-player-'
	var name = namespace+'control-';
	var meta = {
		className: {
			container: namespace+'container',
			hidden: namespace+'hidden',
			media: namespace+'media',
			
			controlContainer: namespace+'control',
			scrollContainer: name+'scroll-container',
			scroll: name+'scroll',
			scrollPointer: name+'scroll-pointer',
			scrollTouch: name+'scroll-touch',
			scrollBg: name+'scroll-bg',
			scrollBg1: name+'scroll-bg1',
			scrollBg2: name+'scroll-bg2',
			btnPlay: name+'btn-play',
			btnVolume: name+'btn-volume',
			btnSwipe: name+'btn-swipe',
			btnView: name+'btn-view',
			btnFullScreen: name+'btn-fullscreen',
			txtCurrentTime: name+'txt-current-time',
			txtTotalTime: name+'txt-total-time',
			btnMain: namespace+'btn-main',
			animShow: namespace+'anim-show',
			animHide: namespace+'anim-hide',
		},
		event: {
			tap: checkIsMobile()?'tap':'click', // click tap //click has somebug when touchmove child element
			mousedown: 'mousedown',
			mousemove: 'mousemove', 
			mouseup: 'mouseup',
			touchstart: 'touchstart', //:'mousedown',
			touchmove: 'touchmove', //:'mousemove',
			touchend: 'touchend', //:'mouseup',
			touchcancel: 'touchcancel', //:'mouseup',
			animateEnd: 'webkitTransitionEnd webkitAnimationEnd', // transitionend animationend
		},
		error: {
			'notSupportFullScreen': { msg: '您的浏览器不支持全屏!' }
		}
	};
	
	function checkIsMobile(){ return window.navigator.userAgent.match(/mobile/i); }
	
	function merge(){ 
		if(arguments.length<1)return;
		var dst = arguments[0];
		for(var i = 1; i<arguments.length; i++){
			var src = arguments[i];
			for(var key in src){
				dst[key] = src[key];
			}
		}
		return dst;
	}
	
	function isNull(value){ return value===undefined||value===null; }
	function ifNull(value, def){ return isNull(value)?def:value; }
	
	// dom
	function createElement(options){
		options = options||{};
		var elementType = options.elementType||'div';
		var id = options.id;
		var className = options.className;
		var element = document.createElement(elementType);
		setAttribute(element, 'id', id);
		setAttribute(element, 'class', className);
		return element;
	}
	function setAttribute(element, attr, value){ if(value!==undefined){ element.setAttribute(attr, value); } }
	function addAttribute(element, attr, value){ if(value===true){ setAttribute(element, attr, ''); } }
	function addClass(element, className){ element.classList.add(className); }
	function removeClass(element, className){ element.classList.remove(className); }
	function hasClass(element, className){ return element.classList.contains(className); }
	function getParentElements(container, elem){
		var result = [];
		for(var i = elem.parentNode; i!==container; i=i.parentNode){
			result.push(i);
		}
	}
	function isVisible(elem){
		return elem.style.display !== 'none'&&elem.style.visibility !== 'hidden'&&elem.style.opacity !== '0';
	}
	function isHidden(elem){
		return !isVisible(elem) ||
			isVisible(elem) &&
			(function(){
				var elements = getParentElements( elem.ownerDocument, elem );
				var result = false;
				for(var i in elements){
					if(!isVisible(elements[i])){
						result = true;
						break;
					}
				}
				return result;
			}());
	}
	function showElement(elem){ elem.style.display = ''; }
	function hideElement(elem){ elem.style.display = 'none'; }
	
	//event
	function on(){
		//touch.on.apply(touch, arguments);
		var element = arguments[0];
		var eventList = (arguments[1]||'').split(/\s/);
		var param = Array.prototype.slice.call(arguments, 2);
		for(var i = 0; i<eventList.length; i++){ 
			element.addEventListener.apply(element, [eventList[i]].concat(param)); 
		}
	}
	function off(){
		var element = arguments[0];
		var eventList = (arguments[1]||'').split(/\s/);
		var param = Array.prototype.slice.call(arguments, 2);
		for(var i = 0; i<eventList.length; i++){ 
			element.removeEventListener.apply(element, [eventList[i]].concat(param)); 
		}
	}

	var dom = {
		createElement: createElement,
		setAttribute: setAttribute,
		addAttribute: addAttribute,
		addClass: addClass,
		removeClass: removeClass,
		hasClass: hasClass,
		showElement: showElement,
		hideElement: hideElement,
		isHidden: isHidden,
		
		on: on,
		off: off,
	};
	
	function isShowing(element){ return dom.hasClass(element, meta.className.animShow); }
	function isHiding(element){ return dom.hasClass(element, meta.className.animHide); }
	function showAnim(element){
		var target = element;
		var className = meta.className.animShow;
		if(isShowing(target))return;
		hideAnimEnd.call(target);
		dom.showElement(target);
		dom.addClass(target, className);
		dom.on(target, meta.event.animateEnd, showAnimEnd, false);
	}
	function showAnimEnd(){
		var target = this;
		var className = meta.className.animShow;
		dom.removeClass(target, className);
		dom.off(target, meta.event.animateEnd, showAnimEnd, false);
		//alert('showAnimEnd: '+target.className);
	}
	function hideAnim(element){
		var target = element;
		var className = meta.className.animHide;
		if(isHiding(target))return;
		showAnimEnd.call(target);
		dom.addClass(target, className);
		dom.on(target, meta.event.animateEnd, hideAnimEnd, false);
	}
	function hideAnimEnd(){
		var target = this;
		var className = meta.className.animHide;
		dom.removeClass(target, className);
		dom.hideElement(target);
		dom.off(target, meta.event.animateEnd, hideAnimEnd, false);
		//alert('hideAnimEnd: '+target.className);
	}
	
	
	function MusicPlayer(){ this.init.apply(this, arguments); }
	MusicPlayer.prototype = {
		constructor: MusicPlayer,
		init: function(options){
			var self = this;
			//this._super();
			options = merge({
				selector: null,
				media: null,
				event: {},
			}, options);
			var selectorOptions = merge({
				container: '.dm-m-player-bar',
				media: '.dm-m-player-media',
				
			}, options.selector);
			var mediaAttrs = merge({
				'controls': true,
				'webkit-playsinline': true,
				'playsinline': true,
				'x5-video-player-type': 'h5',
				'preload': true,
			}, options.media);
			
			var container = self.container = $(selectorOptions.container);
			var media = self.media = $(selectorOptions.media).get(0);
			var wrapper = self.wrapper = container.find('.dm-player-wrap');
			var btnPlay = self.btnPlay = wrapper.find('.dm-player-wrap-btns').find('.ply');
			var playContainer = self.playContainer = wrapper.find('.dm-player-wrap-play');
			var playTitleContainer = self.playTitleContainer = playContainer.find('.dm-player-wrap-play-words');
			var playProgressbarContainer = self.playProgressbarContainer = playContainer.find('.dm-player-pbar');
			var playProgressbarBg = self.playProgressbarBg = playProgressbarContainer.find('.barbg');
			var playProgressbarRdy = self.playProgressbarRdy = playProgressbarContainer.find('.rdy');
			var playProgressbarCur = self.playProgressbarCur = playProgressbarContainer.find('.cur');
			var playProgressbarPtr = self.playProgressbarPtr = playProgressbarContainer.find('.ptr');
			var playProgressbarDurText = self.playProgressbarDurText = playProgressbarContainer.find('.dm-player-pbar-dur-text');
			var playProgressbarCurText = self.playProgressbarCurText = playProgressbarContainer.find('.dm-player-pbar-cur-text');
			var volContainer = self.volContainer = wrapper.find('.dm-player-vol');
			var volBg = self.volBg = volContainer.find('.vbg');
			var volCur = self.volCur = volContainer.find('.curr');
			var volPtr = self.volPtr = volContainer.find('.btn');
			
			for(var name in mediaAttrs){ 
				var attr = mediaAttrs[name];
				if(typeof attr === 'boolean')dom.addAttribute(media,name,attr);
				else dom.setAttribute(media,name,attr);
			}
			
			self.status = self.status||{};
			
			self.bind(options.event);
		},
		bind: function(param){
			var self = this;
			var controlContainer = self.playProgressbarContainer.get(0);
			var scroll = self.playProgressbarBg.get(0);
			var scrollPointer = self.playProgressbarPtr.get(0);
			var volumeContainer = self.volContainer.get(0);
			var volBg = self.volBg.get(0);
			var volCur = self.volCur.get(0);
			var volPtr = self.volPtr.get(0);
			var btnMain = self.btnPlay.get(0);
			var btnPlay = self.btnPlay.get(0);
			
			dom.on(controlContainer, meta.event.tap, function(e){ e.stopPropagation(); });
			dom.on(btnMain, meta.event.tap, handlePlayBtnTap);
			dom.on(btnPlay, meta.event.tap, handlePlayBtnTap);
			dom.on(scroll, meta.event.tap, handleScrollTap);
			dom.on(scrollPointer, meta.event.tap, function(e){ e.stopPropagation(); });
			
			if(checkIsMobile()){
				dom.on(scrollPointer, meta.event.touchstart, handleScrollPointerTouchstart);
				dom.on(scrollPointer, meta.event.touchmove, handleScrollPointerTouchmove);
				dom.on(scrollPointer, meta.event.touchend, handleScrollPointerTouchend);
				dom.on(scrollPointer, meta.event.touchcancel, handleScrollPointerTouchcancel);
			}else{
				dom.on(scrollPointer, meta.event.mousedown, handleScrollPointerTouchstart);
				dom.on(document, meta.event.mousemove, handleScrollPointerTouchmove);
				dom.on(document, meta.event.mouseup, handleScrollPointerTouchend);
			}
			
			dom.on(self.container.find('[data-action="volume"]').get(0), meta.event.tap, handlevolumeDisplayTap);
			dom.on(volBg, meta.event.tap, handlevolumeChangeTap);
			dom.on(volCur, meta.event.tap, function(e){ e.stopPropagation(); });
			
			function handlePlayBtnTap(e){
				e.stopPropagation();
				if(self.status.isTouchPointer)return;
				var target = btnPlay;
				if(dom.hasClass(target, 'pas')){
					self.pause();
				}else{
					self.play();
				}
				if(typeof param.handlePlay === 'function')param.handlePlay.call(this, e, self); 
			}
			
			function handleScrollTap(e){
				e.stopPropagation();
				if(self.status.isTouchPointer)return;
				var progress = self.status.progress;
				//var x = e.x||e.pageX;
				//var width = x - scroll.offsetLeft;
				var width = e.offsetX; ////e.offsetX; e.detail.position.x;
				if(isNull(width)){
					var pageX = e.detail.position.x;
					var parentBounds = this.getBoundingClientRect();
					width = pageX - parentBounds.left;
				} 
				var total = scroll.offsetWidth||1;
				progress = width/total;
				progress = Math.min(Math.max(0, progress), 1);
				
				self.status.progress = progress;
				if(typeof param.handleChangeProgress === 'function'){
					var result = param.handleChangeProgress.call(this, e, self);
					if(result)self.updatePlayStatus(progress);
				}else{ self.updatePlayStatus(progress); }
				self.moveTo(progress);  //
			}
			
			function handleScrollPointerTouchstart(e){ 
				e.stopPropagation();
				self.status.isTouchPointer = true;
				self.status.originProgress = self.status.progress;
				if(typeof param.handleTouchPointerStart === 'function'){
					self.status.isTouchPointer = ifNull(param.handleTouchPointerStart.call(this, e, self), self.status.isTouchPointer); 
				}
			}
			function handleScrollPointerTouchmove(e){ 
				e.stopPropagation();
				if(self.status.isTouchPointer){
					var progress = self.status.progress;
					var x = e.type=='touchmove'?e.touches[0].pageX:e.pageX;
					var rect = scroll.getBoundingClientRect();
					var width = x - rect.left;
					var total = scroll.offsetWidth||1;
					progress = width/total;
					progress = Math.min(Math.max(0, progress), 1);
					self.status.progress = progress;
					self.updatePlayStatus(progress);
					if(typeof param.handleTouchPointerMove === 'function')param.handleTouchPointerMove.call(this, e, self); 
				}
			}
			function handleScrollPointerTouchend(e){ 
				e.stopPropagation();
				if(self.status.isTouchPointer){
					if(typeof param.handleTouchPointerEnd === 'function')param.handleTouchPointerEnd.call(this, e, self); 
					var progress;
					if(typeof param.handleChangeProgress === 'function'){
						var result = param.handleChangeProgress.call(this, e, self);
						if(result)progress = self.status.progress; 
						else progress = self.status.originProgress; 
					}else{ progress = self.status.progress; }
					self.status.progress = progress;
					self.updatePlayStatus(progress);
					self.status.isTouchPointer = false;
					self.moveTo(progress);  //
				}
			}
			function handleScrollPointerTouchcancel(e){ 
				self.status.isTouchPointer = false;
			}
			
			function handlevolumeDisplayTap(e){ 
				var target = self.volContainer.get(0);
				if(target.style.visibility === 'hidden'){
					target.style.visibility = 'visible';
				}else{
					target.style.visibility = 'hidden';
				}
			}
			function handlevolumeChangeTap(e){ 
				e.stopPropagation();
				var progress = self.status.volume;
				var height = e.offsetY; ////e.offsetX; e.detail.position.x;
				if(isNull(height)){
					var pageY = e.detail.position.y;
					var parentBounds = this.getBoundingClientRect();
					height = pageY - parentBounds.top;
				} 
				var total = volBg.offsetHeight||1;
				progress = height/total;
				progress = 1 - Math.min(Math.max(0, progress), 1);
				self.changevolume(progress);
			}
			
			var media = self.media;
			// loadstart progress suspend abort durationchange loadedmetadata canplaythrough
			dom.on(media, 'loadstart progress suspend abort durationchange loadedmetadata canplaythrough', function(e){
				self.updatePlayerStatus();
				console.log(e.type, media.readyState, media.currentTime);
			});
			
			dom.on(media, 'ended', function(e){
				self.updatePlayerStatus();
				self.setControlStatus('ended');
				console.log(e.type, media.readyState, media.currentTime);
			});
			dom.on(media, 'volumechange', function(e){
				//console.log(e.type, this.volume, media.muted);
				self.updateVolStatus(this.volume);
			});
			
			dom.on(media, 'timeupdate', function(e){
				self.updatePlayerStatus();
			});
		},
		getSeekableRange: function(){
			var self = this;
			var media = self.media;
			var seekable = media.seekable;
			var length = seekable.length;
			var result = {
				startTime: 0,
				endTime: 0
			};
			if(length){
				result.startTime = seekable.start(0);
				result.endTime = seekable.end(length-1);
			}
			return result;
		},
		setMedia: function(options){
			var self = this;
			var src = options.src;
			var link = options.link;
			var title = options.title;
			var playTitleContainer = self.playTitleContainer;
			var array = [];
			array.push('<a hidefocus="true" href="'+link+'" class="f-thide name f-fl" title="'+title+'">'+title+'</a>');
			playTitleContainer.html(array.join(''));
			array = [];
			
			self.setSrc(src);
			self.play();
		},
		setControlStatus: function(status){
			var self = this;
			if(status=='init'){
				self.isPlaying = false;
				self.btnPlay.removeClass('pas');
			}else if(status=='playing'){
				self.isPlaying = true;
				self.btnPlay.addClass('pas');
			}else if(status=='paused'){
				self.isPlaying = false;
				self.btnPlay.removeClass('pas');
			}else if(status=='ended'){
				self.isPlaying = false;
				self.btnPlay.removeClass('pas');
			}
		},
		
		setSrc: function(src){
			var self = this;
			self.media.src = src;
		},
		play: function(){
			var self = this;
			self.setControlStatus('playing');
			self.media.play();
		},
		pause: function(){
			var self = this;
			self.setControlStatus('paused');
			self.media.pause();
		},
		moveTo: function(progress){
			var self = this;
			var media = self.media;
			var duration = media.duration;
			var currentTime = duration*progress; //Math.floor(duration*progress)
			var seekable = self.getSeekableRange();
			if(currentTime>=seekable.startTime&&currentTime<=seekable.endTime){
				media.pause(); //This is import before set currentTime
				media.currentTime = currentTime;
				if(self.isPlaying)self.play();
				return true;
			}else{
				return false;
			}
		},
		changevolume: function(progress){
			var self = this;
			var media = self.media;
			media.volume = Math.floor(progress * 10) / 10;
			self.updateVolStatus(progress);
		},
		// control
		updateVolStatus: function(progress){ this.volCur.get(0).style.height = progress*100 + '%'; },
		updateLoadStatus: function(progress){ this.playProgressbarRdy.get(0).style.width = progress*100 + '%'; },
		updatePlayStatus: function(progress){ this.playProgressbarCur.get(0).style.width = progress*100 + '%'; },
		updateCurrentTimeText: function(text){ this.playProgressbarCurText.get(0).innerHTML = text },
		updateTotalTimeText: function(text){ this.playProgressbarDurText.get(0).innerHTML = text },
		updatePlayerStatus: function(deltaTime){
			var self = this;
			var media = self.media;
			var control = self;
			if(control.status.isTouchPointer)return;
			
			if(media.readyState < media.HAVE_METADATA){
				//self.control.initStatus();
				return;
			}
			
			var currentTime = media.currentTime||0;
			var duration = media.duration||1;
			var buffered = media.buffered;
			var bufferedSize = buffered.length;
			var currentBuffer = bufferedSize===0?0:buffered.end(bufferedSize-1);
			
			var loadProgress = Math.floor( currentBuffer/duration*10000 )/10000;
			self.updateLoadStatus(loadProgress);
			
			var playProgress = Math.floor( currentTime/duration*10000 )/10000;
			self.updatePlayStatus(playProgress);
			
			var currentStr = dateHelper.durationToStr(currentTime*1000, 'hh:mm:ss', 'hh');
			var durationStr = dateHelper.durationToStr(duration*1000, 'hh:mm:ss', 'hh');
			self.updateCurrentTimeText(currentStr);
			self.updateTotalTimeText(durationStr);
		}
	}

	return MusicPlayer
}));