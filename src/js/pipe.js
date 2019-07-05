(function(root, factory) {
	root['pipe'] = factory();
})(this, function() {

	let _config = null;
	let _callback_monitor = null;
	let _is_preview = false;
	let _pagewidth = 750;
	let _ratio = 1;

	function Storage(configuration) {
		this.__config = configuration;
		this.__listener = null;
		this.__monitor = null;

		this.get = function(key) {
			return this.__config[key];
		}
		this.save = function(key, value, origin) {
			this.__config[key] = value;

			if (this.__listener && origin === 'configer') {
				this.__listener(key, value);
			}
			if (this.__monitor && origin === 'drager') {
				this.__monitor(key, value);
			}
		}
		// 配置平台监听
		this.listener = function(cb) {
			if (cb && typeof cb === 'function') {
				this.__listener = cb;
			}
		}
		// 拖拽平台监听
		this.monitor = function(cb) {
			if (cb && typeof cb === 'function') {
				this.__monitor = cb;
			}
		}
	}
	

	function addScript(path) {
		$('<script>', {
			src: path
		}).appendTo('body');
	}

	function addCss(path) {
		$('<link>', {
			rel: 'stylesheet',
			href: path
		}).appendTo('head');
	}

	function createEl(el) {
		if (el && el.type && el.type === 'img') {
			const props = {
				src: el.image
			}
			if (!_is_preview) {
				props['data-index'] = el.__name;
			}
			const img = $('<img>', props).css({
				width: '100%',
				cursor: 'grabbing'
			})
			return img;
		} else if (el && el.type && el.type === 'button') {
			const css = {
				cursor: 'pointer',
				position: 'absolute',
				top: el.position.top * _ratio + 'px',
				left: el.position.left * _ratio + 'px'
			};
			const props = {};
			if (_is_preview) {
				props.click = () => {
					if (el.action === 'app') {
						alert(el.url);
					} else if (el.action === 'href') {
						alert('href');
						window.location.href = el.url;
					} else if (el.action === 'passport') {
						alert('passport');
					}
				}
			} else {
				props.class = el.__name
			}
			const a = $('<a>', props).css(css);
			const button = $('<img>', { src: el.image });
			button.appendTo(a);
			return a;
		} else if (el && el.type && el.type === 'top-banner') {
			const css = {};
			if (el.action) {
				css.cursor = 'pointer';
			}
			const img = $('<img>', {
				src: el.image,
				class: 'swiper-slide'
			}).css(css);
			return img;
		} else if (el && el.type && el.type === 'bottom-banner') {
			const css = {};
			if (el.action) {
				css.cursor = 'pointer';
			}
			const img = $('<img>', {
				src: el.image,
				class: 'swiper-slide'
			}).css(css);
			return img;
		}
	}

	// 由配置对象生成页面
	function renderNode(_key, obj) {
		if (_key === 'title') {
			document.title = obj;
		} else if (_key === 'activeRule') {
			if (obj === true) {
				
			}
		} else if (_key === 'share') {
			
		} else if (_key === 'contents') {
	 		$('#the-contents').empty();
			$('<div>', {
				id: 'the-contents',
			}).appendTo('#the-current-page');
			for (let k in obj) {
				const node = obj[k];
				node.__name = k; 
				const el = createEl(node);
				delete node.__name;
				el.appendTo('#the-contents');
			}
		} else if (_key === 'buttons') {
			$('#the-buttons').empty();
			$('<div>', {
				id: 'the-buttons'
			}).appendTo('#the-current-page');
			for (let k in obj) {
				const node = obj[k];
				node.__name = 'btn__' + k; 
				const el = createEl(node);
				delete node.__name;
				el.appendTo('#the-buttons');
			}
		} else if (_key === 'topBanner') {
			$('#the-top-banners').remove();
			if (obj && obj.length) {
				const css = {
					top: 0,
					left: 0,
					width: _pagewidth + 'px'
				}
				if (_is_preview) {
					css.position = 'fixed';
				} else {
					css.position = 'absolute';
				}
				$('<div>', {
					id: 'the-top-banners',
					class: 'swiper-container'
				}).css(css).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-top-banner-wrapper',
					class: 'swiper-wrapper'
				}).appendTo('#the-top-banners');
			}
			for (let k in obj) {
				const target = obj[k];
				target.type = 'top-banner';
				const el = createEl(target);
				el.appendTo('#the-top-banner-wrapper');
			}
		} else if (_key === 'bottomBanner') {
			$('#the-bottom-banners').remove();
			if (obj && obj.length) {
				const css = {
					bottom: 0,
					left: 0,
					width: _pagewidth + 'px'
				}
				if (_is_preview) {
					css.position = 'fixed';
				} else {
					css.position = 'absolute';
				}
				$('<div>', {
					id: 'the-bottom-banners',
					class: 'swiper-container'
				}).css(css).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-bottom-banner-wrapper',
					class: 'swiper-wrapper'
				}).appendTo('#the-bottom-banners');
				for (let i = 0; i < obj.length; i++) {
					const target = obj[i];
					target.type = 'bottom-banner';
					const el = createEl(target);
					el.appendTo('#the-bottom-banner-wrapper');
				}
			}
		}
	}

	function setViewPort() {
		let viewport = document.querySelector("meta[name=viewport]");
		viewport.setAttribute('content', `width=${_pagewidth || 750}, initial-scale=1.0`);
	}

	function setTopContainer() {
		$('#the-current-page').css({
			width: _pagewidth + 'px'
		})
	}

	function render(config, pagewidth, isPreview) {
		_config = config;
		_is_preview = isPreview;
		_pagewidth = pagewidth;
		_ratio = _pagewidth / (config.pagewidth || 750); // 确定页面布局比率
		setViewPort();
		setTopContainer();

		if (config.hasOwnProperty('topBanner') || config.hasOwnProperty('bottomBanner')) {
			addScript('./src/libs/swiper/swiper.animate1.0.3.min.js');
			addScript('./src/libs/swiper/swiper.js');
			addCss('./src/libs/swiper/animate.min.css');
			addCss('./src/libs/swiper/swiper.css');
		}

		// 配置平台
		if (!_is_preview) {
			addScript('./src/js/dragula.js');
			addScript('./src/js/displace.js');
		}
		for (let k in config) {
			renderNode(k, config[k])
		}
	}
	// render(_config, false);

	function setupSwiper() {
		console.log(getQueryString('kk'));
		const flag = getQueryString('kk');
		// 需要先判断是否topBanners是否存在，且数据大于1
		if (_config && _config['topBanner'] && _config['topBanner'].length) {
			const options = {
				autoplay: true,
			};
			if (_config['topBanner'].length > 1) {
				options.loop = true;
			}
			new Swiper('#the-top-banners', options);
		}
		// 需要先判断是否bottomBanners是否存在，且数据大于1
		if (_config && _config['bottomBanner'] && _config['bottomBanner'].length) {
			const options = {
				autoplay: true,
			};
			if (_config['bottomBanner'].length > 1) {
				options.loop = true;
			}
			new Swiper('#the-bottom-banners', options);
		}
	}


	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	}

	function buttonsDisplace() {
		const displace = window.displacejs;
		if (_config && _config['buttons'] && _config['buttons'].length) {
			const btns = [];
			for (let i = 0; i < _config['buttons'].length; i++) {
				btns.push('.btn__' + i);
			}
			btns.map(cls => {
				const el = document.querySelector(cls);
				displace(el, {
					onMouseDown: function () {
						// console.log(el.offsetLeft, el.offsetTop);
					},
					onMouseUp: function () {
						// 定位矫正
						if ($(el).offset().left < 0) {
							$(el).css({
								left: 0
							})
						} else if ($(el).offset().left + $(el).width() > _pagewidth) {
							$(el).css({
								left: _pagewidth - el.clientWidth
							})
						}
						if (_config && _config['topBanner'] && _config['topBanner']) {
							const topHeight = $('#the-top-banners').height();
							if ($(el).offset().top < topHeight) {
								$(el).css({
									top: topHeight
								})	
							}
						}
						if (_config && _config['bottomBanner'] && _config['bottomBanner']) {
							const bottomHeight = $('#the-bottom-banners').height();
							const contentHeight = $('#the-current-page').height();
							const maxOffsetTop = contentHeight - bottomHeight - el.clientHeight;
							if ($(el).offset().top > maxOffsetTop) {
								$(el).css({
									top: maxOffsetTop
								})
							}
						}

						const clsList = el.className.split(' ');
						const findCls = clsList.find(item => item.indexOf('btn__') > -1);
						if (findCls) {
							const tempList = findCls.split('__');
							const btnIndex = tempList[tempList.length - 1];

							const btn = _config.buttons[btnIndex];
							btn.position = {
								top: el.offsetTop,
								left: el.offsetLeft
							}
							pipe.pageEmit('buttons', _config['buttons']);
						}
					}
				})
			});
		}
	}
	function contentsDisplace() {
		const dragulable = window.dragula;
		const drake = dragulable([document.querySelector('#the-contents')], {
			moves: function (el, source, handle, sibling) {
				return true; // elements are always draggable by default
			},
			accepts: function (el, target, source, sibling) {
				return true; // elements can be dropped in any of the `containers` by default
			},
			release: function(e) { 
				// 监听鼠标谈起mouseup事件
				if (_config && _config['contents'] && _config['contents'].length) {
					const newContents = [];
					const contents = $('#the-contents').children('img');
					let isSame = true;
					for (let i = 0; i < contents.length; i++) {
						const imgIndex = $(contents[i]).attr('data-index');
						newContents.push(_config.contents[imgIndex]);

						if (_config.contents[i].image !== _config.contents[imgIndex].image) {
							isSame = false;
						}
					}
					// 对比原有数据
					if (!isSame) {
						_config.contents = newContents;
						pipe.pageEmit('contents', newContents);
						renderNode('contents', newContents); // 更新element img标签的data-index属性
					}
				}
			}
		});
	}

	$(document).ready(function() {
		setupSwiper();

		// 非预览是才可以进行拖拽配置
		if (!_is_preview) {
			buttonsDisplace();
			contentsDisplace();
		}
	})

	window.onload = function() {
		// 视图矫正
		// 1. 计算top banner和bottom banner的高度
		if (_config && _config['topBanner'] && _config['topBanner']) {
			const topHeight = $('#the-top-banners').height();
			$('#the-contents').css({
				'margin-top': topHeight
			})
		}
		if (_config && _config['bottomBanner'] && _config['bottomBanner']) {
			const bottomHeight = $('#the-bottom-banners').height();
			$('#the-contents').css({
				'margin-bottom': bottomHeight
			})
		}
		// 计算出按钮图片适配后的长宽
		if (_config && _config['buttons'] && _config['buttons'].length) {
			const buttons = $('#the-buttons').children();
			for (let i = 0; i < buttons.length; i++) {
				const btnWidth = $($(buttons[i]).children()[0]).width();
				$($(buttons[i]).children()[0]).css({
					width: btnWidth * _ratio
				})
			}
		}
	}

	// 拖拽平台修改通知到配置平台
	function pageEmit(key, obj) {
		if (_callback_monitor) {
			// 利用json stringify进行深拷贝 - 场景是由于config对象来源于json字符串
			const copyObj = JSON.parse(JSON.stringify(obj));
			_callback_monitor(key, copyObj);
		}
	}
	// 接受配置平台的消息
	function configListener(key, obj) {
		renderNode(key, obj);
	}

	// 配置平台的改动需要通知到我这边进行数据结构的修改
	function configChange(_key, _obj) {
		_config[_key] = _obj;
		if (configListener && typeof configListener === 'function') {
			configListener(_key, _obj);
		}
	}

	function monitor(fn) {
		if (fn && typeof fn === 'function') {
			_callback_monitor = fn;
		}	
	}

	const factory = {};

	function init(config) {
		let storage = new Storage(config);
		factory['storage'] = storage;
		storage.monitor(function (key, value) {
			console.log(key, value);
		})
	}

	factory['pageEmit'] = pageEmit;
	factory['configChange'] = configChange;
	factory['monitor'] = monitor;
	factory['renderDom'] = render;
	factory['init'] = init;

	return factory;
});